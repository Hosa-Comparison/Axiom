const pc = require('picocolors');

class Lexer {
  constructor(source) {
    this.source = source;
    this.tokens = [];
    this.current = 0;
    this.line = 1;
    this.col = 1;
    
    this.keywords = {
      'assign': 'KEYWORD_ASSIGN',
      'import': 'KEYWORD_IMPORT',
      'var': 'KEYWORD_VAR',
      'func': 'KEYWORD_FUNC'
    };
  }

  tokenize() {
    while (!this.isAtEnd()) {
      const char = this.peek();

      if (/\s/.test(char)) {
        if (char === '\n') { this.line++; this.col = 0; }
        this.advance();
        continue;
      }

      if (/[a-zA-Z_]/.test(char)) {
        this.readIdentifier();
        continue;
      }

      if (/[0-9]/.test(char)) {
        this.readNumber();
        continue;
      }

      if (char === '"') {
        this.readString();
        continue;
      }

      switch (char) {
        case '(': this.addToken('LPAREN', '('); break;
        case ')': this.addToken('RPAREN', ')'); break;
        case '{': this.addToken('LBRACE', '{'); break;
        case '}': this.addToken('RBRACE', '}'); break;
        case ';': this.addToken('SEMICOLON', ';'); break;
        case '.': this.addToken('DOT', '.'); break;
        case ',': this.addToken('COMMA', ','); break;
        case '+': this.addToken('PLUS', '+'); break;
        case '-': this.addToken('MINUS', '-'); break;
        case '*': this.addToken('STAR', '*'); break;
        case '/': this.addToken('SLASH', '/'); break;
        case '=': this.addToken('ASSIGN', '='); break;
        default:
          console.error(pc.red(`\nLEX_001: Unexpected character '${pc.bold(char)}' at ${this.line}:${this.col}`));
          process.exit(1);
      }
      this.advance();
    }

    this.addToken('EOF', null);
    return this.tokens;
  }

  readIdentifier() {
    let value = '';
    const startCol = this.col;
    while (!this.isAtEnd() && /[a-zA-Z0-9_\.]/.test(this.peek())) {
      value += this.advance();
    }
    const type = this.keywords[value] || 'IDENTIFIER';
    this.tokens.push({ type, value, line: this.line, col: startCol });
  }

  readNumber() {
    let value = '';
    const startCol = this.col;
    while (/[0-9]/.test(this.peek())) { value += this.advance(); }
    this.tokens.push({ type: 'NUMBER', value: Number(value), line: this.line, col: startCol });
  }

  readString() {
    this.advance();
    let value = '';
    const startCol = this.col;
    while (this.peek() !== '"' && !this.isAtEnd()) {
      value += this.advance();
    }
    this.advance();
    this.tokens.push({ type: 'STRING', value, line: this.line, col: startCol });
  }

  peek() { return this.source[this.current] || null; }
  advance() { const char = this.source[this.current++]; this.col++; return char; }
  isAtEnd() { return this.current >= this.source.length; }
  addToken(type, value) { this.tokens.push({ type, value, line: this.line, col: this.col }); }
}

module.exports = Lexer;