import { LanguageSymbol } from "../semantic";

export type SymbolTable = Map<string, LanguageSymbol>;

export enum SymbolTypeEnum {
  Variable,
  Function,
  Parameter,
}
