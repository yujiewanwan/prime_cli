# CLI 分发能力清理

- 交付：https://github.com/yujiewanwan/prime_cli/issues/49
- 父需求：https://github.com/yujiewanwan/prime_prd/issues/15
- Iteration: 202609-2

## 范围

CLI 仅保留企微触达统计、跟进、今日待办和好友归属查询能力。移除 `wechat-touch distribute`、`wechat-touch distribution-users` 的命令注册、请求、专用参数类型与校验、角色声明及专用用例；不增加替代分发或回收命令。仓库 README、Skill、功能文档及 `dist` 与当前命令集一致。已安装的 Skill 副本不在交付范围内。

## 验证

- `npm run lint`、`npm test`、`npm run build` 通过。
- `scripts/retired-commands-test.mjs` 使用构建后的入口、临时配置和本地随机端口 HTTP 服务。配置包含测试 token 与 `SUPER_ADMIN` 角色。
- 帮助中无两个旧命令；旧命令均以退出码 1 报 unknown command，HTTP 请求计数为 0。
- `stats`、`items`、`item` 仍通过原 GET 路径返回数据；该正向验证同时确认 HTTP 请求计数有效。
- 真实后端端到端测试未运行；本交付不修改后端接口。

## 发布约束

本交付优先于 prime_contact #715 发布。合并和发布需用户授权。
