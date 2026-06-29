---
name: primecli-wechat-contact
description: Use primecli-wechat-contact for PrimeContact WeChat touch workflows, including outreach stats, follow-up items, daily todos, group chat content by roomId, distribution user lists, and contact distribution. Use when the user mentions 企微触达, 触达统计, 触达跟进, 今日代办, 群聊记录, 分发联系人, or 下发线索.
allowed-tools: Bash(primecli:*)
---

# primecli wechat contact

开始前必须先读取 `../primecli-shared/SKILL.md`，其中包含安装、登录、权限和安全规则。

本 skill 覆盖 `wechat-touch` 和联系人分发相关命令。

## 任务到命令

| 用户意图 | 命令 |
| --- | --- |
| 查看企微触达统计 | `primecli wechat-touch stats` |
| 查看触达跟进列表 | `primecli wechat-touch items` |
| 查看今日代办意向统计 | `primecli wechat-touch daily-todo-summary` |
| 查看今日代办明细 | `primecli wechat-touch daily-todo` |
| 查看今日触达跟进统计 | `primecli wechat-touch today-stats` |
| 根据 roomId 查看群聊内容 | `primecli wechat-touch chat --room-id <roomId>` |
| 查看销售人员（归属员工）列表 | `primecli wechat-touch friend-owners` |
| 查看可分发人员 | `primecli wechat-touch distribution-users` |
| 分发联系人 | `primecli wechat-touch distribute -u <userId> -c <count>` |

## 企微触达统计

```bash
primecli wechat-touch stats
```

- 返回全员汇总，包括今日和近 7 日的总线索数、已申请、已通过、已回复、已获取名片、通过率。
- 未显式声明角色要求，默认允许已登录用户请求，最终权限以后端为准。

## 触达跟进列表

```bash
primecli wechat-touch items [--date <yyyy-MM-dd>] [--user-id <userId>] [--group-bound|--no-group-bound] [--page <page>] [--size <size>]
```

- `--date`：按日期筛选，格式 `yyyy-MM-dd`。
- `--user-id`：按负责人筛选；不传则不加 userId 参数，最终查询范围以后端为准。
- `--group-bound`：只看已绑定群聊的记录。
- `--no-group-bound`：只看未绑定群聊的记录。
- `--page`：页码，默认 1。
- `--size`：每页条数，默认 50。
- 返回记录包含 `roomId`、`groupBound` 等字段，可用于后续查询群聊内容。
- 未显式声明角色要求，默认允许已登录用户请求，最终权限以后端为准。

## 今日代办意向统计

```bash
primecli wechat-touch daily-todo-summary [--user-id <userId>]
```

- `--user-id`：按负责人筛选；不传则查询当前登录用户。
- 返回今日需跟进的客户总数，以及 A/B/C/D 等级分布数量。
- 未显式声明角色要求，默认允许已登录用户请求，最终权限以后端为准。

## 今日触达跟进统计

```bash
primecli wechat-touch today-stats [--user-id <userId>]
```

- `--user-id`：按负责人筛选。
- `SUPER_ADMIN` 不传 `--user-id` 时汇总全员今日数据；传入 `--user-id` 则查询指定销售的今日数据。
- 其他角色不传 `--user-id` 时查询当前登录用户自己。
- 返回今日总数量、已跟进、已通过、已绑定等关键指标。
- 未显式声明角色要求，默认允许已登录用户请求，最终权限以后端为准。

## 今日代办明细

```bash
primecli wechat-touch daily-todo [--user-id <userId>] [--intent-level A|B|C|D] [--page <page>] [--size <size>]
```

- `--user-id`：按负责人筛选；不传则查询当前登录用户。
- `--intent-level`：按意向等级 A/B/C/D 筛选。
- `--page`：页码，默认 1。
- `--size`：每页条数，默认 20。
- 返回每条待办的群名称、公司名称、微信昵称、微信号、手机号、意向等级、备注和归属员工。群名称按 PrimeContact 前端命名规则自动拼接。
- 未显式声明角色要求，默认允许已登录用户请求，最终权限以后端为准。

## 群聊聊天内容

```bash
primecli wechat-touch chat --room-id <roomId> [--page <page>] [--size <size>]
```

- 需要 `SUPER_ADMIN`；当前用户不是 `SUPER_ADMIN` 时不要调用。
- `--room-id`：群聊 roomId，必填。
- `--page`：页码，默认 1。
- `--size`：每页条数，默认 20。
- 返回消息列表，包含发送人、发送时间、消息类型、消息内容。

## 销售人员（归属员工）列表

```bash
primecli wechat-touch friend-owners [--name <name>]
```

- 需要 `SUPER_ADMIN` 或 `SALES_DIRECTOR`；当前用户不是这两个角色时不要调用。
- `--name`：按姓名或用户名子串本地过滤，可用于根据销售名字查找对应的 `userId`。
- 返回销售人员列表，包含 `userId`、`username`、`name`。

## 联系人分发

```bash
primecli wechat-touch distribution-users
primecli wechat-touch distribute -u <userId> -c <count>
```

- 两个命令都需要 `SUPER_ADMIN`；当前用户不是 `SUPER_ADMIN` 时不要调用。
- `distribution-users` 查看可分发人员列表。
- `-u, --user-id`：目标用户 ID，必填。
- `-c, --count`：分发数量，必填，范围 1-150。
- 每个用户每天只能分发一次。
- `distribute` 是写操作；执行前确认目标用户和分发数量。

## 输出处理

- 命令返回 JSON。
- 汇报统计类结果时优先展示关键计数和比率。
- 汇报列表类结果时优先展示分页、负责人、公司或线索标识、`roomId` 和 `groupBound`。
- 群聊消息可能包含敏感业务信息，除非用户要求，不要大段原文转述。
