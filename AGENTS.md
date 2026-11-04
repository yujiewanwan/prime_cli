# Prime CLI

`primecli` 是供 Agent 调用 Prime Contact API 的命令行工具，覆盖公司查询、微信触达、公众号、企微会话分析、热点和图片生成；业务数据与最终权限由后端负责。

- 技术入口：TypeScript、Node.js、Commander；源码在 `src/`，发布产物在 `dist/`。
- 通过 GitHub 分发，修改源码需构建并同步 `dist/`，否则安装包无法反映变更。
- [业务能力与命令说明](https://aizeexiaoze.feishu.cn/wiki/JV5zw9G6qi52bqkS23DcxFBzn0e)；主系统见 [Prime Contact](../prime_contact/AGENTS.md)。
- [统一 SOP 与开发规范](../sop/README.md)：构建、验证、分发和交付要求。

开发基线统一遵循飞书研发流程：先安全更新默认主分支 `main`，默认在主目录开发，仅用户明确要求时创建 worktree。需求、技术方案及迭代状态在飞书关联追踪，`docs/specs/` 等与实现对应的契约保留本地。
