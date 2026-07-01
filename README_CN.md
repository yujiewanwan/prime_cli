# primecli

CLI 程序，用于 AI Agent（OpenCode / Claude Code / HermesAgent / Codex 等）与 PrimeContact 系统交互。

[English](README.md) | [中文](#primecli)

## 安装

```bash
npx yujiewanwan/prime_cli install
```

该命令会全局安装 `primecli` binary，并注册随包提供的 Agent Skills。

手动安装 fallback：

```bash
npm install -g yujiewanwan/prime_cli
npx skills add yujiewanwan/prime_cli -y -g
```

安装后会注册以下 Agent Skills：

| Skill                          | 用途                                            |
| ------------------------------ | ----------------------------------------------- |
| `primecli-shared`              | 通用安装、登录、API 地址、角色权限和安全规则    |
| `primecli-company`             | PrimeContact 公司查询                           |
| `primecli-wechat-contact`      | 企微触达统计、跟进列表、群聊内容和联系人分发    |
| `primecli-wechat-official`     | 微信公众号文章和登录态更新                      |
| `primecli-wecom-conversations` | Agent 企微会话分析队列、上下文和结果回写        |
| `primecli-hot-topics`          | 查询热点日期/详情，以及从 JSON payload 创建热点 |

## 卸载

```bash
npm uninstall -g primecli
```

## 快速开始

```bash
# 登录（非交互模式）
primecli auth login --username admin --password admin123

# 登录（交互模式，密码不显示）
primecli auth login

# 查看当前用户
primecli auth profile
```

## 命令

### 认证

| 命令                    | 说明                                               |
| ----------------------- | -------------------------------------------------- |
| `primecli auth login`   | 登录并保存 token，支持 `--username` / `--password` |
| `primecli auth profile` | 获取并显示当前用户 profile                         |

### 公司

| 命令                                | 说明               |
| ----------------------------------- | ------------------ |
| `primecli company search -n <名称>` | 按公司名称模糊搜索 |

参数：`--page <页码>`（默认 1），`--size <条数>`（默认 10）

### 企微触达

| 命令                                                  | 说明                                         |
| ----------------------------------------------------- | -------------------------------------------- |
| `primecli wechat-touch stats`                         | 全员触达统计数据                             |
| `primecli wechat-touch team-summary`                  | 按个人维度的团队触达汇总                     |
| `primecli wechat-touch distribution-users`            | 查询可分发人员列表，仅 `SUPER_ADMIN`         |
| `primecli wechat-touch distribute -u <id> -c <count>` | 分发联系人给指定用户，仅 `SUPER_ADMIN`       |
| `primecli wechat-touch items`                         | 查询触达跟进列表，包含已绑定群聊 ID          |
| `primecli wechat-touch chat --room-id <id>`           | 按 roomId 查询群聊聊天内容，仅 `SUPER_ADMIN` |

团队汇总参数：`--start-date <日期>`，`--end-date <日期>`（默认均为当天）
分发参数：`-u, --user-id <id>`（必填），`-c, --count <count>`（必填，1-150）
跟进列表参数：`--date <日期>`，`--user-id <userId>`，`--group-bound`，`--no-group-bound`，`--page <页码>`（默认 1），`--size <条数>`（默认 50）
聊天内容参数：`--room-id <id>`（必填），`--page <页码>`（默认 1），`--size <条数>`（默认 20）

### 微信公众号

| 命令                                          | 说明                                   |
| --------------------------------------------- | -------------------------------------- |
| `primecli wechat-official articles fetch`     | 拉取最新公众号文章，仅 `SUPER_ADMIN`   |
| `primecli wechat-official articles accounts`  | 按 tag 查询公众号列表，默认 `hot`      |
| `primecli wechat-official articles by-fakeid` | 按 fakeid 和时间窗口查询公众号文章     |
| `primecli wechat-official credentials update` | 更新公众号后台登录态，仅 `SUPER_ADMIN` |

公众号列表参数：`--tag <tag>`（默认 `hot`）
按 fakeid 查询参数：`--fakeids <fakeids>`（必填，逗号分隔），`--date <日期>`（默认当天），`--start-time <时间戳>`，`--end-time <时间戳>`
登录态更新参数：`--id <id>`（必填），`--token <token>`（必填），`--cookie <cookie>`（必填），`--dry-run`

### 企微会话分析

| 命令                                                                                   | 说明                                          |
| -------------------------------------------------------------------------------------- | --------------------------------------------- |
| `primecli wecom-conversations pending`                                                 | 查询待 Agent 分析的会话列表，仅 `SUPER_ADMIN` |
| `primecli wecom-conversations context --conversation-id <id>`                          | 查询指定会话的分析上下文，仅 `SUPER_ADMIN`    |
| `primecli wecom-conversations result --conversation-id <id> --last-analyzed-seq <seq>` | 更新指定会话的分析结果，仅 `SUPER_ADMIN`      |

待分析列表参数：`--conversation-type <ROOM|SINGLE>`，`--limit <limit>`（1-200）
结果回写参数：`--rolling-summary <text>`，`--analysis-result-json <path>`，`--analysis-status <PENDING|SUCCESS|FAILED|SKIPPED>`

### 热点

| 命令                         | 说明                       |
| ---------------------------- | -------------------------- |
| `primecli hot-topics create` | 从 JSON 文件创建或覆盖热点 |

热点创建参数：`--json <文件路径>`（必填），`--dry-run`（只输出请求，不写入后端）

## 配置

- Token、当前用户角色和可选的 `baseUrl` 保存在 `~/.config/primecli/config.json`
- 默认 API 地址：`https://primeapi.aizee.cc`
- API 地址优先级：`PRIMECLI_BASE_URL` > 配置文件 `baseUrl` > 默认地址

## 角色权限控制

- 未显式声明角色要求的命令，默认允许已登录用户发起请求；最终权限仍以后端校验为准。
- 调用后端角色受限接口的命令，必须在 CLI 侧通过 `requireRole(...)` 声明所需角色。
- 后续新增角色受限命令时，必须同步更新 README 和 Agent Skill 文档中的权限说明。
- 当前仅 `SUPER_ADMIN` 可用的命令：`wechat-touch chat`、`wechat-touch distribute`、`wechat-touch distribution-users`、`wechat-official articles fetch`、`wechat-official credentials update`，以及所有 `wecom-conversations` 命令。

## 开发

```bash
npm install        # 安装依赖
npm run build      # 编译 TypeScript
npm test           # 构建 + 冒烟测试
npm run lint       # ESLint
npm run format     # Prettier
```

> **注意：** 因为当前包通过 GitHub 仓库直接分发，`dist/` 需要随源码一起提交到 GitHub。每次修改 `src/` 后，必须执行 `npm run build` 并提交更新后的 `dist/` 文件，否则通过 `npx yujiewanwan/prime_cli` 安装的用户会得到一个损坏或过期的二进制文件。
