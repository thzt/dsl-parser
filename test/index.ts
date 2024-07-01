import * as fs from "fs";
import * as path from "path";
import { describe, it } from "node:test";

import { Parser } from "../src/index";

describe("test case", () => {
  debugger;
  const filePath = path.resolve("./test/demo.dsl");
  const code = fs.readFileSync(filePath, "utf-8");

  describe("case 1", () => {
    it("result 1", () => {
      debugger;
      const parser = new Parser(code);
      debugger;
      const ast = parser.parse();
      debugger;
    });
  });
});
