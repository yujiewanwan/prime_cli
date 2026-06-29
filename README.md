# primecli

CLI tool for AI Agents (OpenCode / Claude Code / HermesAgent / Codex) to interact with the PrimeContact system.

[English](#primecli) | [中文](README_CN.md)

## Installation

```bash
npx yujiewanwan/prime_cli install
```

This installs the `primecli` binary globally and registers the bundled agent skills.

Manual fallback:

```bash
npm install -g yujiewanwan/prime_cli
npx skills add yujiewanwan/prime_cli -y -g
```

## Uninstallation

```bash
npm uninstall -g primecli
```

## AI Agent Setup

If you used the one-command installer above, the agent skills are already registered. To register or refresh them manually:

```bash
npx skills add yujiewanwan/prime_cli -y -g
```

This installs multiple domain-specific skills:

| Skill | Purpose |
| ----- | ------- |
| `primecli-shared` | Shared setup, login, base URL, role access control, and safety rules |
| `primecli-company` | PrimeContact company search |
| `primecli-wechat-contact` | WeChat touch stats, follow-up items, group chat content, and contact distribution |
| `primecli-wechat-official` | WeChat official account articles and credential updates |
| `primecli-hot-topics` | Hot topic date/detail lookup and JSON payload creation |

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

| Command                 | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| `primecli auth login`   | Login and save token. Supports `--username` / `--password` |
| `primecli auth profile` | Fetch and display current user profile                     |

### Company

| Command                             | Description                            |
| ----------------------------------- | -------------------------------------- |
| `primecli company search -n <name>` | Search companies by name (fuzzy match) |

Options: `--page <page>` (default 1), `--size <size>` (default 10)

### WeChat Touch

| Command                                               | Description                                                       |
| ----------------------------------------------------- | ----------------------------------------------------------------- |
| `primecli wechat-touch stats`                         | Get outreach stats for all users                                  |
| `primecli wechat-touch team-summary`                  | Get per-user team summary                                         |
| `primecli wechat-touch distribution-users`            | List users available for contact distribution. `SUPER_ADMIN` only |
| `primecli wechat-touch distribute -u <id> -c <count>` | Distribute contacts to a user. `SUPER_ADMIN` only                 |
| `primecli wechat-touch items`                         | List follow-up items, including bound group chat IDs              |
| `primecli wechat-touch chat --room-id <id>`           | Get group chat content by room ID. `SUPER_ADMIN` only             |

Team summary options: `--start-date <date>`, `--end-date <date>` (both default to today)
Distribute options: `-u, --user-id <id>` (required), `-c, --count <count>` (required, 1-150)
Items options: `--date <date>`, `--user-id <userId>`, `--group-bound`, `--no-group-bound`, `--page <page>` (default 1), `--size <size>` (default 50)
Chat options: `--room-id <id>` (required), `--page <page>` (default 1), `--size <size>` (default 20)

### WeChat Official Account

| Command                                       | Description                                                       |
| --------------------------------------------- | ----------------------------------------------------------------- |
| `primecli wechat-official articles fetch`     | Fetch latest WeChat official account articles. `SUPER_ADMIN` only |
| `primecli wechat-official articles accounts`  | List official accounts by tag. Defaults to `hot`                  |
| `primecli wechat-official articles by-fakeid` | List articles by fakeid and time window                           |
| `primecli wechat-official credentials update` | Update official account backend credentials. `SUPER_ADMIN` only   |

Accounts options: `--tag <tag>` (default `hot`)
By-fakeid options: `--fakeids <fakeids>` (required, comma-separated), `--date <date>` (default today), `--start-time <timestamp>`, `--end-time <timestamp>`
Credentials update options: `--id <id>` (required), `--token <token>` (required), `--cookie <cookie>` (required), `--dry-run`

### Hot Topics

| Command                      | Description                            |
| ---------------------------- | -------------------------------------- |
| `primecli hot-topics create` | Create or replace hot topics from JSON |

Create options: `--json <path>` (required), `--dry-run` (print the request without writing to the backend)

## Configuration

- Token, current user role, and optional `baseUrl` stored at `~/.config/primecli/config.json`
- Default API base URL: `https://primeapi.aizee.cc`
- API base URL priority: `PRIMECLI_BASE_URL` > config `baseUrl` > default URL

## Role Access Control

- Commands without an explicit role requirement are allowed for any logged-in user; backend authorization remains the final guard.
- Commands that call role-restricted backend APIs must declare the required role in the CLI with `requireRole(...)`.
- When adding a new role-restricted command, update the README and agent skill docs with the required role.
- `SUPER_ADMIN` only commands today: `wechat-touch chat`, `wechat-touch distribute`, `wechat-touch distribution-users`, `wechat-official articles fetch`, and `wechat-official credentials update`.

## Development

```bash
npm install        # Install dependencies
npm run build      # Compile TypeScript
npm test           # Build + smoke test
npm run lint       # ESLint
npm run format     # Prettier
```
