# 移除 Hermes 提示词与企微群聊查询命令

## 需求

不再对外提供以下命令：

- `primecli hermes prompt <code>`
- `primecli wechat-touch chat --room-id <roomId>`

## 范围

- 删除 Hermes 命令注册与实现文件。
- 删除群聊内容查询命令及其选项类型。
- 删除对应的 Agent Skill。
- 更新 README、中文 README、共享 Skill 和企微触达 Skill 中的能力、权限与使用说明。
- 重新构建并提交 `dist/` 编译产物。

不修改后端接口，不影响其他企微触达、公众号、热点、公司和认证命令。

## 方案

从 CLI 启动入口移除 Hermes 命令注册，并删除该命令模块。删除 `wechat-touch` 下的 `chat` 子命令、其参数类型和本地权限声明。同步删除所有仅用于这两个命令的文档与 Skill 内容。

## 验证

- 执行 `npm run build`。
- 执行现有 smoke test。
- 确认 `primecli --help` 不包含 `hermes`，`primecli wechat-touch --help` 不包含 `chat`。
- 确认 README、Skills 和 `dist/` 中没有已移除命令的引用。
