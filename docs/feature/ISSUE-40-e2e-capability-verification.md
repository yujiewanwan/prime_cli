# Feature Spec

## 基本信息

- Issue: #40
- 标题: 增加已认证的端到端能力验证
- 状态: Approved

## 背景与目标

primecli 现有 `npm test` 覆盖构建、静态检查和本地冒烟场景，但不验证 CLI 与 PrimeContact API 的真实联通性。

新增独立的只读端到端测试命令，使用具备 `SUPER_ADMIN` 权限的测试账号验证所有已实现的查询命令可登录、可请求且能输出 JSON 响应。

## 范围

- 使用 `test` 测试账号登录，密码由 `PRIMECLI_E2E_PASSWORD` 提供。
- 默认验证认证、公司、Hermes、企微触达和公众号的查询命令。
- 对依赖数据标识符的命令，优先使用前序查询结果中的 ID；没有可用测试数据时在测试摘要中标记为跳过。
- 每次测试使用临时 HOME 目录，不修改本机 primecli 配置。
- 默认 API 地址可通过 `PRIMECLI_BASE_URL` 覆盖。

## 非目标

- 不执行联系人分发、公众号文章拉取、公众号凭证更新、热点创建或会话分析结果回写等写操作。
- 不将真实 API 测试合并到 `npm test`。
- 不验证生图能力：`main` 当前没有 `image-generations` 命令。该命令合入后新增独立的生图端到端测试。
- 不验证企微会话能力：`main` 当前没有 `wecom-conversations` 命令。该命令合入后再将其查询命令加入测试。

## 方案

- 新增 `scripts/read-only-e2e-test.mjs`，直接运行已编译的 `dist/index.js`。
- 新增 `npm run test:e2e`，先编译后运行脚本。
- 测试账号名默认值为 `test`；密码不写入仓库，未提供 `PRIMECLI_E2E_PASSWORD` 时测试失败。
- 测试失败时输出命令、退出码和错误信息；测试结束时输出已验证与因缺少测试数据跳过的命令。

## 验收标准

- [ ] `npm run test:e2e` 能以环境变量提供的测试账号完成登录。
- [ ] 每个不依赖记录 ID 的查询命令均返回有效 JSON。
- [ ] 依赖记录 ID 的查询命令在有可用数据时被验证；无数据时明确输出跳过原因。
- [ ] 测试不写入用户 HOME 下的 primecli 配置。
- [ ] `npm test` 与 `npm run test:e2e` 均通过。
