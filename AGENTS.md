# AGENTS.md

## 需求中心交付契约

PR 必须经过独立 Agent 代码审查并处理全部阻塞意见，CI 通过不能替代 review。未审查通过保持开发中，通过后待合并；合并需用户明确授权，提交 Agent 不得自行批准或绕过审查。具体证据与触发方式见交付契约。

所有需求中心下发的任务先遵循 [.github/DELIVERY_WORKFLOW.md](.github/DELIVERY_WORKFLOW.md)：澄清需求 → 待开发 → 开发中 → 待合并 → 已完成。该文件定义任务接收、状态与父需求回写、并行和 PR 追溯；以下产品工程约束继续适用。用户在本项目指定或要求处理待开发交付时，按契约直接推进，不重新建立 Issue 或增加人工确认阶段。

## Project

`primecli` — CLI 程序，供 Agent（OpenCode / Claude Code / HermesAgent / Codex 等）与 PrimeContact 系统交互。

### Tech Stack

- **Language**: TypeScript, Node.js
- **CLI framework**: [commander](https://www.npmjs.com/package/commander)
- **HTTP client**: [axios](https://www.npmjs.com/package/axios)
- **Distribution**: npm / npx

### Distribution Notes

- 当前通过 GitHub 仓库直接分发：`npx yujiewanwan/prime_cli ...` 会拉取仓库源码。
- `dist/` 是 TypeScript 编译产物，必须随源码一起提交到 GitHub，否则安装后的包缺少可执行文件。
- 每次修改 `src/` 后，执行 `npm run build` 并提交更新后的 `dist/`。

### API

- PrimeContact REST API，统一响应格式 `{ code, message, data, timestamp }`
- 后端项目: [prime_contact](../prime_contact)

### Config

- 凭证存储: `~/.config/primecli/config.json`
- API base URL 通过环境变量 `PRIMECLI_BASE_URL` 或配置文件指定

### Role Access Control

- `auth login` 会缓存当前用户角色，供 CLI 本地权限判断使用。
- CLI 权限控制采用白名单式声明：只有明确标注角色要求的命令才进行本地角色拦截。
- 未声明角色要求的命令默认允许已登录用户发起请求，最终权限仍由后端兜底。
- 新增后端受角色限制的接口时，必须同步：
  - 在对应 commander 命令上增加 `requireRole(...)`。
  - 在 README / Skill 文档中标注所需角色。
  - 保留后端 403 作为最终权限兜底。
- 当前 `SUPER_ADMIN` 专属命令：
  - `primecli wechat-touch chat`
  - `primecli wechat-official articles fetch`
  - `primecli wechat-official credentials update`

构建与验证命令见下方“开发与验证”。

## 开发与验证

- 默认分支为 `main`。先 fetch 最新远端基线，从 `origin/main` 创建 `issue/<id>-<slug>` 分支及独立 worktree。
- 在 worktree 中记录必要 Feature 文档、实现和验证；无需开发窗口或文档人工审核。
- 验证命令：`npm run lint`、`npm test`、`npm run build`；修改 `src/` 时提交对应 `dist/`。
- PR、合并与状态回写统一遵循交付契约。使用英文 Conventional Commits，Issue、PR 和需求文档使用中文。

## Behavioral Guidelines

These bias toward caution. Use judgment for trivial tasks.

### 1. Think Before Coding

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

- Minimum code that solves the problem. Nothing speculative.
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If 200 lines could be 50, rewrite it.

### 3. Surgical Changes

- Touch only what you must. Match existing style even if you'd do it differently.
- Don't "improve" adjacent code, comments, or formatting.
- Remove only imports/variables/functions that YOUR changes made unused.
- Don't delete pre-existing dead code unless asked.

### 4. Goal-Driven Execution

- Turn tasks into verifiable goals (eg. "Write tests for invalid inputs, then make them pass").
- For multi-step tasks, state a brief plan with verification steps.
- Loop until verified — don't stop at "looks right".
