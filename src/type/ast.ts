import type { Token } from "../token";

export interface AST {
  SourceFile: SourceFile
}
export interface SourceFile {
  StatementList: Statement[]
}
export type Statement = VariableDeclaration | FunctionDeclaration
export interface VariableDeclaration {
  VariableDeclaration: {
    name: Token;
    value: Value;
  };
}
export type Value = Token | {
  CallExpression: {
    name: Token;
    argument: Token;
  }
}
export interface FunctionDeclaration {
  FunctionDeclaration: {
    name: Token;
    parameter: Token;
    body: FunctionBody
  };
}
export interface FunctionBody {
  StatementList: Statement[];
  ReturnStatement: ReturnStatement
}
export type ReturnStatement = Token | {
  PlusExpression: PlusExpression
};
export interface PlusExpression {
  left: Token;
  right: Token;
}

