# ISSUE-19: 实现公众号热点相关 CLI 接口

## 需求概述

为 `primecli` 新增公众号热点相关原子命令，覆盖公众号文章抓取、热点公众号查询、按 fakeid 查询文章、热点 JSON 写入、公众号后台登录态更新。

本期只实现原子命令，不实现完整串联工作流命令。

## 范围

### 清理

- 清理已废弃的热点按日期查询命令相关残留。
- 不新增热点按日期查询命令。

### 新增命令

#### `primecli wechat-official articles fetch`

- **后端**: `POST /api/wechat-official/articles/fetch`
- **权限**: `SUPER_ADMIN`
- **行为**: 拉取最新公众号文章，输出后端返回 JSON。

#### `primecli wechat-official articles accounts`

- **后端**: `GET /api/wechat-official/articles/accounts?tag=<tag>`
- **参数**:
  - `--tag <tag>` — 公众号 tag，默认 `hot`
- **行为**: 查询指定 tag 的公众号列表，输出后端返回 JSON。

#### `primecli wechat-official articles by-fakeid`

- **后端**: `GET /api/wechat-official/articles/by-fakeid?fakeids=<ids>&startTime=<start>&endTime=<end>`
- **参数**:
  - `--fakeids <ids>` — 逗号分隔的 fakeid 列表，必填
  - `--date <yyyy-MM-dd>` — 查询日期，默认当天
  - `--start-time <timestamp>` — Unix 时间戳，可覆盖默认日期开始时间
  - `--end-time <timestamp>` — Unix 时间戳，可覆盖默认日期结束时间
- **行为**: 按 fakeid 和时间窗口查询公众号文章，输出后端返回 JSON。

#### `primecli wechat-official credentials update`

- **后端**: `PUT /api/wechat-official/accounts/{id}/credentials`
- **权限**: `SUPER_ADMIN`
- **参数**:
  - `--id <id>` — `wechat_official_account.id`，必填
  - `--token <token>` — 微信公众号后台 token，必填且不能为空白
  - `--cookie <cookie>` — 微信公众号后台 cookie，必填且不能为空白
  - `--dry-run` — 只输出将要提交的请求，不调用后端
- **行为**: 更新公众号后台登录态。

#### `primecli hot-topics create`

- **后端**: `POST /api/hot-topics`
- **参数**:
  - `--json <path>` — 热点创建 payload JSON 文件路径，必填
  - `--dry-run` — 只读取并输出 JSON，不调用后端
- **行为**: 创建或覆盖指定日期热点元数据和非媒体内容。

## 实现方案

- 新增 `src/commands/wechat-official.ts` 和 `src/commands/hot-topics.ts`。
- 在 `src/index.ts` 注册两组命令。
- 为 `api-client` 补充 `put<T>(path, body)`。
- 使用现有 `requireRole("SUPER_ADMIN")` 做本地权限拦截。
- 使用现有 `validateDateOption` 校验日期。
- 新增轻量 timestamp 解析，确保 `startTime` / `endTime` 为非负整数。
- 从 JSON 文件读取 `hot-topics create` payload，保持后端 payload 结构由调用方提供，不在 CLI 中重塑。
- dry-run 输出统一 JSON，包含 `dryRun: true`、HTTP method、path 和 body。

## 文档更新

- README / README_CN 增加 `wechat-official` 和 `hot-topics` 命令说明。
- `skills/primecli/SKILL.md` 增加触发场景、命令参数、权限说明和 dry-run 行为。
- 角色权限清单增加：
  - `primecli wechat-official articles fetch`
  - `primecli wechat-official credentials update`

## 验证计划

1. `npm run build`
2. `npm run lint`
3. `node scripts/smoke-test.mjs`
4. 搜索确认废弃命令无残留
5. 检查 CLI help 中出现新增命令
