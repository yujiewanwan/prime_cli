# ISSUE-1: 初始化 primecli 脚手架

## Issue 信息

- GitHub Issue: https://github.com/yujiewanwan/prime_cli/issues/1
- 分支: `issue/1-init-primecli-scaffold`
- Worktree: `.worktree/1-init-primecli-scaffold`
- 基准分支: `main`

说明：`AGENTS.md` 的通用流程里写的是从 `master` 创建 worktree，但当前仓库默认分支是 `main`，本地也没有 `master` 分支，所以本次从 `main` 创建。

## 目标

搭建 `primecli` 的 TypeScript/Node.js CLI 基础设施，并跑通首批认证命令：

- `primecli auth login`
- `primecli auth profile`

首版应能让用户和 Agent 通过 PrimeContact 完成登录，并查看当前登录用户信息。

同时，由于 `primecli` 的主要使用者包括 Agent，需要提供面向 Agent 的 skills 说明文档，让 Agent 能明确知道何时使用 `primecli`、可用命令、参数、配置路径和典型调用方式。

## 已确认需求

### 项目脚手架

- 初始化用于 npm/npx 分发的 Node.js 包。
- 使用 TypeScript。
- 使用 `commander` 作为 CLI 命令框架。
- 使用 `axios` 发起 HTTP 请求。
- 添加 ESLint 和 Prettier。
- 提供 `primecli` bin 入口。
- 初始源码目录结构：
  - `src/`
  - `src/commands/`
  - `src/lib/`

### API Base URL

- 默认 API Base URL 为 `https://primeapi.aizee.cc`。
- `PRIMECLI_BASE_URL` 可以覆盖默认值，便于本地调试。
- 首版不要求用户通过配置文件设置 Base URL，除非实现配置结构时自然包含该字段。

### 配置与凭证

- CLI 配置文件路径为 `~/.config/primecli/config.json`。
- 登录成功后，将后端返回的 JWT token 写入该配置文件。
- 配置目录和配置文件不存在时自动创建。

### `auth login`

- 命令：`primecli auth login`
- 支持非交互参数：
  - `--username <username>`
  - `--password <password>`
- 如果缺少用户名或密码，则交互式提示用户输入缺失值。
- 如果交互式输入密码，尽量避免在终端明文回显。
- 调用 `POST /api/auth/login`。
- 登录成功后持久化 token。
- 输出简洁的登录成功提示。

### `auth profile`

- 命令：`primecli auth profile`
- 从本地配置读取已保存 token。
- 调用 `GET /api/auth/profile`。
- 以可读格式输出 profile 响应。
- 如果本地没有 token，提示用户先运行 `primecli auth login`。

### HTTP Client

- 在 `src/lib/` 中封装 axios 实例。
- 存在 token 时，自动附加 `Authorization: Bearer <token>`。
- 统一处理 PrimeContact 响应包裹格式：

```ts
type BaseResponse<T> = {
  code: number;
  message: string;
  data: T;
  timestamp: string;
};
```

- 非成功 `code` 应作为命令错误处理。
- HTTP 401 应作为认证失败处理，并提示用户重新登录。

### Agent Skills 说明文档

- 为 Agent 编写 `primecli` 使用说明文档。
- 文档应说明 `primecli` 的适用场景：Agent 需要与 PrimeContact 系统交互时使用。
- 文档应覆盖首批命令：
  - `primecli auth login`
  - `primecli auth profile`
- 文档应说明认证前置条件、配置文件路径、默认 API Base URL、环境变量覆盖方式。
- 文档应提供面向 Agent 的示例调用，例如非交互式登录：

```bash
primecli auth login --username <username> --password <password>
```

- 文档应说明常见失败处理：
  - 未登录时先运行 `primecli auth login`
  - 401 时重新登录
  - API 地址异常时检查 `PRIMECLI_BASE_URL`
- 文档首版可以放在仓库内，例如 `docs/skills/primecli.md`；如果后续需要适配特定 Agent 的 skill 格式，再单独扩展。

## 本 Issue 不做

- 不实现 token refresh，除非后端刷新接口已明确。
- 不添加 `auth login` 和 `auth profile` 之外的命令。
- 不设计插件系统或超出当前需求的命令架构。
- 不要求用户在正常使用前配置 Base URL。
- 不在首版为不同 Agent 平台分别生成多套 skill 包，只提供通用说明文档。

## 待确认问题

- `POST /api/auth/login` 返回 token 的具体字段名是什么？
  - 实现假设：开发时检查真实响应结构；或者只支持少量明确、常见的 token 字段名，并保持解析逻辑简单。
- `auth profile` 应展示哪些字段？
  - 实现假设：首版将响应中的 `data` 以 pretty JSON 输出。
- skills 说明文档是否需要符合某个特定 Agent 的文件格式？
  - 实现假设：首版先提供通用 Markdown 文档 `docs/skills/primecli.md`，后续再按 OpenCode / Claude Code / HermesAgent / Codex 的差异拆分。

## 建议实现计划

1. 创建 Node/TypeScript 包脚手架。
2. 添加基于 `commander` 的 CLI 入口。
3. 添加 `~/.config/primecli/config.json` 的配置读写工具。
4. 添加默认 Base URL 和响应包裹处理的 API client。
5. 实现 `auth login`。
6. 实现 `auth profile`。
7. 编写面向 Agent 的 `primecli` skills 说明文档。
8. 添加 lint、format、typecheck/build 脚本。
9. 如果测试工具能快速落地，则添加聚焦测试；否则先通过 typecheck/build 和手动 CLI 验证。

## 验证计划

- `npm run build` 成功。
- `npm run lint` 成功。
- `npm test` 成功，并通过本地 mock API 验证 login/profile 核心链路。
- 如果添加了格式检查脚本，`npm run format:check` 成功。
- `primecli --help` 能显示 CLI 帮助。
- `primecli auth --help` 能显示 auth 命令帮助。
- `primecli auth login --username <user> --password <password>` 能调用登录 API 并保存 token。
- `primecli auth profile` 能使用已保存 token 并输出 profile 数据。
- 未保存 token 时运行 `primecli auth profile`，能输出清晰的登录提示。
- `docs/skills/primecli.md` 能让 Agent 明确知道使用场景、认证方式、命令参数、配置路径和常见错误处理。

## 人工审核门禁

本文档必须先经过用户审核通过，之后才能开始实现。
