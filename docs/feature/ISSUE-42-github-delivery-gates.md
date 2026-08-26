# Feature Spec

## 基本信息

- Issue: #42
- 标题: 建立 Git 与 GitHub 交付追溯门禁
- 状态: Approved

## 背景与目标

Prime CLI 需要在 Delivery Issue 开始开发前校验交付追溯信息，并在 Pull Request 合并前校验追溯字段、提交规范和现有质量命令。

## 范围

- 新增 Issue 门禁工作流：仅在 Issue 被添加 `agent:ready` 标签时运行。
- 校验 Issue 正文中的 Iteration、PRD Issue、确认状态、验收标准和阻塞状态。
- 校验失败时向对应 Issue 留言列出缺失字段；校验通过时留言标记门禁通过。
- 新增 PR 质量门禁工作流：在 PR 创建、更新、重新打开时运行。
- 校验 PR 中的每条提交标题符合 Conventional Commits，并校验 PR 正文包含 `Iteration: ITER-xxx`、`PRD-Issue: ISSUE-xxx` 与仅关闭当前仓库 Delivery Issue 的 `Closes #<number>`。
- PR 门禁执行 `npm run lint`、`npm test` 和 `npm run build`。

## 非目标

- 不自动创建 worktree、开始编码、合并或发布。
- 不自动修改仓库分支保护规则。
- 不校验跨仓库链接目标的远端状态，也不关闭全局 PRD Issue。

## 方案

- 使用两个 GitHub Actions workflow，并以 Node.js 脚本承载文本校验逻辑。
- Issue workflow 只接受带 `agent:ready` 标签的 `issues.labeled` 事件；通过 GitHub API 查询当前 Issue 的正文和既有门禁评论，避免重复留言。
- PR workflow 使用 GitHub API 获取 PR 标题、正文和关联 Issue；`Closes` 指向本仓库 Issue 才通过，不接受 `prime_prd#<number>` 等跨仓库关闭语法。
- 两类 workflow 明确声明最小权限。Issue workflow 需要 `issues: write` 用于反馈；PR workflow 只读。
- 分支保护的必需检查由仓库管理员在 GitHub Settings 中将 `pr-quality` 配置为 `main` 的 required status check。

## 验收标准

- [ ] 带 `agent:ready` 标签且字段完整的 Issue 产生一次门禁通过评论。
- [ ] 字段缺失的 Issue 产生列出缺项的门禁失败评论。
- [ ] PR 缺少追溯字段、标题不符合 Conventional Commits、或使用跨仓库 `Closes` 时，`pr-quality` 失败。
- [ ] PR 使用 `Closes #42` 且字段完整时，追溯校验通过。
- [ ] `npm run lint`、`npm test` 与 `npm run build` 在 PR workflow 中执行。
- [ ] 现有本地 Issue → worktree → PR 流程不受影响。
