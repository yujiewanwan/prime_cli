---
name: primecli
description: Use primecli to interact with the PrimeContact system. This skill provides company search, WeChat touch outreach stats, follow-up items, group chat content, team summary, contact distribution, WeChat official account article queries, credential updates, and hot topic creation. Use when the user asks about companies (查找公司, 搜索公司), WeChat touch outreach data (企微触达, 触达统计), follow-up items (触达列表, 触达跟进), group chat messages (群聊聊天记录, 聊天内容), team performance (团队汇总, 触达明细), distributing contacts (分发联系人, 下发线索), official account articles (公众号文章), or hot topics (热点).
allowed-tools: Bash(primecli:*)
---

# primecli

CLI 程序，供 Agent 与 PrimeContact 系统交互。

## 前置条件

- `primecli` 需已全局安装：`npm install -g yujiewanwan/prime_cli`
- 默认 API Base URL: `https://primeapi.aizee.cc`，可通过环境变量 `PRIMECLI_BASE_URL` 覆盖
- 首次使用需先登录：
  ```bash
  primecli auth login --username <username> --password <password>
  ```
- 登录成功后 token 保存在 `~/.config/primecli/config.json`
- 登录成功后会缓存当前用户角色；仅 `SUPER_ADMIN` 可用的命令会在执行前做本地权限校验
- 若出现 401 或 `Authentication failed`，重新执行登录命令

## 权限规则

- 未明确标注角色要求的命令，默认允许已登录用户请求。
- 明确标注 `SUPER_ADMIN` 的命令，当前用户不是 `SUPER_ADMIN` 时不要调用。
- 后续新增受角色限制的接口时，必须在命令文档中标注所需角色。
- 后端 403 始终作为最终权限兜底。

## 命令

### 公司查询

```bash
primecli company search -n <公司名称关键词> [--page <页码>] [--size <每页条数>]
```

- `-n, --name` — 公司名称，模糊匹配（必填）
- `--page` — 页码，默认 1
- `--size` — 每页条数，默认 10

**触发**：用户询问"查找公司"、"搜索 XX 公司"、"有哪些物流公司"等。

### 企微触达统计

```bash
primecli wechat-touch stats
```

- 返回全员汇总：今日/近7日的总线索数、已申请、已通过、已回复、已获取名片、通过率

**触发**：用户询问"触达统计"、"企微触达数据"、"今天触达情况"等。

### 团队汇总

```bash
primecli wechat-touch team-summary [--start-date <yyyy-MM-dd>] [--end-date <yyyy-MM-dd>]
```

- `--start-date` — 开始日期，默认当天
- `--end-date` — 结束日期，默认当天
- 返回总体汇总 + 每个用户的明细（userId, username, name, 各维度计数）

**触发**：用户询问"团队汇总"、"各人触达情况"、"团队触达明细"等。

### 触达跟进列表

```bash
primecli wechat-touch items [--date <yyyy-MM-dd>] [--user-id <userId>] [--group-bound|--no-group-bound] [--page <page>] [--size <size>]
```

- `--date` — 日期筛选，yyyy-MM-dd 格式（可选）
- `--user-id` — 按负责人筛选（可选，不传默认当前用户）
- `--group-bound` — 只看已绑定群聊的记录
- `--no-group-bound` — 只看未绑定群聊的记录
- `--page` — 页码，默认 1
- `--size` — 每页条数，默认 50
- 返回触达跟进列表，每条记录含 `roomId`、`groupBound` 等字段

**触发**：用户询问"触达列表"、"已绑定群聊的触达记录"、"查 roomId"等。

### 群聊聊天内容

```bash
primecli wechat-touch chat --room-id <roomId> [--page <page>] [--size <size>]
```

- `--room-id` — 群聊 roomId（必填）
- `--page` — 页码，默认 1
- `--size` — 每页条数，默认 20
- 仅 `SUPER_ADMIN` 可访问；普通用户不要调用
- 返回消息列表，含发送人、发送时间、消息类型、消息内容

**触发**：用户要求"查看群聊聊天记录"、"看群聊说了什么"等。

### 公众号文章

```bash
# 拉取最新公众号文章，仅 SUPER_ADMIN
primecli wechat-official articles fetch

# 查询 hot 公众号列表
primecli wechat-official articles accounts [--tag hot]

# 按 fakeid 和时间窗口查询文章
primecli wechat-official articles by-fakeid --fakeids <fakeid1,fakeid2> [--date <yyyy-MM-dd>] [--start-time <timestamp>] [--end-time <timestamp>]
```

- `articles fetch` 需要 `SUPER_ADMIN` 角色；普通用户不要调用。
- `articles accounts` 默认 `--tag hot`，用于查询热点公众号列表。
- `articles by-fakeid` 的 `--fakeids` 必填，多个 fakeid 用逗号分隔。
- `articles by-fakeid` 默认查询当天 00:00:00 到 23:59:59，可用 `--date` 或 `--start-time` / `--end-time` 覆盖。

**触发**：用户询问"拉取公众号文章"、"查询热点公众号"、"按 fakeid 查文章"等。

### 公众号登录态

```bash
primecli wechat-official credentials update --id <wechatOfficialAccountId> --token <token> --cookie <cookie> [--dry-run]
```

- 需要 `SUPER_ADMIN` 角色；普通用户不要调用。
- `--id` 是 `wechat_official_account.id`，不是热点公众号列表里的 `wechat_official_mp_account.id`。
- `--token` 和 `--cookie` 均必填且不能为空白。
- `--dry-run` 只输出将要提交的请求，不调用后端。

**触发**：用户要求"更新公众号 token/cookie"、"更新公众号后台登录态"等。

### 热点创建

```bash
primecli hot-topics create --json <payload.json> [--dry-run]
```

- `--json` 指向完整热点创建 payload 文件，结构应匹配 `POST /api/hot-topics`。
- `--dry-run` 只读取并输出 JSON 请求，不写入后端。
- 不提供热点按日期查询命令。

**触发**：用户要求"创建热点"、"写入热点"、"提交热点 JSON"等。

### 联系人分发

```bash
# 查看可分发人员列表
primecli wechat-touch distribution-users

# 分发联系人给指定用户
primecli wechat-touch distribute -u <userId> -c <count>
```

- `-u, --user-id` — 目标用户 ID（必填）
- `-c, --count` — 分发数量，范围 1-150（必填）
- `distribution-users` 和 `distribute` 均需要 `SUPER_ADMIN` 角色；普通用户不要调用
- 每个用户每天只能分发一次

**触发**：用户询问"分发联系人"、"下发线索"、"分配给谁"、"还有多少可分配"等。

### 认证

```bash
primecli auth login --username <username> --password <password>
primecli auth profile
```

## 常见问题

| 错误                          | 处理                                                           |
| ----------------------------- | -------------------------------------------------------------- |
| `No saved token`              | 执行 `primecli auth login --username <user> --password <pass>` |
| `Authentication failed` / 401 | Token 过期，重新登录                                           |
| `requires role: SUPER_ADMIN`  | 当前账号不是 SUPER_ADMIN，不要继续调用该命令                   |
| `Permission denied` / 403     | 后端拒绝访问，确认账号角色或重新登录                           |
| `Error: HTTP 500`             | 后端异常，告知用户稍后重试                                     |
| `primecli: command not found` | 执行 `npm install -g yujiewanwan/prime_cli`                    |
