const pc = require('picocolors');

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.current = 0;
  }

  parse() {
    const body = [];
    while (!this.isAtEnd()) {
      body.push(this.parseStatement());
    }
    return { type: 'Program', body };
  }

  parseStatement() {
    const token = this.peek();

    if (token.type === 'KEYWORD_IMPORT') return this.parseImport();
    if (token.type === 'KEYWORD_ASSIGN') return this.parseHeaderAssignment();
    if (token.type === 'KEYWORD_VAR') return this.parseVariableDeclaration();

    return this.parseExpressionStatement();
  }

  parseImport() {
    this.advance();
    const path = this.consume('STRING', "Expect path string.").value;
    this.consume('SEMICOLON', "Expect ';' after import.");
    return { type: 'ImportStatement', path };
  }

  parseHeaderAssignment() {
    this.advance();
    const alias = this.consume('IDENTIFIER', "Expect alias name.").value;
    this.consume('LPAREN', "Expect '(' after alias.");
    this.consume('IDENTIFIER', "Expect parameter name."); 
    this.consume('RPAREN', "Expect ')' after parameter.");
    const mapping = this.consume('IDENTIFIER', "Expect target mapping.").value;
    
    this.consume('SEMICOLON', "Expect ';' after assignment.");
    return { type: 'HeaderAssignment', alias, mapping };
  }

  parseVariableDeclaration() {
    this.advance();
    const name = this.consume('IDENTIFIER', "Expect variable name.").value;
    this.consume('ASSIGN', "Expect '='.");
    const value = this.parseExpression();
    this.consume('SEMICOLON', "Expect ';'.");
    return { type: 'VariableDeclaration', name, value };
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
    if (this.match('NUMBER', 'STRING')) return { type: 'Literal', value: this.previous().value };
    
    if (this.match('IDENTIFIER')) {
      const name = this.previous().value;
      if (this.match('LPAREN')) {
        const args = [];
        if (!this.check('RPAREN')) {
          do { args.push(this.parseExpression()); } while (this.match('COMMA'));
        }
        this.consume('RPAREN', "Expect ')'.");
        return { type: 'CallExpression', callee: name, arguments: args };
      }
      return { type: 'Identifier', name };
    }

    if (this.match('LPAREN')) {
      const expr = this.parseExpression();
      this.consume('RPAREN', "Expect ')'.");
      return expr;
    }

    throw new Error(`Unexpected token: ${this.peek().type}`);
  }

  match(...types) {
    for (const type of types) { if (this.check(type)) { this.advance(); return true; } }
    return false;
  }
  check(type) { return !this.isAtEnd() && this.peek().type === type; }
  advance() { if (!this.isAtEnd()) this.current++; return this.previous(); }
  isAtEnd() { return this.peek().type === 'EOF'; }
  peek() { return this.tokens[this.current]; }
  previous() { return this.tokens[this.current - 1]; }
  consume(type, message) { if (this.check(type)) return this.advance(); const token = this.peek(); console.error(pc.red(`\nPARSE_002: ${message} (Found '${pc.bold(token.type)}' at ${token.line}:${token.col})`)); process.exit(1); }
}

module.exports = Parser;