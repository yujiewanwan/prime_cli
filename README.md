# primecli

CLI tool for AI Agents (OpenCode / Claude Code / HermesAgent / Codex) to interact with the PrimeContact system.

[English](#primecli) | [中文](README_CN.md)

## Installation

```bash
npm install -g primecli
```

## AI Agent Setup

Install the agent skill so your AI agent knows how to use primecli:

```bash
npx skills add yujiewanwan/prime_cli
```

## Quick Start

```bash
# Login (non-interactive)
primecli auth login --username admin --password admin123

# Login (interactive, password hidden)
primecli auth login

# View current profile
primecli auth profile
```

## Commands

### Authentication

| Command | Description |
|---|---|
| `primecli auth login` | Login and save token. Supports `--username` / `--password` |
| `primecli auth profile` | Fetch and display current user profile |

### Company

| Command | Description |
|---|---|
| `primecli company search -n <name>` | Search companies by name (fuzzy match) |

Options: `--page <page>` (default 1), `--size <size>` (default 10)

### Hot Topics

| Command | Description |
|---|---|
| `primecli hot-topics by-date -d <date>` | Query hot topics by date (yyyy-MM-dd) |

Note: Hot topics are T+1. Query yesterday or earlier.

### WeChat Touch

| Command | Description |
|---|---|
| `primecli wechat-touch stats` | Get outreach stats for all users |
| `primecli wechat-touch team-summary` | Get per-user team summary |
| `primecli wechat-touch distribution-users` | List users available for contact distribution |
| `primecli wechat-touch distribute -u <id> -c <count>` | Distribute contacts to a user |

Team summary options: `--start-date <date>`, `--end-date <date>` (both default to today)
Distribute options: `-u, --user-id <id>` (required), `-c, --count <count>` (required, 1-150)

## Configuration

- Token stored at `~/.config/primecli/config.json`
- Default API base URL: `https://primeapi.aizee.cc`
- Override with environment variable `PRIMECLI_BASE_URL`

## Development

```bash
npm install        # Install dependencies
npm run build      # Compile TypeScript
npm test           # Build + smoke test
npm run lint       # ESLint
npm run format     # Prettier
```
