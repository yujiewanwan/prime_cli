# ISSUE-3: 新增核心 CLI 命令

## 需求概述

为 `primecli` 新增 4 个 CLI 命令，对接 PrimeContact 后端 API：
1. 公司列表 — 按名称搜索公司
2. 热点话题 — 按日期查询热点话题
3. 企微触达统计 — 全员触达数据汇总
4. 团队汇总 — 按个人维度汇总触达数据（日/时间段）

## 命令设计

### 1. `primecli company search`

- **后端**: `GET /api/companies?name=<name>&page=<page>&size=<size>`
- **参数**:
  - `--name` / `-n` — 公司名称，模糊匹配（必填）
  - `--page` — 页码，默认 1
  - `--size` — 每页条数，默认 10
- **输出**: 分页结果以 JSON 格式输出

### 2. `primecli hot-topics by-date`

- **后端**: `GET /api/hot-topics/{date}`
- **参数**:
  - `--date` / `-d` — 日期，格式 yyyy-MM-dd（必填）
- **输出**: 话题列表以 JSON 格式输出

### 3. `primecli wechat-touch stats`

- **后端**: `GET /api/wechat-touch/stats`
- **参数**: 无
- **输出**: 全员触达统计（今日、近7日、通过率）以 JSON 格式输出

### 4. `primecli wechat-touch team-summary`

- **后端**: `GET /api/wechat-touch/team-summary?startDate=<start>&endDate=<end>`
- **参数**:
  - `--start-date` — 开始日期 yyyy-MM-dd，默认当天
  - `--end-date` — 结束日期 yyyy-MM-dd，默认当天
- **输出**: 团队汇总（总体 + 各用户明细）以 JSON 格式输出

## 实现范围

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/commands/company.ts` | 新增 | company search 命令 |
| `src/commands/hot-topics.ts` | 新增 | hot-topics by-date 命令 |
| `src/commands/wechat-touch.ts` | 新增 | wechat-touch stats / team-summary 命令 |
| `src/index.ts` | 修改 | 注册 3 个新命令模块 |
| `docs/feature/ISSUE-3-add-core-cli-commands.md` | 新增 | 本文档 |

## 设计决策

- 所有命令需要登录，使用 `readConfig()` 获取 token
- 如无 token，提示用户运行 `primecli auth login`
- 输出使用 `JSON.stringify` + 缩进，保持与 `auth profile` 风格一致
- 分页结果原样输出，不做二次处理
- 日期参数使用 ISO 格式 (yyyy-MM-dd)

## 验证计划

1. `npm run build` 编译通过
2. `npm run lint` 无错误
3. 检查命令是否正确注册：`node dist/index.js --help` 应显示新命令
