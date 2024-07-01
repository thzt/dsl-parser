### dsl-parser

#### 调试
直接按 `F5` 调试测试用例
- 使用了 ts-node + mocha 执行 typescript
- package.json 和 .vscode/launch.json 配置好了调试端口 5858
- build script 只用来生成目标代码，调试时不用 watch。tsconfig.json 中配置了只编译 src
