# AGENTS.md

## Project

`primecli` — CLI 程序，供 Agent（OpenCode / Claude Code / HermesAgent / Codex 等）与 PrimeContact 系统交互。

### Tech Stack

- **Language**: TypeScript, Node.js
- **CLI framework**: [commander](https://www.npmjs.com/package/commander)
- **HTTP client**: [axios](https://www.npmjs.com/package/axios)
- **Distribution**: npm / npx

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
  - `primecli wechat-touch distribute`
  - `primecli wechat-touch distribution-users`
  - `primecli wechat-official articles fetch`
  - `primecli wechat-official credentials update`

> Build, test, lint commands TBD — add after tooling is set up.

## Development Workflow

### 1. Requirement Intake

- Communicate requirements with the user.
- Clarify assumptions, scope, and acceptance criteria.
- Create a GitHub Issue that captures the agreed requirement.
- Wait for the development window before starting implementation.

### 2. Development Window

- When the development window opens, create an isolated worktree from `master`:

```bash
git worktree add -b issue/<id>-<slug> .worktree/<id>-<slug> master
cd .worktree/<id>-<slug>
```

- Do all implementation work inside that worktree.

### 3. Feature Design Doc

- Before coding, write `docs/feature/ISSUE-<id>-<slug>.md`.
- Write feature docs in Chinese unless the user explicitly requests another language.
- The feature doc must describe the confirmed requirement, scope, approach, and verification plan.
- Start coding only after the feature doc has passed human review.

### 4. Pull Request

- Submit a PR for the issue.
- Include `Closes #<id>` in the PR description.
- If the PR has not been merged, address follow-up work with additional commits on the same PR.
- If the PR has already been merged, open a new PR for further changes.

### 5. Cleanup

- After the PR is merged, clean up the corresponding worktree.

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
