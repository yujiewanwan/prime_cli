# 产品交付工作流

本仓库接收 [需求中心](https://github.com/yujiewanwan/prime_prd) 下发的交付。统一规则见 [需求中心工作流](https://github.com/yujiewanwan/prime_prd/blob/main/docs/workflow.md)，看板使用 [Project #2](https://github.com/users/yujiewanwan/projects/2)。

## 接收任务

- 用户在本项目要求“处理待开发任务”或指定交付 Issue 时，先查询本仓库 Open Issue，且恰好有一个类型标签 `类型:交付` 和一个状态标签 `状态:待开发`。不重建需求中心已下发的 Issue。
- 阅读父需求、交付范围、完成标准和开工依赖；核对主父需求 sub-issue 关系、Project #2 关联及同一原生迭代。信息缺失或业务范围冲突时先回澄清需求；普通实现细节由开发 Agent 决定。
- 迭代为每周一至周日，名称 `YYYYMM-N`，例如 `202609-2`。真实 Issue URL 是追溯标识；不要求本地全局编号、独立确认字段或 commit 追溯 trailer。
- 人工改为待开发已表示确定范围。接手后直接进入实现流程，不再等待开发窗口、需求文档审核或单独人工验收阶段。
- 原有独立脚本的执行边界继续有效；需求中心下发的交付（包括脚本交付）必须完成本流程。其他直接提出的业务需求先在需求中心澄清并下发，不能因直接创建产品 Issue 而绕过待开发条件。

```bash
gh issue list --repo yujiewanwan/prime_cli --state open \
  --label '类型:交付' --label '状态:待开发' \
  --json number,title,url,body,labels,assignees
```

查询结果是候选任务；执行前重新读取当前状态，检查现有负责人、分支和 PR。标签不是并发锁；不要重复执行已有人处理的任务。本期不部署自动领取或后台运行服务。

## 五阶段闭环

| 状态标签 / Project Status | 执行规则 | Issue 原生状态 |
| --- | --- | --- |
| 状态:澄清需求 / 澄清需求 | 范围可修改，等待人工确定 | Open |
| 状态:待开发 / 待开发 | 范围明确、开工依赖解除，等待产品 Agent 接手 | Open |
| 状态:开发中 / 开发中 | 实际开始后立即回写，再做实现、验证和修正 | Open |
| 状态:待合并 / 待合并 | 完成实现及必要验证，独立 Agent review 与必需 CI 通过，PR 非草稿且无已知合并阻塞 | Open |
| 状态:已完成 / 已完成 | 全部必需 PR 已合并到目标分支，核实后回写并关闭 | Closed（completed） |

每次变更由执行 Agent 同步完成：

1. 重新读取 Issue；保留类型及其他业务标签，移除旧状态标签并添加唯一的新状态标签。
2. 将 Project #2 的 `Status` 设为同名状态。用 `gh api graphql` 查询该 Issue 的 `projectItems`、Project 字段及选项 ID，再调用 `updateProjectV2ItemFieldValue`；不得以标签更新成功代替看板同步成功。
3. 更新正文中当前阶段和必要 PR/验证结果，汇总父需求状态。写后重新读取 Issue 和 Project 核对。

例如开始执行：

```bash
gh issue edit ISSUE_NUMBER --repo yujiewanwan/prime_cli \
  --remove-label '状态:待开发' --add-label '状态:开发中'
```

该命令仅改标签，随后仍须同步 Project 和父需求。当前没有后台标签与看板同步服务。执行身份需要本仓库 Issue、PR 写权限，以及需求中心父 Issue 和 Project #2 的读写权限；权限不足时记录已经成功和未成功的部分，不能宣称闭环已完成或开始重复任务。

父需求只汇总，不作为编码任务：全部必需子项完成则已完成并关闭；全部为待合并/已完成且至少一项待合并则待合并；已有子项执行且未全部结束则开发中；全部范围确定但尚未执行则待开发；其余澄清需求。核对全部子项，不能因本仓库交付结束而提前关闭跨仓库父需求。

## 实现、并行与合并

- 基于最新远端默认分支 `main` 为每个 Issue 建独立 worktree 和分支；保留其他任务的本地改动，不能强制切分支、reset 或把未发布提交带入新任务。主目录脏或有分叉时，可以从 `origin/main` 建隔离副本，不要求清理别人的工作才能开工。
- 已有交付直接使用原 Issue；在 worktree 的 `docs/feature/ISSUE-<id>-<slug>.md` 记录必要实现范围与验证方式，不重复引入需求审核或第二套状态。
- 多个独立 Issue 可并行。API、共享文件和数据库迁移依赖写清；不得因本仓库已有另一个 Issue 开发中就阻止所有任务开工。共享数据库写入与固定端口服务必须隔离或协调，不能终止其他任务的服务。
- PR 使用 [统一模板](pull_request_template.md)，记录本仓库 Issue、原生周迭代、父需求 URL 和验证结果。一个 PR 对应一个交付；一个交付可有多个必需 PR，并在 Issue 中列全。
- 单 PR 完成交付时使用 `Closes #<id>`；多个必需 PR 时使用 `Refs #<id>`，待全部合并后由执行 Agent 关闭 Issue，防止第一个 PR 合并就提前完成。不得用关闭关键词关闭父需求或其他仓库 Issue。
- 提交遵循 Conventional Commits。沿用产品必要测试和代码质量检查；创建 PR 本身不表示已完成或待合并。纯文档/流程变更无需启动产品服务。
- 失败、草稿 PR、检查未通过保持开发中；待合并后需要修改则回开发中；实质范围变化回澄清需求。PR 关闭未合并不能标记完成。
- 合并后核实全部必需 PR、回写已完成、关闭交付及汇总父项，再清理本任务已无未提交/未推送内容的 worktree。取消用 Closed（not planned）并从当前看板归档，不算已完成。

## 独立代码审查（必需）

- “无需额外审核”仅指需求确认和独立人工验收阶段，不取消 PR 代码审查。流程文档、workflow、脚本和产品代码的 PR 都适用。
- PR 创建后确认 GitHub Codex 自动 review 已触发；未触发时评论 `@codex review`。每次修复并推送新提交后再次请求 review，等待覆盖最新完整 head SHA 的审查结束。
- 提交 PR 的 Agent 不能用自查、自己的 APPROVED、CI 绿色、review 已触发或 summary 的 Completed 字样代替独立审查通过。必须读取 review 正文、行内意见和线程，修复阻塞问题，取得新版本的独立复审结果。
- 当前提交仍有 Codex findings 时，即使作者点了 Resolve，也不能算通过；需要新提交和重新 review。旧提交的未解决线程也必须处理，误报交由审查方确认，不由作者自行豁免。
- 缺少审查、审查仍运行或意见未解决时保持开发中。独立 review 通过、必要 CI 全通过、无合并阻塞后才能进入待合并。合并需用户明确授权，不由提交 Agent 自行决定；不能使用 `--admin` 或绕过检查。
- 合并前重新读取当前交付状态、review 和 CI，确保仍是同一完整 head SHA，使用 `--match-head-commit` 防止提交变化。历史绿色检查不足以证明当前可合并。

专用 `Agent Review Gate` 使用默认分支的可信脚本检查当前 head 的 Codex 结果和未解决意见，并将 `agent-review` 状态写到该 head。必须同时取得当前提交的 Completed 摘要及 Codex 明确的无问题结论；旧点赞不能代替，输出格式未知时需维护检查。缺少可信证据为 pending，意见未解决为 failure，API 错误不按通过处理；不会自行批准、合并或执行产品任务。PR、review、评论和交付变化会刷新检查；解决线程后可用 `gh workflow run agent-review.yml -f pr=<编号>` 重新核实。

首次引入该 workflow 的 PR 须先由独立 Agent 审查并逐条处理意见，再交用户决定合并；新门禁仅在默认分支部署后运行，不能把尚未部署的检查报告为已生效。

平台强制能力以仓库设置为准：公有仓库可以将 `agent-review` 和产品必要 CI 设为 required checks；私有仓库若套餐不支持分支保护，Agent 仍必须遵守本规则，但不能声称 GitHub 已禁止所有绕过。权限或套餐不足时不更改仓库可见性，不假设平台保护已启用。

## 校验的边界

Issue workflow 在正文或标签变更后检查当前交付的状态唯一性、周迭代、父需求 URL、范围和勾选标准。澄清阶段允许内容不完整；结构校验不是人工审批，不启动 Agent，不修改状态。真正开工前仍须读取依赖和原生 Project 关系。

PR workflow 校验 Conventional Commits、交付追溯与本仓库 Issue，保留产品原有构建测试。校验失败时修正文档或实现，不新增中间状态。Issue 由自动化账号更新时可能不触发新的 Actions，执行 Agent 因此必须始终自行核对接收条件，不能只看历史 workflow 结果。
