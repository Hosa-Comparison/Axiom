#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const pkg = require('./package.js');
const { readAxiomFile } = require('./file-handler.js'); 
const pc = require('picocolors');
const Lexer = require('./lexer.js');
const Parser = require('./parser.js');
const Interpreter = require('./interpreter.js');

const suffix = process.env.NODE_ENV === 'production' ? '' : ' (dev-build)';

program
  .name('axiom-cli')
  .description('The Axiom CLI.')
  .version(`Axiom ${pkg.version}${suffix}`, '-v, --version');

program
  .command('run')
  .description('Run a .axiom file.')
  .argument('<file>', 'The .axiom file to execute')
  .action((file) => {
    const source = readAxiomFile(file);
    if (source !== null) {
      const lexer = new Lexer(source);
      const tokens = lexer.tokenize();

      const parser = new Parser(tokens);
      const ast = parser.parse();

      const interpreter = new Interpreter(readAxiomFile, Lexer, Parser);
      interpreter.execute(ast);
    } else {
      process.exit(1);
    }
  });

program.parse();
const options = program.opts();