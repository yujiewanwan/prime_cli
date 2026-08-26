import assert from "node:assert/strict";
import { validateIssue, validatePullRequest } from "./github-delivery-gate.mjs";

const completeIssue = `## 追溯信息

- 迭代：[ITER-001](https://example.com)
- 全局需求：ISSUE-008
- 确认状态：已确认
- 阻塞状态：无

## 验收标准

- [ ] 门禁可执行`;

assert.equal(validateIssue(completeIssue).passed, true);
assert.match(validateIssue("## 验收标准").message, /Iteration/);

const completePrBody = `Iteration: ITER-001
PRD-Issue: ISSUE-008
Closes #42`;
assert.equal(
  validatePullRequest(["ci: add delivery gates"], completePrBody).passed,
  true,
);
assert.equal(
  validatePullRequest(["add delivery gates"], completePrBody).passed,
  false,
);
assert.equal(
  validatePullRequest(
    ["ci: add delivery gates"],
    `${completePrBody}\nCloses yujiewanwan/prime_prd#1`,
  ).passed,
  false,
);
