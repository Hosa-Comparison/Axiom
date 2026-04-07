const pc = require('picocolors');

class Interpreter {
  constructor(readAxiomFile, Lexer, Parser) {
    this.readAxiomFile = readAxiomFile;
    this.Lexer = Lexer;
    this.Parser = Parser;
    this.variables = {};
    this.globalScope = {
      'print': (args) => console.log(...args)
    };
  }

  execute(ast) {
    if (!ast || ast.type !== 'Program') return;
    for (const node of ast.body) {
      this.evaluate(node);
    }
  }

  evaluate(node) {
    if (!node) return null;

    switch (node.type) {
      case 'Program':
        return this.execute(node);

      case 'ImportStatement':
        const headerSource = this.readAxiomFile(node.path);
        if (headerSource) {
          const tokens = new this.Lexer(headerSource).tokenize();
          const headerAst = new this.Parser(tokens).parse();
          this.execute(headerAst);
        }
        break;

      case 'HeaderAssignment':
        const { alias, mapping } = node;
        if (mapping === 'console.log') {
          this.globalScope[alias] = (args) => console.log(...args);
        }
        break;

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
        console.error(pc.red(`\nSEM_001: Variable '${pc.bold(node.name)}' is not defined.`));
        process.exit(1);

      case 'CallExpression':
        const func = this.globalScope[node.callee];
        if (typeof func === 'function') {
          const resolvedArgs = node.arguments.map(arg => this.evaluate(arg));
          return func(resolvedArgs);
        }
        console.error(pc.red(`\nSEM_002: Function '${pc.bold(node.callee)}' is not defined.`));
        process.exit(1);

      case 'ExpressionStatement':
        return this.evaluate(node.expression);
        
      default:
        return null;
    }
  }
}

module.exports = Interpreter;