const pc = require('picocolors');

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  parse() {
    const statements = [];
    while (!this.isAtEnd()) {
      statements.push(this.parseStatement());
    }
    return statements;
  }

  parseStatement() {
    const token = this.peek();

    if (token.type === 'KEYWORD_VAR' || token.type === 'KEYWORD_ASSIGN') {
      return this.parseAssignment();
    }

    if (token.type === 'IDENTIFIER' && this.peekNext()?.type === 'LPAREN') {
      return this.parseCallStatement();
    }

    return this.parseExpressionStatement();
  }

  parseAssignment() {
    this.advance(); // consume 'var' or 'assign'
    const name = this.consume('IDENTIFIER', 'Expect variable name.');
    this.consume('ASSIGN', "Expect '=' after variable name.");
    const value = this.parseExpression();
    this.consume('SEMICOLON', "Expect ';' after assignment.");
    return { type: 'Assignment', name: name.value, value };
  }

  parseCallStatement() {
    const expr = this.parsePrimary();
    this.consume('SEMICOLON', "Expect ';' after function call.");
    return expr;
  }

  parseExpressionStatement() {
    const expr = this.parseExpression();
    this.consume('SEMICOLON', "Expect ';' after expression.");
    return expr;
  }

  parseExpression() {
    return this.parseBinaryExpression();
  }

  parseBinaryExpression() {
    let left = this.parsePrimary();

    while (this.match('PLUS', 'MINUS', 'STAR', 'SLASH')) {
      const operator = this.previous().value;
      const right = this.parsePrimary();
      left = { type: 'BinaryExpression', left, operator, right };
    }

    return left;
  }

  parsePrimary() {
    if (this.match('NUMBER', 'STRING')) {
      return { type: 'Literal', value: this.previous().value };
    }

    if (this.match('IDENTIFIER')) {
      const name = this.previous().value;
      if (this.match('LPAREN')) {
        const args = [];
        if (!this.check('RPAREN')) {
          do {
            args.push(this.parseExpression());
          } while (this.match('COMMA'));
        }
        this.consume('RPAREN', "Expect ')' after arguments.");
        return { type: 'CallExpression', callee: name, arguments: args };
      }
      return { type: 'Identifier', name };
    }

    if (this.match('LPAREN')) {
      const expr = this.parseExpression();
      this.consume('RPAREN', "Expect ')' after expression.");
      return expr;
    }

    const token = this.peek();
    console.error(pc.red(`\nPARSE_001: Unexpected token '${pc.bold(token.type)}' at ${token.line}:${token.col}`));
    process.exit(1);
  }

  // Helpers
  match(...types) {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  check(type) {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  advance() {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  isAtEnd() { return this.peek().type === 'EOF'; }
  peek() { return this.tokens[this.current]; }
  peekNext() { return this.tokens[this.current + 1]; }
  previous() { return this.tokens[this.current - 1]; }

  consume(type, message) {
    if (this.check(type)) return this.advance();
    const token = this.peek();
    console.error(pc.red(`\nPARSE_002: ${message} (Found '${token.type}' at ${token.line}:${token.col})`));
    process.exit(1);
  }
}

module.exports = Parser;