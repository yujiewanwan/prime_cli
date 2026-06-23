---
name: primecli-company
description: Use primecli-company when the user explicitly asks to search PrimeContact companies by name or find company records inside PrimeContact. Do not use for public web company research.
allowed-tools: Bash(primecli:*)
---

# primecli company

开始前必须先读取 `../primecli-shared/SKILL.md`，其中包含安装、登录、权限和安全规则。

## 使用场景

- 用户要求在 PrimeContact 中查找公司。
- 用户提供公司名称关键词，希望查询系统内公司记录。

不要用于公开互联网公司调研；此 skill 只查询 PrimeContact 数据。

## 公司查询

```bash
primecli company search -n <公司名称关键词> [--page <页码>] [--size <每页条数>]
```

- `-n, --name`：公司名称，模糊匹配，必填。
- `--page`：页码，默认 1。
- `--size`：每页条数，默认 10。
- 未显式声明角色要求，默认允许已登录用户请求，最终权限以后端为准。

## 输出处理

- 命令返回 JSON。
- 向用户汇报时优先提炼公司名称、ID、核心匹配信息和分页情况。
- 如果结果为空，说明 PrimeContact 中未找到匹配记录。
