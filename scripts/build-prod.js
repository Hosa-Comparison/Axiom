const { execSync } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const foldersToProcess = ['cli', 'lib']; 
const distDir = path.join(__dirname, '../dist');
const backupDir = path.join(__dirname, '../backup_' + Date.now());

async function build() {
  try {
    // --- SAFETY CHECK: GIT STATUS ---
    console.log('🔍 Checking Git status...');
    try {
      const status = execSync('git status --porcelain').toString();
      if (status.length > 0) {
        console.error('\n❌ ERROR: Uncommitted changes detected!');
        console.error('Please commit your readable code before running the build to avoid data loss.');
        process.exit(1);
      }
    } catch (e) {
      console.log('⚠️ Not a git repository or git not found. Proceeding with caution...');
    }

    console.log('🚀 Starting Production Build...');

    // 1. Create Dist and Backup directories
    if (fs.existsSync(distDir)) fs.removeSync(distDir);
    fs.ensureDirSync(distDir);
    fs.ensureDirSync(backupDir);

    for (const folder of foldersToProcess) {
      const srcPath = path.join(__dirname, '../', folder);
      const distPath = path.join(distDir, folder);
      const backupPath = path.join(backupDir, folder);

      if (!fs.existsSync(srcPath)) {
        console.log(`skipping ${folder} (not found)`);
        continue;
      }

      // 2. Backup original files
      console.log(`📦 Backing up: ${folder}`);
      fs.copySync(srcPath, backupPath);
      fs.ensureDirSync(distPath);

      // 3. Terser each file into the dist folder
      const files = fs.readdirSync(srcPath).filter(f => f.endsWith('.js'));
      for (const file of files) {
        const input = path.join(srcPath, file);
        const output = path.join(distPath, file);
        
        console.log(`  ⚡ Minifying: ${folder}/${file}`);
        
        // ADDED: --mangle reserved=[...]
        // This ensures external calls like .parse() and .tokenize() don't break.
        const reserved = "reserved=['tokenize','parse','execute','readAxiomFile','variables','errors']";
        execSync(`npx terser "${input}" --compress --mangle ${reserved} -o "${output}"`);
      }

      // 4. Move minified files back to original folder
      // We empty the source first to ensure a clean swap
      fs.emptyDirSync(srcPath);
      fs.copySync(distPath, srcPath);

      // Restore executable permissions for the CLI
      if (folder === 'cli') {
        fs.readdirSync(srcPath).forEach(f => {
          fs.chmodSync(path.join(srcPath, f), '755');
        });
      }
    }

    // 5. Cleanup dist
    fs.removeSync(distDir);
    
    console.log('\n✅ Build Successful!');
    console.log(`📂 Originals backed up to: ${backupDir}`);
    console.log('💡 If things break, run: npm run restore (or check the backup folder)');
    
  } catch (err) {
    console.error('\n❌ Build failed:', err.message);
    process.exit(1);
  }
}

build();