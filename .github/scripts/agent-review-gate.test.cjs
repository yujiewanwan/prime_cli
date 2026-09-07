const { test } = require('node:test');
const assert = require('node:assert/strict');
const { reviewDecision, readThreads } = require('./agent-review-gate.cjs');
const bot = { type: 'Bot', login: 'chatgpt-codex-connector[bot]' };
const head = 'a'.repeat(40);
const baseFixture = () => ({ head, author: 'author', comments: [{ user: bot, updated_at: '2026-09-07T01:00:00Z', body: '<!-- codex-pull-request-review-summary -->\n| 📝 **Code Review** | ✅ **Completed** | `aaaaaaa` | PR opened |' }], reviews: [], inlineComments: [], threads: [], reactions: [] });
const fixture = () => {
  const result = baseFixture();
  result.comments.push({ user: bot, updated_at: '2026-09-07T01:00:00Z', body: "Codex Review: Didn't find any major issues. Breezy!\n\n**Reviewed commit:** `aaaaaaaaaa`" });
  return result;
};
test('可信 bot 对当前提交的无问题审查通过', () => assert.equal(reviewDecision(fixture()).state, 'success'));
test('作者伪造、旧提交、进行中不能代替独立审查', () => {
  for (const change of [f => { f.comments[0].user = { type: 'User', login: bot.login }; }, f => { f.comments[0].body = f.comments[0].body.replace('aaaaaaa', 'bbbbbbb'); }, f => { f.comments[0].body = f.comments[0].body.replace('Completed', 'In progress'); }, f => { f.comments = []; }]) {
    const f = fixture(); change(f); assert.equal(reviewDecision(f).state, 'pending');
  }
});
test('当前 findings 即使已 resolve 也必须修改后重审', () => {
  const f = fixture(); f.inlineComments.push({ user: bot, pull_request_review_id: 1, original_commit_id: head });
  f.threads.push({ isResolved: true }); assert.equal(reviewDecision(f).state, 'failure');
});
test('旧提交的未解决线程仍然阻塞', () => {
  const f = fixture(); f.threads.push({ isResolved: false }); assert.equal(reviewDecision(f).state, 'failure');
});
test('最新有效 review 覆盖旧 Request changes，自我审查拒绝', () => {
  const f = fixture(); const user = { login: 'reviewer', type: 'User' };
  f.reviews.push({ user, state: 'CHANGES_REQUESTED' }); assert.equal(reviewDecision(f).state, 'failure');
  f.reviews.push({ user, state: 'COMMENTED' }); assert.equal(reviewDecision(f).state, 'failure');
  f.reviews.push({ user, state: 'APPROVED' }); assert.equal(reviewDecision(f).state, 'success');
  f.author = bot.login; assert.equal(reviewDecision(f).state, 'failure');
});
test('点赞或未知 review 正文不能替代当前提交的明确通过结论', () => {
  const f = fixture(); f.comments.pop();
  f.reactions = [{ user: bot, content: '+1' }]; assert.equal(reviewDecision(f).state, 'pending');
  const unknown = fixture(); unknown.reviews.push({ id: 2, user: bot, commit_id: head, state: 'COMMENTED', body: 'Please fix the authentication bypass.' });
  assert.equal(reviewDecision(unknown).state, 'failure');
});
test('审查线程读取全部分页', async () => {
  let calls = 0;
  const github = { graphql: async (_query, variables) => {
    calls++; assert.equal(variables.after, calls === 1 ? null : 'next');
    return { repository: { pullRequest: { reviewThreads: { nodes: [{ isResolved: calls === 1 }], pageInfo: { hasNextPage: calls === 1, endCursor: 'next' } } } } };
  } };
  assert.deepEqual(await readThreads(github, { owner: 'owner', repo: 'repo' }, 1), [{ isResolved: true }, { isResolved: false }]);
});
