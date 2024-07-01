enum TokenKind {
  LeftParenthese = "(",
  RightParenthese = ")",
  leftBrace = "{",
  rightBrace = "}",
  Identifier = "(Identifier)",
  EOF = "(EOF)",
  Equal = "=",
  Plus = "+",
}

class Token {
  constructor(
    private tokenKind: TokenKind,
    private pos: number,
    private end: number,
    private source: string
  ) {}
}

export class Parser {
  private pos: number = 0;
  private readonly end: number;
  private token: Token;

  constructor(private readonly code: string) {
    this.end = code.length;
  }

  public parse() {
    debugger;
    this.nextToken();
    debugger;
  }

  private nextToken(): Token {
    return (this.token = new Token(TokenKind.EOF, 0, 0, ""));
  }
}
