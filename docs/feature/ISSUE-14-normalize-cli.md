# ISSUE-14: 规范化 primecli 的通用 CLI 体验与工程配置

## 需求确认

当前 `primecli` 已具备基础 CLI 能力，但从通用 npm CLI、Agent 可编程调用和长期维护角度看，需要集中修复一批规范性问题：

1. `npm test` 在仓库存在 `.worktree` 目录时失败
2. README 与实际命令不同步
3. CLI 版本号存在重复维护
4. API base URL 配置行为与文档描述不一致
5. 日期、分页、数量等参数校验不统一
6. HTTP 请求缺少 timeout
7. 缺少基础 CLI 行为验证

本 issue 只处理 CLI 规范化与工程质量，不引入新的 PrimeContact 业务功能。

## 范围

### 1. 工程验证稳定性

- 调整 lint/test 配置，避免扫描 `.worktree`、`dist`、`node_modules` 等非当前源码目录
- 保证 `npm test` 在当前仓库已有多个 worktree 的情况下仍可稳定通过

### 2. 文档与帮助一致性

- 补齐 README / README_CN 中缺失的 `wechat-touch items`、`wechat-touch chat` 命令说明
- 确认 README 中的参数默认值与 commander help、实际实现一致

### 3. 版本号单一来源

- CLI 版本号从 `package.json` 读取
- 避免在 `src/index.ts` 中手动硬编码版本号

### 4. 配置行为一致性

- 扩展 config schema，支持保存 `baseUrl`
- 明确 API base URL 优先级：
  1. `PRIMECLI_BASE_URL`
  2. config 文件中的 `baseUrl`
  3. 默认 URL `https://primeapi.aizee.cc`
- 更新 README / README_CN 中的配置说明

### 5. 参数校验统一

- 为日期参数校验 `yyyy-MM-dd` 格式
- 为 `page`、`size`、`count` 等数字参数校验整数范围
- 保持现有分页默认值不做无依据变更：
  - `company search`: `page=1`, `size=10`
  - `wechat-touch items`: `page=1`, `size=50`
  - `wechat-touch chat`: `page=1`, `size=20`
- 如果后端分页基准不同，先在文档中说明，不在本 issue 中改变接口语义

### 6. 网络错误可预期

- 为 axios client 增加合理 timeout
- 改进 timeout、连接失败、HTTP 错误的提示
- 保持失败时退出码非 0

### 7. 基础 CLI 行为测试

- 增加轻量测试或 smoke test
- 至少覆盖：
  - `primecli --help`
  - 子命令 help 可用
  - 缺 token 时给出登录提示
  - 非法参数时失败并输出明确错误

## 非目标

- 不新增 PrimeContact 业务 API
- 不改变现有命令名称
- 不改变默认输出格式，仍保持 JSON 为主
- 不做大规模重构
- 不调整已存在 worktree 的历史内容

## 实现方案

### 工程配置

- 优先通过 ESLint ignore 或 lint script 限制扫描范围解决 `.worktree` 问题
- 如 typescript-eslint 仍受多 worktree 影响，再显式设置 `tsconfigRootDir`

### 版本读取

- 在 ESM 环境中读取根目录 `package.json`
- 将 `package.json` 作为版本唯一来源传给 commander `.version()`

### 配置读取

- 将 `PrimeCliConfig` 扩展为：

```ts
export type PrimeCliConfig = {
  token?: string;
  baseUrl?: string;
};
```

- `createApiClient()` 支持从 config 解析 base URL
- 环境变量仍保留最高优先级，方便 CI、脚本和临时调试

### 参数校验

- 新增小型本地 helper，避免在各命令中重复手写解析逻辑
- 校验失败时抛出普通 `Error`，复用入口统一错误处理

### 测试方式

- 优先使用 Node 内置测试能力或简单 smoke script，避免引入重型测试框架
- 如果需要 mock API，采用本地临时 HTTP server，不依赖真实 PrimeContact 环境

## 验证计划

1. `npm run build`
2. `npm run lint`
3. `npm test`
4. `node dist/index.js --help`
5. `node dist/index.js wechat-touch --help`
6. `node dist/index.js wechat-touch distribute --user-id 1 --count 0` 应失败并提示数量范围
7. 无 token 时执行需登录命令，应提示先运行 `primecli auth login`
8. 检查 README / README_CN 与 help 输出的命令列表一致

## 验收标准

- `npm test` 在当前仓库存在 `.worktree` 目录时稳定通过
- README / README_CN 不遗漏现有命令
- CLI 版本只需维护 `package.json`
- base URL 配置行为与文档一致
- 非法日期、分页、数量参数能得到明确错误
- 网络超时或连接失败时不会无限等待
- 所有变更保持现有命令兼容
