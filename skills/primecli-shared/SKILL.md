---
name: primecli-shared
description: PrimeContact primecli shared rules for installation, login, base URL, role access control, sensitive values, dry-run safety, output handling, and common errors. Use when first using primecli, when authentication or permission handling is needed, or before any primecli business skill.
allowed-tools: Bash(primecli:*)
---

# primecli shared

`primecli` 是供 Agent 与 PrimeContact 系统交互的 CLI。本 skill 只描述通用规则；具体业务命令请使用对应的 `primecli-*` skill。

## 使用边界

使用 `primecli`：

- 用户明确要求查询或操作 PrimeContact 中的数据。
- 用户提到公司查询、企微触达、联系人分发、公众号文章、公众号登录态、热点创建等 PrimeContact 能力。

不要使用 `primecli`：

- 用户只是做公开互联网调研、泛泛询问公司信息或行业热点。
- 用户没有明确要求访问 PrimeContact 数据。
- 用户请求的能力没有对应 `primecli` 命令；此时说明当前 CLI 暂不支持。

## 前置条件

- `primecli` 需已安装：
  ```bash
  npm install -g yujiewanwan/prime_cli
  ```
- 如果 Agent 尚未安装 skills：
  ```bash
  npx skills add yujiewanwan/prime_cli
  ```
- 默认 API Base URL 是 `https://primeapi.aizee.cc`。
- API 地址优先级：`PRIMECLI_BASE_URL` > 配置文件 `baseUrl` > 默认地址。
- token、当前用户角色和可选 `baseUrl` 保存在 `~/.config/primecli/config.json`。

## 认证

```bash
primecli auth login [--username <username>] [--password <password>]
primecli auth profile
```

- `auth login` 登录并缓存 token 和当前用户角色。
- 优先使用交互式登录，避免在命令行里暴露密码：
  ```bash
  primecli auth login
  ```
- `auth profile` 获取当前用户 profile。
- 若出现 401 或 `Authentication failed`，重新登录。

## 执行准则

- 读操作可在确认意图后直接执行。
- 写操作优先使用 `--dry-run`；确认请求内容无误后再真实提交。
- 不要在回复中回显 token、cookie、password 等敏感值。
- 命令输出通常是 JSON；向用户汇报时提炼关键信息，不要原样倾倒大段 JSON，除非用户要求。
- 相对日期按当前运行环境日期解释；命令接受日期时使用 `yyyy-MM-dd`。

## 权限规则

- 未明确标注角色要求的命令，默认允许已登录用户发起请求。
- 明确标注 `SUPER_ADMIN` 的命令，当前用户不是 `SUPER_ADMIN` 时不要调用。
- 如果本地权限判断放行但后端返回 403，以后端拒绝为准。
- 后续新增受角色限制的接口时，必须在对应 commander 命令、README 和 skill 文档中同步标注角色要求。

当前 `SUPER_ADMIN` 专属命令：

- `primecli wechat-touch chat`
- `primecli wechat-touch distribute`
- `primecli wechat-touch distribution-users`
- `primecli wechat-official articles fetch`
- `primecli wechat-official credentials update`

## 常见问题

| 错误 | 处理 |
| --- | --- |
| `primecli: command not found` | 执行 `npm install -g yujiewanwan/prime_cli` |
| `No saved token` | 执行 `primecli auth login` |
| `Authentication failed` / 401 | Token 过期或无效，重新登录 |
| `requires role: SUPER_ADMIN` | 当前账号不是 `SUPER_ADMIN`，不要继续调用该命令 |
| `Permission denied` / 403 | 后端拒绝访问，确认账号角色或重新登录 |
| `Error: HTTP 500` | 后端异常，告知用户稍后重试 |
