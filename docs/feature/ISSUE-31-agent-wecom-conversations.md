# Feature Spec

## 基本信息

- Issue: #31
- 标题: feat: add CLI for agent WeCom conversation analysis
- 负责人: Codex
- 状态: Approved

## 审核门禁

- [x] 需求文档已完成人工审核
- [x] 审核结论为 Approved
- [x] 未通过人工审核前，不开始编码实现

## 背景与目标

### 背景

PrimeContact 后端 `AgentWecomConversationController` 已提供 Agent 企业微信会话分析接口，但 `primecli` 还没有对应入口。Agent 目前无法通过标准 CLI 查询待分析会话、读取会话上下文或回写分析结果。

### 目标

新增 `primecli wecom-conversations` 命令模块，覆盖以下三个超级管理员能力：

1. 查询 pending 的会话列表。
2. 查询指定会话的分析上下文。
3. 更新指定会话的分析结果。

### 非目标

- 不修改 PrimeContact 后端接口语义。
- 不新增后端 API、数据库表或迁移。
- 不自动触发 AI 分析流程。
- 不在 CLI 中实现业务分析逻辑。

## 需求说明

新增命令：

```bash
primecli wecom-conversations pending [--conversation-type ROOM|SINGLE] [--limit <limit>]
primecli wecom-conversations context --conversation-id <id>
primecli wecom-conversations result --conversation-id <id> --last-analyzed-seq <seq> [--rolling-summary <text>] [--analysis-result-json <path>] [--analysis-status PENDING|SUCCESS|FAILED|SKIPPED]
```

- `pending` 调用 `GET /api/agent/wecom-conversations/pending-analysis`。
- `context` 调用 `GET /api/agent/wecom-conversations/{conversationId}/analysis-context`。
- `result` 调用 `POST /api/agent/wecom-conversations/{conversationId}/analysis-result`。
- `analysisResult` 从 JSON 文件读取，减少命令行转义成本。
- 三个子命令都必须通过 `requireRole("SUPER_ADMIN")` 做本地权限拦截。

## 方案概述

- 新增 `src/commands/wecom-conversations.ts`，保持现有 commander、axios client 和 JSON 输出风格。
- 在 `src/index.ts` 注册新命令。
- 参数校验复用 `parseIntegerOption`，新增本模块内的枚举归一化。
- 更新 README / README_CN 和 Agent skill 文档，标注命令参数和 `SUPER_ADMIN` 要求。
- 执行 `npm run build` 更新 `dist/`。

## 验收标准

- [x] `primecli wecom-conversations pending` 能返回待分析会话列表。
- [x] `pending` 支持 `--conversation-type ROOM|SINGLE` 和 `--limit` 参数，并做基本参数校验。
- [x] `primecli wecom-conversations context --conversation-id <id>` 能返回会话基础信息、`newMessages` 和 `recentMessages`。
- [x] `primecli wecom-conversations result --conversation-id <id> ...` 能回写 `lastAnalyzedSeq`、`rollingSummary`、`analysisResult`、`analysisStatus`。
- [x] 三个命令都通过本地 `requireRole("SUPER_ADMIN")` 做角色拦截。
- [x] README / Skill 文档同步标注命令和角色要求。
- [x] `npm run build` 通过，且 `dist/` 已更新。
- [x] `npm test` 或现有 smoke test 通过。

## 测试与回归

- 测试点：
  - CLI help 能显示新命令。
  - 参数校验覆盖非法 `conversationType`、非法 `limit` 和非法 `analysisStatus`。
  - TypeScript 编译通过。
  - smoke test 通过。
- 验证记录：
  - `npm run build`
  - `npm test`
  - `node dist/index.js wecom-conversations --help`
  - `node dist/index.js wecom-conversations pending --conversation-type GROUP`
- 回归范围：
  - 现有认证、企微触达、公众号、热点命令。
  - `dist/` 产物随源码同步更新。

## 审核记录

- 需求文档审核人：用户
- 需求文档审核结论：Approved，2026-07-01 开始实现。
- 实现结果审核人：
- 实现结果审核结论：
