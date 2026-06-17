---
name: primecli
description: Use primecli to interact with the PrimeContact system. This skill provides company search, hot topics query, WeChat touch outreach stats, follow-up items, group chat content, team summary, and contact distribution. Use when the user asks about companies (查找公司, 搜索公司), hot topics (热点话题, 今日/昨日热点), WeChat touch outreach data (企微触达, 触达统计), follow-up items (触达列表, 触达跟进), group chat messages (群聊聊天记录, 聊天内容), team performance (团队汇总, 触达明细), or distributing contacts (分发联系人, 下发线索).
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
- 若出现 401 或 `Authentication failed`，重新执行登录命令

## 命令

### 公司查询

```bash
primecli company search -n <公司名称关键词> [--page <页码>] [--size <每页条数>]
```

- `-n, --name` — 公司名称，模糊匹配（必填）
- `--page` — 页码，默认 1
- `--size` — 每页条数，默认 10

**触发**：用户询问"查找公司"、"搜索 XX 公司"、"有哪些物流公司"等。

### 热点话题

```bash
primecli hot-topics by-date -d <yyyy-MM-dd>
```

- `-d, --date` — 日期，yyyy-MM-dd 格式（必填）
- **注意**：热点为 T+1 产出，查当天通常无数据，应查前一天或更早

**触发**：用户询问"热点话题"、"今天/昨天的热点"、"最近有什么热点"等。

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
- 仅 SUPER_ADMIN 可访问（后端校验）
- 返回消息列表，含发送人、发送时间、消息类型、消息内容

**触发**：用户要求"查看群聊聊天记录"、"看群聊说了什么"等。

### 联系人分发

```bash
# 查看可分发人员列表
primecli wechat-touch distribution-users

# 分发联系人给指定用户
primecli wechat-touch distribute -u <userId> -c <count>
```

- `-u, --user-id` — 目标用户 ID（必填）
- `-c, --count` — 分发数量，范围 1-150（必填）
- 需要 SUPER_ADMIN 角色
- 每个用户每天只能分发一次

**触发**：用户询问"分发联系人"、"下发线索"、"分配给谁"、"还有多少可分配"等。

### 认证

```bash
primecli auth login --username <username> --password <password>
primecli auth profile
```

## 常见问题

| 错误 | 处理 |
|------|------|
| `No saved token` | 执行 `primecli auth login --username <user> --password <pass>` |
| `Authentication failed` / 401 | Token 过期，重新登录 |
| `Error: HTTP 500` | 后端异常，告知用户稍后重试 |
| `primecli: command not found` | 执行 `npm install -g yujiewanwan/prime_cli` |
