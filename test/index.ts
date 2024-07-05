import * as fs from "fs";
import * as path from "path";

import { Parser } from "../src/index";
import type { AST } from '../src/index'

describe("test case", () => {
  describe("case 1", () => {
    const filePath = path.resolve("./test/demo.dsl");
    const code = fs.readFileSync(filePath, "utf-8");

    it("result 1", () => {
      debugger;
      const parser = new Parser(code);
      const ast: AST = parser.parse();
      debugger;
    });
  });

  describe("case 2", () => {
    const filePath = path.resolve("./test/demo2.dsl");
    const code = fs.readFileSync(filePath, "utf-8");

    it("result 1", () => {
      debugger;
      const parser = new Parser(code);
      const ast: AST = parser.parse();
      debugger;
    });
  });
});
