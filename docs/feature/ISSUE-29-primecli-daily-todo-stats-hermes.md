# Feature Spec

## 基本信息

- Issue: #29
- 标题: [primecli] 增加今日代办、今日触达跟进统计及 Hermes Prompt 查询命令
- 负责人: @yujiewanwan
- 状态: Approved

## 审核门禁

- [x] 需求文档已完成人工审核
- [x] 审核结论为 Approved
- [x] 未通过人工审核前，不开始编码实现

## 背景与目标

### 背景

primecli 当前已支持 `wechat-touch stats`、`wechat-touch items` 等命令，但缺少对以下场景的便捷查询：

1. 销售每日上班后需要快速查看今日需跟进的客户数量，并按 A/B/C/D 意向等级分布。
2. 销售需要查看今日需跟进的客户明细（群名称、公司、微信、手机号、意向、备注）。
3. 销售主管或销售本人需要查看今日触达跟进漏斗（总数量 / 已跟进 / 已通过 / 已绑定）。
4. 超级管理员/销售主管需要查看销售人员（归属员工）列表，并支持按名字查找 userId。
5. HermesAgent 需要通过 primecli 查询 PrimeContact 后端 issue #354 提供的 Prompt 配置。

### 目标

在 primecli 中新增 5 个只读命令，分别封装 PrimeContact 已存在的后端接口。

### 非目标

- 不修改 PrimeContact 后端代码、数据库或业务逻辑。
- 不新增写操作。
- 不修改现有命令行为。
- 不对 Hermes Prompt 接口做缓存或本地持久化。

## 需求说明

### 1. 查询今日代办（意向等级分布）

对应 PrimeContact 前端页面 `WechatTouchDailyTodoPage` 顶部的意向筛选统计。

后端接口：

```http
GET /api/wechat-touch/daily-todo/summary?userId={userId}
```

响应示例：

```json
{
  "total": 12,
  "aCount": 3,
  "bCount": 4,
  "cCount": 3,
  "dCount": 2
}
```

CLI 命令：

```bash
primecli wechat-touch daily-todo-summary [--user-id <userId>]
```

- `--user-id` 可选。
- 普通销售用户只能查看自己的待办分布；`SUPER_ADMIN` / `SALES_DIRECTOR` 可通过 `--user-id` 查看指定员工，最终权限由后端兜底。

### 2. 查询今日代办明细

对应 PrimeContact 前端页面 `WechatTouchDailyTodoPage` 待办列表。

后端接口：

```http
GET /api/wechat-touch/daily-todo?userId={userId}&intentLevel={intentLevel}&page={page}&size={size}
```

CLI 命令：

```bash
primecli wechat-touch daily-todo [--user-id <userId>] [--intent-level A|B|C|D] [--page <page>] [--size <size>]
```

- `--user-id` 可选。
- `--intent-level` 可选，仅支持 A/B/C/D。
- `--page`、`--size` 可选，默认 1 / 20。
- 返回每条待办的群名称、公司名称、微信昵称、微信号、手机号、意向等级、备注和归属员工。群名称按 PrimeContact 前端命名规则自动拼接。

### 3. 查询今日触达跟进统计

对应 PrimeContact 前端页面 `WechatTouchFollowupPage` 顶部的今日统计卡片，以及 Dashboard 中按人员查看的今日触达数据。

后端接口：

- 普通用户 / 指定 `userId` 时：`GET /api/wechat-touch/stats?userId={userId}`
- `SUPER_ADMIN` 未指定 `userId` 时：`GET /api/dashboard/summary?wechatStartDate={today}&wechatEndDate={today}`

响应中的 `today` 字段示例：

```json
{
  "today": {
    "totalCount": 50,
    "followedUpCount": 30,
    "acceptedCount": 20,
    "boundCount": 10
  }
}
```

CLI 命令：

```bash
primecli wechat-touch today-stats [--user-id <userId>]
```

- `--user-id` 可选。
- `SUPER_ADMIN` 不传 `--user-id` 时汇总全员今日数据，返回 `{ today, users }`。
- `SUPER_ADMIN` 传入 `--user-id` 时查询指定销售个人；其他角色不传 `--user-id` 时查询当前登录用户自己。
- 输出保留 `totalCount`、`followedUpCount`、`acceptedCount`、`boundCount` 四个关键指标。

### 4. 查询销售人员（归属员工）列表

对应 PrimeContact 前端 `WechatTouchDailyTodoPage` 中按员工筛选的下拉框数据来源。

后端接口：

```http
GET /api/wechat-touch/friends/owners
```

响应示例：

```json
[
  { "userId": 1, "username": "alice", "name": "Alice" },
  { "userId": 2, "username": "bob", "name": "Bob" }
]
```

CLI 命令：

```bash
primecli wechat-touch friend-owners [--name <name>]
```

- 需要 `SUPER_ADMIN` 或 `SALES_DIRECTOR`。
- `--name` 可选，按 `name` 或 `username` 子串本地过滤，用于只有销售名字时查找对应 `userId`。

### 5. 查询 HermesAgent Prompt

对应 PrimeContact issue #354 新增接口，路径为 `/api/hermes/prompts/{code}`，当前安全配置为 `permitAll`。

后端接口：

```http
GET /api/hermes/prompts/SUPER_INTERN_MORNING_TASKS
GET /api/hermes/prompts/SUPER_INTERN_END_OF_DAY_REPORT
```

响应示例：

```json
{
  "code": "SUPER_INTERN_MORNING_TASKS",
  "version": "2026-06-29",
  "prompt": "你现在处于超级实习生计划的早间任务模式...",
  "updatedAt": "2026-06-29T09:00:00"
}
```

CLI 命令：

```bash
primecli hermes prompt <code>
```

- `code` 为必填位置参数。
- 因接口 `permitAll`，命令本身不要求登录角色；但按 primecli 惯例，命令仍会读取本地配置（如果已登录则附带 token，后端会忽略）。

## 方案概述

- 在 `src/commands/wechat-touch.ts` 中新增四个 subcommand：
  - `daily-todo-summary`
  - `daily-todo`
  - `today-stats`
  - `friend-owners`
- 新增 `src/commands/hermes.ts`，注册 `hermes prompt <code>` 命令。
- 在 `src/index.ts` 中注册 `hermes` 命令组。
- 更新 `skills/primecli-wechat-contact/SKILL.md`，补充新命令到任务映射表。
- 新增 `skills/primecli-hermes/SKILL.md`，描述 Hermes Prompt 查询命令。

## 改动范围

- `src/commands/wechat-touch.ts`：新增 `daily-todo-summary`、`daily-todo`、`today-stats`、`friend-owners`。
- `src/commands/hermes.ts`：新增 Hermes 命令组。
- `src/index.ts`：注册 Hermes 命令组。
- `skills/primecli-wechat-contact/SKILL.md`：更新命令映射与说明。
- `skills/primecli-hermes/SKILL.md`：新增 skill 文档。
- `docs/feature/ISSUE-29-primecli-daily-todo-stats-hermes.md`：本需求文档。

## 验收标准

- [ ] `primecli wechat-touch daily-todo-summary` 能正确返回 A/B/C/D 数量。
- [ ] `primecli wechat-touch daily-todo` 能正确返回今日代办明细（含群名称、公司、微信、手机号、意向、备注）。
- [ ] `primecli wechat-touch today-stats` 能正确返回今日总数量/已跟进/已通过/已绑定。
- [ ] `primecli wechat-touch friend-owners` 能正确返回销售人员列表，并支持 `--name` 本地过滤。
- [ ] `primecli hermes prompt SUPER_INTERN_MORNING_TASKS` 能返回 Prompt 内容。
- [ ] 相关 SKILL 文档已更新。
- [ ] `npm run build && npm run lint` 通过。

## 测试与回归

- 测试点：
  - 四个新命令的 help 输出正常。
  - `daily-todo-summary` 不传 `userId` 时只查询当前用户。
  - `daily-todo` 支持按 `intent-level` 筛选，输出包含群名称、公司、微信、手机号、意向、备注。
  - `today-stats` 不传 `userId` 时只查询当前用户。
  - `hermes prompt` 对缺失 `code` 参数给出明确报错。
- 回归范围：
  - 现有 `wechat-touch` 命令行为不变。
  - `npm run test` 通过。

## 审核记录

- 需求文档审核人：用户
- 需求文档审核结论：Approved
- 实现结果审核人：
- 实现结果审核结论：

## 发布与回滚

- 发布步骤：合并 PR 后随 npm 包正常发布。
- 回滚方案：回滚本 Issue PR。
