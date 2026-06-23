---
name: primecli-hot-topics
description: Use primecli-hot-topics when the user explicitly asks to create, submit, write, or dry-run PrimeContact hot topics from a JSON payload file. Do not use for researching public trending topics.
allowed-tools: Bash(primecli:*)
---

# primecli hot topics

开始前必须先读取 `../primecli-shared/SKILL.md`，其中包含安装、登录、权限和安全规则。

## 使用场景

- 用户要求把热点 JSON 写入 PrimeContact。
- 用户要求创建、提交或 dry-run 热点 payload。

不要用于公开热点调研；当前 CLI 只提供热点创建或覆盖命令，不提供热点查询命令。

## 热点创建

```bash
primecli hot-topics create --json <payload.json> [--dry-run]
```

- 从 JSON 文件创建或覆盖热点。
- `--json` 指向完整热点创建 payload 文件，结构应匹配 `POST /api/hot-topics`。
- 这是写操作，优先使用 `--dry-run`。
- 未显式声明角色要求，默认允许已登录用户请求，最终权限以后端为准。
- 当前不提供热点按日期查询命令。

## 输出处理

- dry-run 时说明将提交的方法、路径和 payload 摘要。
- 真实提交后说明后端返回结果。
- 如果 payload 中包含敏感信息，不要在回复中完整展开。
