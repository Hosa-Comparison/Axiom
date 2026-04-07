const pc = require('picocolors');

class Interpreter {
  constructor(readAxiomFile, Lexer, Parser) {
    this.readAxiomFile = readAxiomFile;
    this.Lexer = Lexer;
    this.Parser = Parser;
    
    this.variables = {};

    this.globalScope = {
      'console.log': (args) => console.log(...args)
    };
  }

  execute(ast) {
    if (ast.type !== 'Program') return;
    for (const node of ast.body) {
      this.evaluate(node);
    }
  }

  evaluate(node) {
    if (!node) return null;

    switch (node.type) {
      case 'VariableDeclaration':
        this.variables[node.name] = this.evaluate(node.value);
        return this.variables[node.name];

      case 'BinaryExpression':
        const left = this.evaluate(node.left);
        const right = this.evaluate(node.right);
        switch (node.operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return left / right;
          default: throw new Error(`Unknown operator: ${node.operator}`);
        }

      case 'Literal':
        return node.value;

      case 'Identifier':
        if (Object.prototype.hasOwnProperty.call(this.variables, node.name)) {
          return this.variables[node.name];
        }
        console.error(pc.red(`SEM_001: Variable '${node.name}' is not defined.`));
        process.exit(1);
        break;

      case 'ImportStatement':
        const headerSource = this.readAxiomFile(node.path);
        if (headerSource) {
          const tokens = new this.Lexer(headerSource).tokenize();
          const headerAst = new this.Parser(tokens).parse();
          this.execute(headerAst);
        }
        break;

      case 'HeaderAssignment':
        const targetInternal = node.mapping;
        this.globalScope[node.alias] = (args) => {
          if (this.globalScope[targetInternal]) {
            return this.globalScope[targetInternal](args);
          } else {
            console.error(pc.red(`Internal mapping '${targetInternal}' not found.`));
            process.exit(1);
          }
        };
        break;

      case 'CallExpression':
        const func = this.globalScope[node.callee];
        if (typeof func === 'function') {
          const resolvedArgs = node.arguments.map(arg => this.evaluate(arg));
          return func(resolvedArgs);
        } else {
          console.error(pc.red(`\nSEM_002: Function '${pc.bold(node.callee)}' is not defined.`));
          process.exit(1);
        }
        break;
    }
  }
}

module.exports = Interpreter;