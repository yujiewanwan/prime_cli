# primecli Agent 使用说明

## 适用场景

当 Agent 需要与 PrimeContact 系统交互时，调用 `primecli` CLI：

- 登录/认证
- 搜索公司信息
- 查询热点话题
- 查看企微触达统计数据
- 查看团队触达汇总

## 前置条件

- `primecli` 需已安装（`npm install -g yujiewanwan/prime_cli` 或 `npm install -g primecli`）
- 默认 API Base URL: `https://primeapi.aizee.cc`
- 可通过环境变量 `PRIMECLI_BASE_URL` 覆盖 API 地址
- Token 保存在 `~/.config/primecli/config.json`

## 认证

### 登录

Agent 使用非交互式参数登录：

```bash
primecli auth login --username <username> --password <password>
```

登录成功后 token 自动保存。若出现 401，重新登录即可。

### 查看当前用户

```bash
primecli auth profile
```

返回 JSON 格式的当前登录用户信息。

## 公司查询

### 按名称搜索公司

```bash
primecli company search -n <公司名称关键词> [--page <页码>] [--size <每页条数>]
```

**参数**：
- `-n, --name` — 公司名称，支持模糊匹配（必填）
- `--page` — 页码，默认 1
- `--size` — 每页条数，默认 10

**示例**：
```bash
# 搜索名称包含"科技"的公司，每页 5 条
primecli company search -n "科技" --size 5

# 翻页
primecli company search -n "物流" --page 2 --size 10
```

**返回**：Spring Page 分页对象，content 为 CompanyVO 数组，包含 `name`, `legalRepresentative`, `unifiedSocialCreditCode`, `companyScale`, `insuredCount`, `registerAddress`, `establishmentDate`, `businessScope`, `dataSources` 等字段。

**触发条件**：当用户询问"查找公司"、"搜索公司"、"有哪些 XX 公司"、"公司信息"等时使用。

## 热点话题

### 按日期查询热点话题

```bash
primecli hot-topics by-date -d <yyyy-MM-dd>
```

**参数**：
- `-d, --date` — 日期，格式 yyyy-MM-dd（必填）

**注意**：热点话题为 T+1 产出，当日查询当天通常无数据，应查询前一天或更早的日期。

**示例**：
```bash
# 查询昨天的热点话题
primecli hot-topics by-date -d "2026-06-09"
```

**返回**：HotTopicVO 数组，每个话题包含：
- `id`, `title`, `summary`, `topicDate`
- `sources` — 来源文章列表（`title`, `link`）
- `contents` — 多版本内容（ARTICLE 长文 / IMAGE_ARTICLE 海报），含 `contentType`, `styleCode`, `title`, `content`, `imageUrls`

**触发条件**：当用户询问"热点话题"、"今日热点"、"昨天热点"、"最近有什么热点"等时使用。

## 企微触达

### 触达统计（全员）

```bash
primecli wechat-touch stats
```

**返回**：
- `today` / `last7Days` — 各含 `totalCount`, `requestedCount`, `acceptedCount`, `repliedCount`, `businessCardCount`
- `passRate` — 通过率

**触发条件**：当用户询问"企微触达统计"、"触达数据"、"今天触达情况"等时使用。

### 团队汇总（按个人维度）

```bash
primecli wechat-touch team-summary [--start-date <yyyy-MM-dd>] [--end-date <yyyy-MM-dd>]
```

**参数**：
- `--start-date` — 开始日期，默认当天
- `--end-date` — 结束日期，默认当天

**示例**：
```bash
# 今日团队汇总
primecli wechat-touch team-summary

# 指定日期范围
primecli wechat-touch team-summary --start-date "2026-06-01" --end-date "2026-06-09"
```

**返回**：
- 总体汇总：`totalCount`, `foundCount`, `requestedCount`, `acceptedCount`, `repliedCount`, `businessCardCount`, 各意向等级计数等
- `users` 数组 — 每个用户的 `userId`, `username`, `name` 及各维度明细

**触发条件**：当用户询问"团队汇总"、"各人触达情况"、"团队触达明细"等时使用。

## 常见失败处理

| 错误 | 处理 |
|------|------|
| `No saved token` | 先执行 `primecli auth login --username <user> --password <pass>` |
| `Authentication failed` / 401 | Token 过期，重新执行登录命令 |
| API 连接失败 | 检查 `PRIMECLI_BASE_URL` 环境变量是否正确 |
| `primecli: command not found` | 执行 `npm install -g yujiewanwan/prime_cli` 安装 |

## 命令速查

```bash
# 认证
primecli auth login --username <user> --password <pass>
primecli auth profile

# 公司
primecli company search -n <name> [--page 1] [--size 10]

# 热点话题
primecli hot-topics by-date -d <yyyy-MM-dd>

# 企微触达
primecli wechat-touch stats
primecli wechat-touch team-summary [--start-date <date>] [--end-date <date>]
```
