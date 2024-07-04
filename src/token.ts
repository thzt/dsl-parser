export class Token {
  constructor(
    public kind: TokenKind,
    public pos: number,
    public end: number,
    public source: string
  ) { }
}

export enum CharacterTypeEnum {
  Identifier,
  Keyword,
  Number,
}

export enum TokenKind {
  LeftParenthese = "(",
  RightParenthese = ")",
  leftBrace = "{",
  rightBrace = "}",
  Equal = "=",
  Plus = "+",

  Identifier = "(Identifier)",
  Number = "(Number)",
  Keyword = "(Keyword)",

  EOF = "(EOF)",
}