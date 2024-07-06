import { Token } from "./token";
import { AST, CallExpression, FunctionDeclaration, SourceFile, Statement, VariableDeclaration, VariableValue } from "./type/ast";
import { SymbolTable } from "./type/semantic";

class SearchResult {
  isFound: boolean;
  token?: Token;
  locals?: SymbolTable;
}

// 目前只支持搜索函数定义
export const search = (ast: AST, pos: number): SearchResult => {
  const result = searchStatementList(ast.SourceFile.StatementList, pos, ast.SourceFile.locals);
  return result;
};

const searchStatementList = (statementList: Statement[], pos: number, locals: SymbolTable): SearchResult => {
  for (let i = 0; i < statementList.length; i++) {
    const statement = statementList[i];
    const result = searchStatement(statement, pos, locals);
    if (result.isFound) {
      return result;
    }
  }

  return {
    isFound: false,
  }
};

const searchStatement = (statement: Statement, pos: number, locals: SymbolTable): SearchResult => {
  // 变量定义
  if ((statement as VariableDeclaration).VariableDeclaration != null) {
    const {
      VariableDeclaration: {
        VariableValue: variableValue
      }
    } = statement as VariableDeclaration;
    return searchVariableValue(variableValue, pos, locals);
  }

  // 函数定义
  // 递归搜索
  const {
    FunctionDeclaration: {
      FunctionBody: {
        StatementList: statementList,
        locals: functionLocals,
      },
    }
  } = statement as FunctionDeclaration;
  return searchStatementList(statementList, pos, functionLocals);
}

const searchVariableValue = (variableValue: VariableValue, pos: number, locals: SymbolTable): SearchResult => {
  if ((variableValue as CallExpression).CallExpression != null) {
    const {
      CallExpression: {
        FunctionName: token,
      },
    } = variableValue as CallExpression;
    if (token.pos === pos) {
      return {
        isFound: true,
        token,
        locals,
      }
    }
  }

  // 直接赋值情况
  return {
    isFound: false,
  }
};