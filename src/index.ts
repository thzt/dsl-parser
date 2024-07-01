enum TokenKind {
  LeftParenthese = "(",
  RightParenthese = ")",
  leftBrace = "{",
  rightBrace = "}",
  Identifier = "(Identifier)",
  Keyword = "(Keyword)",
  Number = "(Number)",
  EOF = "(EOF)",
  Equal = "=",
  Plus = "+",
}

class Token {
  constructor(
    public kind: TokenKind,
    private pos: number,
    private end: number,
    public source: string
  ) { }
}

interface ScanReturnType {
  characters: string;
  type: CharacterTypeEnum;
}

enum CharacterTypeEnum {
  Identifier,
  Keyword,
  Number,
}

/**
  SourceFile = StatementList
  StatementList = Statement | Statement StatementList
  Statement = VariableDeclaration | FunctionDeclaration
  VariableDeclaration = 'let' Identifier '=' Value
  Value = NUMBER | CallExpression
  FunctionDeclaration = Identifier '(' Identifier ')' '{' FunctionBody '}'
  FunctionBody = StatementList ReturnStatement
  ReturnStatement = 'return' PlusExpression
  PlusExpression = Identifier '+' Identifier
  CallExpression = Identifier '(' Identifier ')'

  Identifier = [a-z]+ | NUMBER
 */
export class Parser {
  private pos: number = 0;
  private readonly end: number;
  private token: Token;

  constructor(private readonly code: string) {
    this.end = code.length;
  }

  public parse() {
    this.nextToken();
    const sourceFile = this.parseSourceFile();
    this.assert(TokenKind.EOF);

    return {
      SourceFile: sourceFile,
    };
  }

  private parseSourceFile() {
    const statements = this.parseStatementList();

    return {
      StatementList: statements,
    };
  }

  private parseStatementList() {
    const statements = [];

    while (true) {
      const statement = this.parseStatement();
      statements.push(statement);

      if (this.token.kind === TokenKind.EOF) {
        break;
      }
      if (this.token.kind === TokenKind.Keyword && this.token.source === 'return') { // 函数体
        break;
      }
    }

    return statements;
  }

  private parseStatement() {
    switch (this.token.kind) {
      case TokenKind.Keyword: {  // 变量定义
        this.assert(TokenKind.Keyword, 'let');
        const variable = this.parseVariableDeclaration();
        return {
          VariableDeclaration: variable,
        };
      }
      case TokenKind.Identifier: {  // 函数调用
        const func = this.parseFunctionDeclaration();
        return {
          FunctionDeclaration: func
        }
      }
      default: {
        throw new Error(`语句只能是 变量定义 或者 函数调用`);
      }
    }
  }

  private parseVariableDeclaration() {
    this.nextToken();
    this.assert(TokenKind.Identifier);
    const variableName = this.token;

    this.nextToken();
    this.assert(TokenKind.Equal);

    this.nextToken();
    this.assert([TokenKind.Identifier, TokenKind.Number]);  // 或者直接赋值、或者接受函数返回值
    const value = this.parseValue();

    this.nextToken();

    return {
      name: variableName,
      value,
    };
  }

  private parseFunctionDeclaration() {
    const functionName = this.token;

    this.nextToken();
    this.assert(TokenKind.LeftParenthese);

    this.nextToken();
    this.assert(TokenKind.Identifier);
    const functiontParameter = this.token;

    this.nextToken();
    this.assert(TokenKind.RightParenthese);

    this.nextToken();
    this.assert(TokenKind.leftBrace);

    this.nextToken();
    const functionBody = this.parseFunctionBody();

    this.nextToken();
    this.assert(TokenKind.rightBrace);

    this.nextToken();

    return {
      name: functionName,
      parameter: functiontParameter,
      body: functionBody,
    };
  }

  private parseFunctionBody() {
    const statements = this.parseStatementList();
    this.assert(TokenKind.Keyword, 'return');

    const returnStat = this.parseReturnStatement();
    return {
      StatementList: statements,
      ReturnStatement: returnStat,
    };
  }

  private parseReturnStatement() {
    this.nextToken();
    this.assert(TokenKind.Identifier);
    const plusExpr = this.parsePlusExpression();

    return {
      PlusExpression: plusExpr,
    };
  }

  private parsePlusExpression() {
    const left = this.token;

    this.nextToken();
    this.assert(TokenKind.Plus);

    this.nextToken();
    this.assert(TokenKind.Identifier);
    const right = this.token;

    return {
      left,
      right,
    };
  }

  private parseValue() {
    switch (this.token.kind) {
      case TokenKind.Number: {
        const number = this.token;
        return number;
      }
      case TokenKind.Identifier: {
        const { name, argument } = this.parseCallExpression();
        return {
          CallExpression: {
            name,
            argument,
          }
        }
      }
      default: {
        throw new Error('value 只能是 number 或 函数调用');
      }
    }
  }

  private parseCallExpression() {
    this.assert(TokenKind.Identifier);
    const functionName = this.token;

    this.nextToken();
    this.assert(TokenKind.LeftParenthese);

    this.nextToken();
    this.assert(TokenKind.Identifier);
    const functionArgument = this.token;

    this.nextToken();
    this.assert(TokenKind.RightParenthese);

    this.nextToken();

    return {
      name: functionName,
      argument: functionArgument
    };
  }

  private assert(tokenKindOrKinds: TokenKind | TokenKind[], characters?: string) {
    const kinds = Array.isArray(tokenKindOrKinds) ? tokenKindOrKinds : [tokenKindOrKinds];
    if (kinds.includes(this.token.kind)) {
      if (characters == null) {
        return;
      }
      if (this.token.source === characters) {
        return;
      }
      throw new Error(`当前 token 包含的字符不正确，token ${JSON.stringify(this.token)}，断言 ${characters}`);
    }
    throw new Error(`token 断言失败，当前 token ${JSON.stringify(this.token)}，断言 ${kinds.join()}`);
  }

  private nextToken(): Token {
    while (true) {
      if (this.pos >= this.end) {
        return (this.token = new Token(TokenKind.EOF, this.pos, this.pos, null));
      }

      const ch = this.code.charAt(this.pos);
      switch (ch) {
        // 忽略空白字符
        case " ": case "\n": {
          ++this.pos;
          continue;
        }

        // 字面量 token
        case '=': return this.token = new Token(TokenKind.Equal, this.pos, ++this.pos, ch);
        case '+': return this.token = new Token(TokenKind.Plus, this.pos, ++this.pos, ch);
        case '(': return this.token = new Token(TokenKind.LeftParenthese, this.pos, ++this.pos, ch);
        case ')': return this.token = new Token(TokenKind.RightParenthese, this.pos, ++this.pos, ch);
        case '{': return this.token = new Token(TokenKind.leftBrace, this.pos, ++this.pos, ch);
        case '}': return this.token = new Token(TokenKind.rightBrace, this.pos, ++this.pos, ch);

        // 标识符、关键字、数字
        default: {
          const start = this.pos;
          const { characters, type } = this.scan(start);

          switch (type) {
            case CharacterTypeEnum.Keyword: {
              return this.token = new Token(TokenKind.Keyword, start, this.pos, characters);
            }
            case CharacterTypeEnum.Identifier: {
              return this.token = new Token(TokenKind.Identifier, start, this.pos, characters);
            }
            case CharacterTypeEnum.Number: {
              return this.token = new Token(TokenKind.Number, start, this.pos, characters);
            }
          }
        }
      }
    }
  }

  // 向后扫描：标识符、关键字、数字
  private scan(start: number): ScanReturnType {
    const remain = this.code.slice(start);

    // 标识符、关键字
    let match = /^([a-zA-Z]+)/.exec(remain);
    if (match != null) {
      const [, identifer] = match;
      this.pos += identifer.length;

      switch (identifer) {
        case 'let': case 'return':
          return {
            type: CharacterTypeEnum.Keyword,
            characters: identifer,
          }
        default: {
          return {
            type: CharacterTypeEnum.Identifier,
            characters: identifer,
          }
        }
      }
    }

    // 数字
    match = /^([0-9]+)/.exec(remain);
    if (match != null) {
      const [, number] = match;
      this.pos += number.length;

      return {
        type: CharacterTypeEnum.Number,
        characters: number,
      };
    }

    throw new Error(`未扫描到合法的 token：${remain}`);
  }
}
