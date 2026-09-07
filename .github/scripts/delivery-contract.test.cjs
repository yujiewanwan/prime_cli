const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validateIssue, validatePullRequest } = require('./delivery-contract.cjs');
const body = '- 父需求：[prime_prd#8](https://github.com/yujiewanwan/prime_prd/issues/8)\n- 迭代：202609-2（2026-09-07 至 2026-09-13）。\n\n## 交付范围\n支持搜索\n\n## 完成标准\n- [ ] 搜索正确\n';
const issue = { number: 703, state: 'open', body, labels: [{ name: '类型:交付' }, { name: '状态:待开发' }] };
const pr = 'Closes #703\nIteration: 202609-2\nPRD Issue: https://github.com/yujiewanwan/prime_prd/issues/8';
test('当前交付格式及单 PR 追溯通过', () => {
  assert.deepEqual(validateIssue(issue), []);
  assert.deepEqual(validatePullRequest(['feat: support search'], pr, issue), []);
});
test('澄清阶段允许未完成的需求正文', () => {
  assert.deepEqual(validateIssue({ ...issue, body: '', labels: ['类型:交付', '状态:澄清需求'] }), []);
});
test('标签必须唯一且原生关闭状态匹配', () => {
  for (const labels of [[], ['状态:未知'], ['状态:待开发', '状态:开发中'], ['状态:待开发', '类型:需求'], ['状态:已完成']]) {
    assert.ok(validateIssue({ ...issue, labels: ['类型:交付', ...labels] }).length);
  }
  assert.ok(validateIssue({ ...issue, state: 'closed', state_reason: 'completed' }).length);
  assert.deepEqual(validateIssue({ ...issue, state: 'closed', state_reason: 'completed', labels: ['类型:交付', '状态:已完成'] }), []);
  assert.deepEqual(validateIssue({ ...issue, state: 'closed', state_reason: 'not_planned' }), []);
});
test('旧编号、错误月份、缺少完成标准不通过', () => {
  for (const changed of [body.replace('202609-2', 'ITER-001'), body.replace('202609-2', '202613-2'), body.replace('202609-2', '202609-22'), body.replace('https://github.com/yujiewanwan/prime_prd/issues/8', 'ISSUE-008'), body.replace('- [ ] 搜索正确', '- [ ] '), body.replace('## 完成标准', '## 备注')]) {
    assert.ok(validateIssue({ ...issue, body: changed }).length);
  }
});
test('多 PR 使用 Refs，错误引用和提交不通过', () => {
  assert.deepEqual(validatePullRequest(['ci: align workflow'], pr.replace('Closes', 'Refs'), issue), []);
  for (const changed of [pr + '\nCloses #704', pr + '\nFixes #704', pr + '\nCloses yujiewanwan/prime_prd#8', pr + '\nCloses https://github.com/yujiewanwan/prime_prd/issues/8', pr.replace('202609-2', 'ITER-001'), pr.replace('202609-2', '202609-3'), pr.replace('issues/8', 'issues/9'), pr.replace('#703', '#704')]) {
    assert.ok(validatePullRequest(['ci: align workflow'], changed, issue).length);
  }
  assert.ok(validatePullRequest(['bad title'], pr, issue).length);
});
test('GitHub 表单三级章节及额外标签兼容', () => {
  assert.deepEqual(validateIssue({ ...issue, body: body.replaceAll('## ', '### '), labels: [...issue.labels, { name: 'documentation' }] }), []);
});
