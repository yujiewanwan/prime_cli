---
name: primecli
description: Use primecli when the user explicitly asks to read or write PrimeContact data, including company search, WeChat touch stats or follow-up items, group chat content, contact distribution, WeChat official account articles or credentials, and hot topic creation. Do not use for general web/company research outside PrimeContact.
allowed-tools: Bash(primecli:*)
---

# primecli

`primecli` 是供 Agent 与 PrimeContact 系统交互的 CLI。

## 使用边界

使用本 skill：

- 用户明确要求查询或操作 PrimeContact 中的数据。
- 用户提到公司查询、企微触达、触达跟进、群聊内容、联系人分发、公众号文章、公众号登录态、热点创建等 PrimeContact 能力。

不要使用本 skill：

- 用户只是做公开互联网调研、泛泛询问公司信息或行业热点。
- 用户没有明确要求访问 PrimeContact 数据。
- 用户请求的能力未在下方命令中列出；此时说明当前 `primecli` 暂不支持。

## 执行准则

- 读操作可在确认意图后直接执行。
- 写操作优先使用 `--dry-run`；确认请求内容无误后再真实提交。
- 不要在回复中回显 token、cookie、password 等敏感值。
- 如果命令需要 `SUPER_ADMIN`，但当前登录用户不是 `SUPER_ADMIN`，不要调用该命令。
- 如果本地权限判断放行但后端返回 403，以后端拒绝为准。
- 命令输出通常是 JSON；向用户汇报时提炼关键信息，不要原样倾倒大段 JSON，除非用户要求。

## 前置条件

- `primecli` 需已安装：
  ```bash
  npm install -g yujiewanwan/prime_cli
  ```
- 如果 Agent 尚未安装 skill：
  ```bash
  npx skills add yujiewanwan/prime_cli
  ```
- 默认 API Base URL 是 `https://primeapi.aizee.cc`。
- API 地址优先级：`PRIMECLI_BASE_URL` > 配置文件 `baseUrl` > 默认地址。
- 首次使用需登录：
  ```bash
  primecli auth login --username <username> --password <password>
  ```
- 也可交互式登录，避免在命令行里暴露密码：
  ```bash
  primecli auth login
  ```
- token、当前用户角色和可选 `baseUrl` 保存在 `~/.config/primecli/config.json`。

## 权限规则

- 未明确标注角色要求的命令，默认允许已登录用户发起请求。
- 明确标注 `SUPER_ADMIN` 的命令，当前用户不是 `SUPER_ADMIN` 时不要调用。
- 后续新增受角色限制的接口时，必须在命令文档中标注所需角色。
- 后端 403 始终作为最终权限兜底。

当前 `SUPER_ADMIN` 专属命令：

- `primecli wechat-touch chat`
- `primecli wechat-touch distribute`
- `primecli wechat-touch distribution-users`
- `primecli wechat-official articles fetch`
- `primecli wechat-official credentials update`

## 任务到命令

| 用户意图 | 命令 |
| --- | --- |
| 查看当前登录用户 | `primecli auth profile` |
| 搜索公司 | `primecli company search -n <名称>` |
| 查看企微触达统计 | `primecli wechat-touch stats` |
| 查看团队触达汇总 | `primecli wechat-touch team-summary` |
| 查看触达跟进列表 | `primecli wechat-touch items` |
| 根据 roomId 查看群聊内容 | `primecli wechat-touch chat --room-id <roomId>` |
| 查看可分发人员 | `primecli wechat-touch distribution-users` |
| 分发联系人 | `primecli wechat-touch distribute -u <userId> -c <count>` |
| 拉取最新公众号文章 | `primecli wechat-official articles fetch` |
| 查询公众号账号列表 | `primecli wechat-official articles accounts` |
| 按 fakeid 查询公众号文章 | `primecli wechat-official articles by-fakeid --fakeids <fakeids>` |
| 更新公众号登录态 | `primecli wechat-official credentials update --id <id> --token <token> --cookie <cookie>` |
| 创建或覆盖热点 | `primecli hot-topics create --json <payload.json>` |

## 命令细节

### 认证

```bash
primecli auth login [--username <username>] [--password <password>]
primecli auth profile
```

- `auth login` 登录并缓存 token 和当前用户角色。
- `auth profile` 获取当前用户 profile。
- 若出现 401 或 `Authentication failed`，重新登录。

### 公司查询

```bash
primecli company search -n <公司名称关键词> [--page <页码>] [--size <每页条数>]
```

- `-n, --name`：公司名称，模糊匹配，必填。
- `--page`：页码，默认 1。
- `--size`：每页条数，默认 10。

### 企微触达统计

```bash
primecli wechat-touch stats
```

- 返回全员汇总，包括今日和近 7 日的总线索数、已申请、已通过、已回复、已获取名片、通过率。

### 团队汇总

```bash
primecli wechat-touch team-summary [--start-date <yyyy-MM-dd>] [--end-date <yyyy-MM-dd>]
```

- `--start-date`：开始日期，默认当天。
- `--end-date`：结束日期，默认当天。
- 返回总体汇总和每个用户的明细。

### 触达跟进列表

```bash
primecli wechat-touch items [--date <yyyy-MM-dd>] [--user-id <userId>] [--group-bound|--no-group-bound] [--page <page>] [--size <size>]
```

- `--date`：按日期筛选，格式 `yyyy-MM-dd`。
- `--user-id`：按负责人筛选；不传则不加 userId 参数，最终查询范围以后端为准。
- `--group-bound`：只看已绑定群聊的记录。
- `--no-group-bound`：只看未绑定群聊的记录。
- `--page`：页码，默认 1。
- `--size`：每页条数，默认 50。
- 返回记录包含 `roomId`、`groupBound` 等字段，可用于后续查询群聊内容。

### 群聊聊天内容

```bash
primecli wechat-touch chat --room-id <roomId> [--page <page>] [--size <size>]
```

- 需要 `SUPER_ADMIN`。
- `--room-id`：群聊 roomId，必填。
- `--page`：页码，默认 1。
- `--size`：每页条数，默认 20。
- 返回消息列表，包含发送人、发送时间、消息类型、消息内容。

### 联系人分发

```bash
primecli wechat-touch distribution-users
primecli wechat-touch distribute -u <userId> -c <count>
```

- 两个命令都需要 `SUPER_ADMIN`。
- `distribution-users` 查看可分发人员列表。
- `-u, --user-id`：目标用户 ID，必填。
- `-c, --count`：分发数量，必填，范围 1-150。
- 每个用户每天只能分发一次。

### 公众号文章

```bash
primecli wechat-official articles fetch
primecli wechat-official articles accounts [--tag <tag>]
primecli wechat-official articles by-fakeid --fakeids <fakeid1,fakeid2> [--date <yyyy-MM-dd>] [--start-time <timestamp>] [--end-time <timestamp>]
```

- `articles fetch` 需要 `SUPER_ADMIN`。
- `articles accounts` 默认 `--tag hot`，用于查询热点公众号列表。
- `articles by-fakeid` 的 `--fakeids` 必填，多个 fakeid 用逗号分隔。
- `articles by-fakeid` 默认查询当天 00:00:00 到 23:59:59。
- `--start-time` 和 `--end-time` 是秒级 Unix timestamp；传入后会覆盖默认日期窗口的对应边界。

### 公众号登录态

```bash
primecli wechat-official credentials update --id <wechatOfficialAccountId> --token <token> --cookie <cookie> [--dry-run]
```

- 需要 `SUPER_ADMIN`。
- 这是写操作，优先使用 `--dry-run`。
- `--id` 是 `wechat_official_account.id`，不是热点公众号列表里的 `wechat_official_mp_account.id`。
- `--token` 和 `--cookie` 均必填且不能为空白。
- 不要在回复中展示完整 token 或 cookie。

### 热点创建

```bash
primecli hot-topics create --json <payload.json> [--dry-run]
```

- 从 JSON 文件创建或覆盖热点。
- `--json` 指向完整热点创建 payload 文件，结构应匹配 `POST /api/hot-topics`。
- 这是写操作，优先使用 `--dry-run`。
- 当前不提供热点按日期查询命令。

## 常见问题

| 错误 | 处理 |
| --- | --- |
| `primecli: command not found` | 执行 `npm install -g yujiewanwan/prime_cli` |
| `No saved token` | 执行 `primecli auth login` |
| `Authentication failed` / 401 | Token 过期或无效，重新登录 |
| `requires role: SUPER_ADMIN` | 当前账号不是 `SUPER_ADMIN`，不要继续调用该命令 |
| `Permission denied` / 403 | 后端拒绝访问，确认账号角色或重新登录 |
| `Error: HTTP 500` | 后端异常，告知用户稍后重试 |
