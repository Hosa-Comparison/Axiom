const fs = require('fs');
const path = require('path');
const pc = require('picocolors');

function readAxiomFile(filePath) {
  try {
    const absolutePath = path.resolve(process.cwd(), filePath);
    
    const stats = fs.statSync(absolutePath);
    if (stats.isDirectory()) {
      console.error(pc.red(`Error: ${pc.bold(filePath)} is a directory, not a file.`));
      return null;
    }

    return fs.readFileSync(absolutePath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(pc.red(`Error: File not found at ${pc.bold(filePath)}`));
    } else {
      console.error(pc.red(`Error reading file: ${err.message}`));
    }
    return null;
  }
}

module.exports = { readAxiomFile };