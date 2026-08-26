import { readFile } from "node:fs/promises";
import { URL } from "node:url";

const conventionalCommitPattern =
  /^(?:build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(?:\([^)\r\n]+\))?!?: .+/;
const localClosingPattern =
  /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#\d+\b/i;
const externalClosingPattern =
  /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+[^\s#]+\/[^\s#]+#\d+\b/i;

export function validateIssue(body) {
  const checks = [
    ["Iteration", /(?:^|\n)\s*[-*]?\s*(?:Iteration|迭代)\s*[:：]\s*.+/im],
    [
      "PRD Issue",
      /(?:^|\n)\s*[-*]?\s*(?:PRD[ -]?Issue|全局需求|父需求)\s*[:：]\s*.+/im,
    ],
    [
      "确认状态",
      /(?:^|\n)\s*[-*]?\s*(?:确认状态|Confirmation Status)\s*[:：]\s*.+/im,
    ],
    ["验收标准", /(?:^|\n)\s*#{1,6}\s*(?:验收标准|Acceptance Criteria)\s*$/im],
    [
      "阻塞状态",
      /(?:^|\n)\s*[-*]?\s*(?:阻塞状态|Blocker Status)\s*[:：]\s*.+/im,
    ],
  ];
  const missing = checks
    .filter(([, pattern]) => !pattern.test(body))
    .map(([name]) => name);

  return {
    passed: missing.length === 0,
    message:
      missing.length === 0
        ? "Issue delivery gate passed."
        : `Issue delivery gate failed. Missing: ${missing.join(", ")}.`,
  };
}

export function validatePullRequest(commitSubjects, body) {
  const missing = [];

  if (
    commitSubjects.length === 0 ||
    !commitSubjects.every((subject) => conventionalCommitPattern.test(subject))
  ) {
    missing.push("Conventional Commit subjects");
  }
  if (!/(?:^|\n)\s*Iteration\s*:\s*ITER-\d+\s*$/im.test(body)) {
    missing.push("Iteration: ITER-xxx");
  }
  if (!/(?:^|\n)\s*PRD-Issue\s*:\s*ISSUE-\d+\s*$/im.test(body)) {
    missing.push("PRD-Issue: ISSUE-xxx");
  }
  if (!localClosingPattern.test(body)) {
    missing.push("Closes #<local delivery issue>");
  }
  if (externalClosingPattern.test(body)) {
    missing.push("no cross-repository closing reference");
  }

  return {
    passed: missing.length === 0,
    message:
      missing.length === 0
        ? "PR delivery traceability gate passed."
        : `PR delivery traceability gate failed. Missing or invalid: ${missing.join(", ")}.`,
  };
}

async function main() {
  const [mode, eventPath, ...options] = process.argv.slice(2);
  if (!eventPath || !["issue", "pull-request"].includes(mode)) {
    throw new Error(
      "Usage: node scripts/github-delivery-gate.mjs <issue|pull-request> <event-path>",
    );
  }

  const event = JSON.parse(await readFile(eventPath, "utf8"));
  const result =
    mode === "issue"
      ? validateIssue(event.issue?.body ?? "")
      : validatePullRequest(
          (await readFile(options[0], "utf8")).split("\n").filter(Boolean),
          event.pull_request?.body ?? "",
        );
  process.stdout.write(JSON.stringify(result));
  if (!result.passed && options.includes("--fail-on-error")) {
    process.exitCode = 1;
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  await main();
}
