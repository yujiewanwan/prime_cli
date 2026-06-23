---
name: primecli-wechat-official
description: Use primecli-wechat-official for PrimeContact WeChat official account article workflows, including fetching latest articles, listing official accounts by tag, querying articles by fakeid and time window, and updating official account credentials.
allowed-tools: Bash(primecli:*)
---

# primecli wechat official

开始前必须先读取 `../primecli-shared/SKILL.md`，其中包含安装、登录、权限和安全规则。

## 任务到命令

| 用户意图 | 命令 |
| --- | --- |
| 拉取最新公众号文章 | `primecli wechat-official articles fetch` |
| 查询公众号账号列表 | `primecli wechat-official articles accounts` |
| 按 fakeid 查询公众号文章 | `primecli wechat-official articles by-fakeid --fakeids <fakeids>` |
| 更新公众号登录态 | `primecli wechat-official credentials update --id <id> --token <token> --cookie <cookie>` |

## 公众号文章

```bash
primecli wechat-official articles fetch
primecli wechat-official articles accounts [--tag <tag>]
primecli wechat-official articles by-fakeid --fakeids <fakeid1,fakeid2> [--date <yyyy-MM-dd>] [--start-time <timestamp>] [--end-time <timestamp>]
```

- `articles fetch` 需要 `SUPER_ADMIN`；当前用户不是 `SUPER_ADMIN` 时不要调用。
- `articles accounts` 默认 `--tag hot`，用于查询热点公众号列表。
- `articles by-fakeid` 的 `--fakeids` 必填，多个 fakeid 用逗号分隔。
- `articles by-fakeid` 默认查询当天 00:00:00 到 23:59:59。
- `--start-time` 和 `--end-time` 是秒级 Unix timestamp；传入后会覆盖默认日期窗口的对应边界。

## 公众号登录态

```bash
primecli wechat-official credentials update --id <wechatOfficialAccountId> --token <token> --cookie <cookie> [--dry-run]
```

- 需要 `SUPER_ADMIN`；当前用户不是 `SUPER_ADMIN` 时不要调用。
- 这是写操作，优先使用 `--dry-run`。
- `--id` 是 `wechat_official_account.id`，不是热点公众号列表里的 `wechat_official_mp_account.id`。
- `--token` 和 `--cookie` 均必填且不能为空白。
- 不要在回复中展示完整 token 或 cookie。

## 输出处理

- 命令返回 JSON。
- 汇报文章查询结果时优先展示公众号、标题、发布时间、文章链接或文章标识。
- 汇报登录态更新时只说明 dry-run 或更新结果，不回显 token 或 cookie。
