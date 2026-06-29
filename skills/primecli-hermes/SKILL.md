---
name: primecli-hermes
description: Use primecli-hermes to query HermesAgent prompt configurations from PrimeContact, including the super intern morning tasks and end-of-day report prompts.
allowed-tools: Bash(primecli:*)
---

# primecli hermes

开始前必须先读取 `../primecli-shared/SKILL.md`，其中包含安装、登录、权限和安全规则。

本 skill 覆盖 `hermes prompt` 命令，用于读取 PrimeContact 为 HermesAgent 维护的 Prompt 配置。

## 任务到命令

| 用户意图 | 命令 |
| --- | --- |
| 查询超级实习生早间任务 Prompt | `primecli hermes prompt SUPER_INTERN_MORNING_TASKS` |
| 查询超级实习生日报 Prompt | `primecli hermes prompt SUPER_INTERN_END_OF_DAY_REPORT` |

## 查询 HermesAgent Prompt

```bash
primecli hermes prompt <code>
```

- `code`：Prompt 编码，必填。当前支持 `SUPER_INTERN_MORNING_TASKS` 和 `SUPER_INTERN_END_OF_DAY_REPORT`。
- 后端接口 `GET /api/hermes/prompts/{code}` 为公开只读接口，不校验登录角色；primecli 仍会读取本地配置，如果已登录会附带 token（后端会忽略）。
- 返回 JSON 包含 `code`、`version`、`prompt`、`updatedAt`。

## 输出处理

- 命令返回 JSON。
- 汇报时优先展示 `code`、`version` 和 Prompt 内容摘要；不要直接输出完整长 Prompt，除非用户要求。
