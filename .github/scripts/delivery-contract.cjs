const states = ['澄清需求', '待开发', '开发中', '待合并', '已完成'];
const conventional = /^(?:build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(?:\([^)\r\n]+\))?!?: .+/;

function trace(body) {
  const iterations = [...body.matchAll(/^\s*(?:[-*]\s*)?(?:Iteration|迭代)\s*[:：]\s*([0-9]{4}(?:0[1-9]|1[0-2])-[1-6])(?=[\s（(。]|$)/gim)].map(m => m[1]);
  const parents = [...body.matchAll(/^\s*(?:[-*]\s*)?(?:PRD[- ]Issue|父需求)\s*[:：]\s*(?:\[[^\]\n]+\]\()?https:\/\/github\.com\/yujiewanwan\/prime_prd\/issues\/([1-9]\d*)(?=[\s)#]|$)/gim)].map(m => m[1]);
  return { iteration: iterations.length === 1 ? iterations[0] : null, parent: parents.length === 1 ? parents[0] : null };
}

function validateIssue(issue) {
  const labels = (issue.labels || []).map(l => typeof l === 'string' ? l : l.name);
  if (!labels.includes('类型:交付')) return [];
  if (issue.state === 'closed' && issue.state_reason === 'not_planned') return [];
  const errors = [];
  const types = labels.filter(l => l.startsWith('类型:'));
  const phases = labels.filter(l => l.startsWith('状态:'));
  if (types.length !== 1) errors.push('交付必须恰好一个类型标签。');
  if (phases.length !== 1 || !states.map(s => `状态:${s}`).includes(phases[0])) {
    errors.push('交付必须恰好一个合法的五阶段状态标签。');
    return errors;
  }
  const done = phases[0] === '状态:已完成';
  if (done !== (issue.state === 'closed')) errors.push('前四阶段须 Open；已完成须 Closed（completed）。');
  if (done && issue.state_reason !== 'completed') errors.push('已完成的关闭原因为 completed。');
  if (phases[0] === '状态:澄清需求') return errors;
  const body = issue.body || '';
  const links = trace(body);
  if (!links.iteration) errors.push('缺少唯一合法的周迭代，例如：迭代：202609-2。');
  if (!links.parent) errors.push('缺少唯一父需求 URL，例如：父需求：https://github.com/yujiewanwan/prime_prd/issues/8。');
  if (!/^#{2,3}\s*(?:交付范围|范围)\s*$/m.test(body)) errors.push('缺少交付范围章节。');
  const criteria = body.match(/^#{2,3}\s*(?:完成标准|验收标准)\s*\n([\s\S]*?)(?=^#{1,3}\s|$(?![\s\S]))/m)?.[1] || '';
  if (!/^\s*[-*]\s*\[[ xX]\]\s+\S/m.test(criteria)) errors.push('完成标准章节必须有至少一个非空勾选项。');
  return errors;
}

function validatePullRequest(subjects, body, issue) {
  const errors = [];
  if (!subjects.length || !subjects.every(s => conventional.test(s))) errors.push('提交标题必须遵循 Conventional Commits。');
  const links = trace(body);
  if (!links.iteration) errors.push('PR 必须填写唯一 Iteration: YYYYMM-N。');
  if (!links.parent) errors.push('PR 必须填写唯一 PRD Issue: 父需求完整 URL。');
  const refs = [...body.matchAll(/^\s*(Closes|Refs)\s+#([1-9]\d*)\s*$/gim)];
  if (refs.length !== 1) errors.push('PR 必须用一行 Closes #<id> 或 Refs #<id> 关联唯一的本仓库交付。');
  // Reject every closing keyword outside the one canonical local Closes line.
  const otherText = body.replace(/^\s*Closes\s+#[1-9]\d*\s*$/gim, '');
  if (/\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+(?:#\d+|[^\s]+\/[^\s]+#\d+|https:\/\/github\.com\/[^\s]+\/issues\/\d+)/i.test(otherText)) errors.push('禁止额外关闭引用或跨仓库关闭父需求。');
  if (issue) {
    if (issue.pull_request || !issue.labels?.some(l => (typeof l === 'string' ? l : l.name) === '类型:交付')) errors.push('PR 必须关联真实的本仓库交付 Issue。');
    errors.push(...validateIssue(issue));
    const issueLinks = trace(issue.body || '');
    if (links.iteration !== issueLinks.iteration || links.parent !== issueLinks.parent) errors.push('PR 的迭代和父需求必须与交付 Issue 一致。');
    if (refs.length === 1 && Number(refs[0][2]) !== issue.number) errors.push('PR 关联的交付编号不匹配。');
  }
  return errors;
}

async function runIssue({ github, context, core }) {
  // Read current state, not a stale labeled/unlabeled event during a label replacement.
  const { data: issue } = await github.rest.issues.get({ ...context.repo, issue_number: context.issue.number });
  const errors = validateIssue(issue);
  if (errors.length) core.setFailed(errors.join('\n'));
  else core.info('交付结构检查通过；本检查不启动执行或变更状态。');
}

async function runPullRequest({ github, context, core }) {
  const pull = context.payload.pull_request;
  const { data: latest } = await github.rest.pulls.get({ ...context.repo, pull_number: pull.number });
  const commits = await github.paginate(github.rest.pulls.listCommits, { ...context.repo, pull_number: pull.number, per_page: 100 });
  const subjects = commits.map(c => c.commit.message.split('\n')[0]);
  const body = latest.body || '';
  const ref = body.match(/^\s*(?:Closes|Refs)\s+#([1-9]\d*)\s*$/im);
  let issue;
  if (ref) ({ data: issue } = await github.rest.issues.get({ ...context.repo, issue_number: Number(ref[1]) }));
  const errors = validatePullRequest(subjects, body, issue);
  if (errors.length) core.setFailed(errors.join('\n'));
}

module.exports = { trace, validateIssue, validatePullRequest, runIssue, runPullRequest };
