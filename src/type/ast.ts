import type { Token } from "../token";

export interface Offset {
  pos: number;
  end: number;
}

export interface AST {
  SourceFile: SourceFile;
  offset: Offset;
}
export interface SourceFile {
  StatementList: Statement[];
  offset: Offset;
}
export type Statement = VariableDeclaration | FunctionDeclaration
export interface VariableDeclaration {
  VariableDeclaration: {
    Keyword: Token;
    VariableName: Token;
    VariableValue: VariableValue;
    offset: Offset;
  };
}
export type VariableValue = Literal | CallExpression;
export interface Literal {
  Literal: Token;
  offset: Offset;
}
export interface CallExpression {
  CallExpression: {
    FunctionName: Token;
    FunctionArgument: Token;
    offset: Offset;
  };
}
export interface FunctionDeclaration {
  FunctionDeclaration: {
    FunctionName: Token;
    FunctionParameter: Token;
    FunctionBody: FunctionBody;
    offset: Offset;
  };
}
export interface FunctionBody {
  StatementList: Statement[];
  ReturnStatement: ReturnStatement;
  offset: Offset;
}
export class ReturnStatement {
  Keyword: Token;
  ReturnValue: ReturnValue;
  offset: Offset;
}
export type ReturnValue = Literal | PlusExpression;
export interface PlusExpression {
  PlusExpression: {
    Left: Token;
    Right: Token;
    offset: Offset;
  },
}

