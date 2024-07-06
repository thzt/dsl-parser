import { Token, TokenKind, CharacterTypeEnum } from "./token";
export * from './semantic';
export * from './search';

import type {
  AST, SourceFile, Statement, FunctionBody, ReturnStatement, VariableValue, CallExpression, VariableDeclaration, FunctionDeclaration,
} from "./type/ast";
import type { ScanReturnType } from "./type/token";

export * from './type/ast';

export class Parser {
  private pos: number = 0;
  private readonly end: number;
  private token: Token;

  constructor(private readonly code: string) {
    this.end = code.length;
  }

  public parse(): AST {
    this.nextToken();
    const sourceFile = this.parseSourceFile();
    this.assert(TokenKind.EOF);

    return {
      SourceFile: sourceFile,
      offset: {
        pos: 0, // 包含空白字符
        end: this.end, // 包含空白字符
      },
    };
  }

  private parseSourceFile(): SourceFile {
    const startPos = this.token.pos;  // let 或者 函数名
    const statements = this.parseStatementList();
    const endPos = this.token.end;

    return {
      StatementList: statements,
      offset: {
        pos: startPos,
        end: endPos,
      }
    };
  }

  private parseStatementList(): Statement[] {
    const statements = [];

    while (true) {
      // 根据后面一个 token 来判断
      if (this.token.kind === TokenKind.EOF) {  // 最外层
        break;
      }
      if (this.token.kind === TokenKind.Keyword && this.token.source === 'return') { // 函数体
        break;
      }

      const statement = this.parseStatement();
      statements.push(statement);
    }

    return statements;
  }

  private parseStatement(): Statement {
    // 根据后面一个 token 来判断，是 变量定义 还是 函数调用
    switch (this.token.kind) {
      case TokenKind.Keyword: {  // 变量定义
        this.assert(TokenKind.Keyword, 'let');
        const variableDeclaration = this.parseVariableDeclaration();
        return variableDeclaration;
      }
      case TokenKind.Identifier: {  // 函数调用
        const functionDeclaration = this.parseFunctionDeclaration();
        return functionDeclaration;
      }
      default: {
        throw new Error(`语句只能是 变量定义 或者 函数调用`);
      }
    }
  }

  private parseVariableDeclaration(): VariableDeclaration {
    this.assert(TokenKind.Keyword, 'let');
    const keyword = this.token;

    this.nextToken();
    this.assert(TokenKind.Identifier);
    const variableName = this.token;

    this.nextToken();
    this.assert(TokenKind.Equal);

    this.nextToken();
    this.assert([TokenKind.Identifier, TokenKind.Number]);  // 或者直接赋值、或者接受函数返回值
    const variableValue = this.parseValue();
    const endPos = this.token.end;  // 变量值或者函数调用

    this.nextToken();

    return {
      VariableDeclaration: {
        Keyword: keyword,
        VariableName: variableName,
        VariableValue: variableValue,
        offset: {
          pos: keyword.pos,  // 从 let 左侧开始
          end: endPos,
        }
      },
    };
  }

  private parseFunctionDeclaration(): FunctionDeclaration {
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

    const functionBody = this.parseFunctionBody();
    this.assert(TokenKind.rightBrace);
    const endPos = this.token.end;

    this.nextToken();

    return {
      FunctionDeclaration: {
        FunctionName: functionName,
        FunctionParameter: functiontParameter,
        FunctionBody: functionBody,
        offset: {
          pos: functionName.pos,  // 函数名字位置
          end: endPos,  // 右花括号位置结束
        }
      },
    };
  }

  private parseFunctionBody(): FunctionBody {
    this.assert(TokenKind.leftBrace);
    const startPos = this.token.pos;

    this.nextToken();

    const statements = this.parseStatementList();
    this.assert(TokenKind.Keyword, 'return');

    const returnStat = this.parseReturnStatement();
    this.assert(TokenKind.rightBrace);

    return {
      StatementList: statements,
      ReturnStatement: returnStat,
      offset: {
        pos: startPos, // 左括号开始位置
        end: this.token.end,  // 右括号结束位置
      },
    };
  }

  private parseReturnStatement(): ReturnStatement {
    const keyword = this.token;

    this.nextToken();
    this.assert([TokenKind.Identifier, TokenKind.Number]);
    const value = this.token;

    // 还要判断变量或者数字后面，是不是加号
    this.nextToken();
    this.assert([TokenKind.rightBrace, TokenKind.Plus]);
    switch (this.token.kind) {
      // 如果是右花括号，语句就结束了
      case TokenKind.rightBrace: {
        return {
          Keyword: keyword,
          ReturnValue: {
            Literal: value,
            offset: { // 如果直接返回一个值，那就以这个值的 offset 为准
              pos: value.pos,
              end: value.end,
            },
          },
          offset: {
            pos: keyword.pos,
            end: value.end,
          }
        };
      }
      // 如果是加号，那就再向后取一个 token，获取第二个运算数
      case TokenKind.Plus: {
        this.nextToken();
        this.assert([TokenKind.Identifier, TokenKind.Number]);
        const right = this.token;

        this.nextToken();
        this.assert(TokenKind.rightBrace);
        return {
          Keyword: keyword,
          ReturnValue: {
            PlusExpression: {
              Left: value,
              Right: right,
              offset: {
                pos: value.pos,
                end: right.end,
              }
            },
          },
          offset: {
            pos: keyword.pos,
            end: right.end,
          }
        }
      }
      default: {
        throw new Error(`返回值 只能是值或者加法表达式`);
      }
    }
  }

  private parseValue(): VariableValue {
    switch (this.token.kind) {
      case TokenKind.Number: {
        const number = this.token;
        return {
          Literal: number,
          offset: {
            pos: number.pos,
            end: number.end,
          }
        };
      }
      case TokenKind.Identifier: {
        const callExpr = this.parseCallExpression();
        return callExpr;
      }
      default: {
        throw new Error('value 只能是 number 或 函数调用');
      }
    }
  }

  private parseCallExpression(): CallExpression {
    this.assert(TokenKind.Identifier);
    const functionName = this.token;

    this.nextToken();
    this.assert(TokenKind.LeftParenthese);

    this.nextToken();
    this.assert(TokenKind.Identifier);
    const functionArgument = this.token;

    this.nextToken();
    this.assert(TokenKind.RightParenthese);

    return {
      CallExpression: {
        FunctionName: functionName,
        FunctionArgument: functionArgument,
        offset: {
          pos: functionName.pos,
          end: this.token.end,  // 到右小括号位置结束
        }
      },
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
