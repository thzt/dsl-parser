import { AST, CallExpression, FunctionBody, FunctionDeclaration, PlusExpression, ReturnStatement, SourceFile, Statement, VariableDeclaration } from "./type/ast";
import { SymbolTable, SymbolTypeEnum } from "./type/semantic";

export class LanguageSymbol {
  constructor(public symbolType: SymbolTypeEnum, public node: any, public offset: number[]) { }
}

export class Semantic {
  constructor(private ast: AST) { }

  // 计算符号表信息，类似于 ts.bindSourceFile
  public bind() {
    this.bindSourceFile(this.ast.SourceFile, this.ast);
  }

  private bindSourceFile(sourceFile: SourceFile, parent: any) {
    sourceFile.parent = parent;

    // 全局作用域
    const symbolTable: SymbolTable = new Map<string, LanguageSymbol>();
    sourceFile.locals = symbolTable;

    this.bindStatementList(sourceFile.StatementList, symbolTable, sourceFile);
  }

  private bindStatementList(statementList: Statement[], symbolTable: SymbolTable, parent: any) {
    for (let i = 0; i < statementList.length; i++) {
      const statement = statementList[i];
      this.bindStatement(statement, symbolTable, parent);
    }
  }

  private bindStatement(statement: Statement, symbolTable: SymbolTable, parent: any) {
    statement.parent = parent;

    // 变量定义
    if ((statement as VariableDeclaration).VariableDeclaration != null) {
      const {
        VariableDeclaration: {
          VariableName: token,
        }
      } = statement as VariableDeclaration;
      const variableName = token.source;
      const offset = [token.pos, token.end];

      // 写入符号表
      const symbol = new LanguageSymbol(SymbolTypeEnum.Variable, token, offset);
      symbolTable.set(variableName, symbol);
      return;
    }

    // 当前只有两种情况
    // 函数定义
    const {
      FunctionDeclaration: {
        FunctionName: token,
        FunctionBody: functionBody,
      }
    } = statement as FunctionDeclaration;
    const functionName = token.source;
    const offset = [token.pos, token.end];

    // 写入符号表
    const symbol = new LanguageSymbol(SymbolTypeEnum.Function, token, offset);
    symbolTable.set(functionName, symbol);

    // 继续向下处理
    this.bindFunctionBody(functionBody, symbolTable, statement);
  }

  private bindFunctionBody(functionBody: FunctionBody, symbolTable: SymbolTable, parent: any) {
    functionBody.parent = parent;

    // 函数体 会创建新的作用域
    const newSymbolTable: SymbolTable = new Map<string, LanguageSymbol>();
    functionBody.locals = newSymbolTable;

    // 将形参写入符号表
    const {
      FunctionDeclaration: {
        FunctionParameter: token,
        FunctionBody: {
          StatementList: statementList,
          ReturnStatement: returnStatement,
        }
      }
    } = parent as FunctionDeclaration;
    const parameterName = token.source;
    const offset = [token.pos, token.end];

    const symbol = new LanguageSymbol(SymbolTypeEnum.Parameter, token, offset);
    newSymbolTable.set(parameterName, symbol);

    // 继续处理子元素
    this.bindStatementList(statementList, newSymbolTable, functionBody);

    // 处理 return
    this.bindReturnStatement(returnStatement, newSymbolTable, functionBody);
  }

  private bindReturnStatement(returnStatement: ReturnStatement, symbolTable: SymbolTable, parent: any) {
    returnStatement.parent = parent;

    const {
      ReturnValue: returnValue,
    } = returnStatement;

    if ((returnValue as PlusExpression).PlusExpression != null) {
      (returnValue as PlusExpression).parent = returnStatement;
      return;
    }

    // literal 情况不用处理
  }
}
