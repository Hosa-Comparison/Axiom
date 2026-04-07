# Axiom

## Axiom

Axiom is a highly flexible, modular scripting language with a recursive-descent structure. Bridging the interpretive nature of scripting and the rigors of structured programming through C-style header inclusion, Axiom provides a built-in mechanism for .axiomh file processing.

### Axiom Engine Overview

The Axiom engine follows a three-step process:

1. Lexical Parsing: The lexer parses input code into tokens, recognizes reserved words (such as import, assign, var) and processes string and identifier literals.
2. Abstract Syntax Tree: Recursive-descent parser builds an abstract syntax tree ensuring PEMDAS mathematical precedence and proper statements.
3. Execution Engine: A tree traversal interpreter manages global/local scopes to facilitate the connection between high-level Axiom code and underlying system calls.


### Features

* Native Header Processing (.axiomh): Provides separation of function definition and function execution. Use headers to map internal system functions to externalized language aliases.
* Nested Expressions: Provides support for nested mathematical expressions and variable resolution within binary expressions.
* Diagnostics: Built-in "pretty error" reporting (PARSE_00X, SEM_00X) for debugging during compilation.


### Axiom Language Syntax Specifications

#### Basic Header File (basic.axiomh)
This header maps internal function to language alias:
```axiom
assign echo(text) console.log;