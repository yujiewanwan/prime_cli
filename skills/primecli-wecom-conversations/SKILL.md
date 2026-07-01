---
name: primecli-wecom-conversations
description: Use primecli-wecom-conversations for PrimeContact Agent WeCom conversation analysis workflows, including pending conversation discovery, analysis context lookup, and analysis result updates. Use when the user mentions AgentWecomConversationController, 企微会话分析, 会话存档分析, pending 会话, 分析上下文, or 回写会话分析结果.
allowed-tools: Bash(primecli:*)
---

# primecli wecom conversations

开始前必须先读取 `../primecli-shared/SKILL.md`，其中包含安装、登录、权限和安全规则。

本 skill 覆盖 `wecom-conversations` 命令，用于 Agent 企业微信会话分析。

## 任务到命令

| 用户意图 | 命令 |
| --- | --- |
| 查询待分析会话列表 | `primecli wecom-conversations pending [--conversation-type ROOM\|SINGLE] [--limit <limit>]` |
| 查询会话分析上下文 | `primecli wecom-conversations context --conversation-id <id>` |
| 回写会话分析结果 | `primecli wecom-conversations result --conversation-id <id> --last-analyzed-seq <seq> [--rolling-summary <text>] [--analysis-result-json <path>] [--analysis-status PENDING\|SUCCESS\|FAILED\|SKIPPED]` |

## 权限

所有 `wecom-conversations` 命令都需要 `SUPER_ADMIN`；当前用户不是 `SUPER_ADMIN` 时不要调用。

## 待分析会话

```bash
primecli wecom-conversations pending [--conversation-type ROOM|SINGLE] [--limit <limit>]
```

- `--conversation-type`：会话类型，`ROOM` 为群聊，`SINGLE` 为私聊。不传时后端默认查询 `ROOM`。
- `--limit`：返回数量，范围 1-200；不传时后端默认 50。
- 返回 `conversationId`、`conversationKey`、`roomId`、`lastAnalyzedSeq`、`analysisStatus`、`needsAnalysisReason` 等字段。

## 分析上下文

```bash
primecli wecom-conversations context --conversation-id <id>
```

- `--conversation-id`：待查询的会话 ID。
- 返回会话基础信息、滚动总结、已有分析结果、`newMessages` 和 `recentMessages`。
- 会话消息可能包含敏感业务内容，除非用户要求，不要大段原文转述。

## 回写分析结果

```bash
primecli wecom-conversations result --conversation-id <id> --last-analyzed-seq <seq> [--rolling-summary <text>] [--analysis-result-json <path>] [--analysis-status PENDING|SUCCESS|FAILED|SKIPPED]
```

- `--conversation-id`：待更新的会话 ID。
- `--last-analyzed-seq`：本次已分析到的最大消息 `seq`。
- `--rolling-summary`：滚动总结文本。
- `--analysis-result-json`：分析结果 JSON 文件路径。
- `--analysis-status`：分析状态，支持 `PENDING`、`SUCCESS`、`FAILED`、`SKIPPED`。
- 这是写操作；执行前确认 `conversationId`、`lastAnalyzedSeq` 和 JSON 文件内容无误。

## 输出处理

- 命令返回 JSON。
- 汇报 pending 列表时优先展示 `conversationId`、`conversationType`、`roomId`、`analysisStatus` 和 `needsAnalysisReason`。
- 汇报 context 时优先概述消息数量、最新 `seq` 和必要摘要，不要默认倾倒完整消息正文。
- 回写结果后优先确认 `conversationId`、`lastAnalyzedSeq`、`analysisStatus` 和 `analysisUpdatedAt`。
