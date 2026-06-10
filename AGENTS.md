# AGENTS.md

## Project

`primecli` — CLI 程序，供 Agent（OpenCode / Claude Code / HermesAgent / Codex 等）与 PrimeContact 系统交互。

> Build, test, lint, and toolchain commands are TBD — the repo is currently empty. Update this section once tooling is added.

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
