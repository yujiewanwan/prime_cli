const { validatePullRequest } = require('./delivery-contract.cjs');
const marker = '<!-- codex-pull-request-review-summary -->';
const botLogin = 'chatgpt-codex-connector[bot]';

function isCodex(user) {
  return user?.type === 'Bot' && user.login === botLogin;
}

function reviewDecision({ head, author, comments, reviews, inlineComments, threads }) {
  const summaries = comments.filter(c => isCodex(c.user) && c.body?.includes(marker));
  summaries.sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at));
  const summary = summaries[0];
  const row = summary?.body.split('\n').find(line => line.startsWith('|') && line.includes('**Code Review**'));
  const sha = row?.match(/`([a-f0-9]{7,40})`/)?.[1];
  if (!row || !row.includes('✅ **Completed**') || !sha || !head.startsWith(sha)) {
    return { state: 'pending', reason: '等待独立 Codex review 完成并覆盖当前提交。' };
  }
  if (author === botLogin) return { state: 'failure', reason: 'PR 作者不能充当自己的独立审查者。' };
  if (threads.some(t => !t.isResolved)) return { state: 'failure', reason: '仍有未解决的审查线程。' };
  const latest = new Map();
  for (const review of reviews.filter(r => ['APPROVED', 'CHANGES_REQUESTED'].includes(r.state))) latest.set(review.user.login, review);
  if ([...latest.values()].some(r => r.state === 'CHANGES_REQUESTED')) {
    return { state: 'failure', reason: '仍有有效的 Request changes，需审查者确认修复。' };
  }
  const current = reviews.filter(r => isCodex(r.user) && r.commit_id === head);
  const ids = new Set(current.map(r => r.id));
  if (inlineComments.some(c => isCodex(c.user) && (ids.has(c.pull_request_review_id) || c.original_commit_id === head))) {
    return { state: 'failure', reason: '当前提交仍有 Codex findings；修改后提交新版本并重新 review。' };
  }
  const cleanComment = comments.some(comment => {
    if (!isCodex(comment.user) || !/^Codex Review: Didn't find any major issues\./.test(comment.body || '')) return false;
    const reviewed = comment.body.match(/\*\*Reviewed commit:\*\*\s*`([a-f0-9]{7,40})`/)?.[1];
    return reviewed && head.startsWith(reviewed);
  });
  if (current.some(review => review.body?.trim() && !/^Codex Review: Didn't find any major issues\./.test(review.body))) {
    return { state: 'failure', reason: '当前 review 正文存在意见或未知结论，不能仅凭无行内评论认定通过。' };
  }
  if (!cleanComment) return { state: 'pending', reason: '等待 Codex 对当前提交的明确无问题结论；旧点赞不算通过。' };
  return { state: 'success', reason: '当前提交已完成独立审查，且无未处理审查意见。' };
}

async function readThreads(github, repo, number) {
  const threads = [];
  let after = null;
  do {
    const result = await github.graphql(`query($owner:String!,$repo:String!,$number:Int!,$after:String){
      repository(owner:$owner,name:$repo){pullRequest(number:$number){
        reviewThreads(first:100,after:$after){nodes{isResolved} pageInfo{hasNextPage endCursor}}
      }}
    }`, { owner: repo.owner, repo: repo.repo, number, after });
    const page = result.repository.pullRequest.reviewThreads;
    threads.push(...page.nodes);
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (after);
  return threads;
}

async function evaluate(github, repo, pull) {
  const params = { ...repo, pull_number: pull.number, per_page: 100 };
  const [comments, reviews, inlineComments, threads, commits] = await Promise.all([
    github.paginate(github.rest.issues.listComments, { ...repo, issue_number: pull.number, per_page: 100 }),
    github.paginate(github.rest.pulls.listReviews, params),
    github.paginate(github.rest.pulls.listReviewComments, params),
    readThreads(github, repo, pull.number),
    github.paginate(github.rest.pulls.listCommits, params),
  ]);
  const ref = (pull.body || '').match(/^\s*(?:Closes|Refs)\s+#([1-9]\d*)\s*$/im);
  const issue = ref ? (await github.rest.issues.get({ ...repo, issue_number: Number(ref[1]) })).data : null;
  const errors = validatePullRequest(commits.map(c => c.commit.message), pull.body || '', issue);
  if (!issue || errors.length) return { state: 'failure', reason: errors[0] || '缺少有效的交付 Issue。' };
  if (pull.draft) return { state: 'pending', reason: '草稿 PR 尚未进入交付审查。' };
  return reviewDecision({ head: pull.head.sha, author: pull.user.login, comments, reviews, inlineComments, threads });
}

async function run({ github, context, core }) {
  // GitHub concurrency may replace queued events. Reconcile every open PR so
  // a refresh for another PR cannot leave a cancelled delivery's old success.
  const pulls = await github.paginate(github.rest.pulls.list, { ...context.repo, state: 'open', per_page: 100 });
  const numbers = pulls.map(pull => pull.number);
  if (context.eventName === 'workflow_dispatch' && !/^[1-9]\d*$/.test(context.payload.inputs?.pr || '')) throw Error('必须提供 PR 编号。');
  for (const number of numbers) {
    const { data: pull } = await github.rest.pulls.get({ ...context.repo, pull_number: number });
    if (pull.state !== 'open') continue;
    const status = { ...context.repo, sha: pull.head.sha, context: 'agent-review' };
    // Commit statuses are shared by every PR using the same SHA. Never let a
    // clean PR overwrite the failure of another PR with identical commits.
    if (pulls.filter(candidate => candidate.head.sha === pull.head.sha).length > 1) {
      await github.rest.repos.createCommitStatus({ ...status, state: 'failure', description: '多个 Open PR 共用相同提交；各交付须使用独立提交后重新审查。' });
      continue;
    }
    await github.rest.repos.createCommitStatus({ ...status, state: 'pending', description: '核对当前交付和独立审查结果。' });
    let result;
    try { result = await evaluate(github, context.repo, pull); }
    catch (error) {
      core.error(`无法核实 PR #${number}：${error.message}`);
      result = { state: 'error', reason: '审查 API 查询失败，禁止按已通过处理。' };
    }
    const { data: current } = await github.rest.pulls.get({ ...context.repo, pull_number: number });
    if (current.head.sha !== pull.head.sha || current.body !== pull.body || current.draft !== pull.draft || current.state !== 'open') result = { state: 'error', reason: '检查期间 PR 已变化，必须重新检查。' };
    await github.rest.repos.createCommitStatus({ ...status, state: result.state, description: result.reason });
    core.info(`PR #${number}: ${result.reason}`);
  }
}

module.exports = { reviewDecision, readThreads, evaluate, run };
