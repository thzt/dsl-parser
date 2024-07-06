import type { Token } from "../token";
import { SymbolTable } from "./semantic";

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
  locals?: SymbolTable;
  parent?: AST;
}
export type Statement = VariableDeclaration | FunctionDeclaration
export interface VariableDeclaration {
  VariableDeclaration: {
    Keyword: Token;
    VariableName: Token;
    VariableValue: VariableValue;
    offset: Offset;
  };
  parent?: SourceFile;
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
  parent?: SourceFile;
}
export interface FunctionBody {
  StatementList: Statement[];
  ReturnStatement: ReturnStatement;
  offset: Offset;
  parent?: FunctionDeclaration;
  locals?: SymbolTable;
}
export class ReturnStatement {
  Keyword: Token;
  ReturnValue: ReturnValue;
  offset: Offset;
  parent?: FunctionBody;
}
export type ReturnValue = Literal | PlusExpression;
export interface PlusExpression {
  PlusExpression: {
    Left: Token;
    Right: Token;
    offset: Offset;
  },
  parent?: ReturnStatement;
}

