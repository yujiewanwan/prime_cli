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

Installed agent skills:

| Skill                          | Purpose                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `primecli-shared`              | Shared setup, login, base URL, role access control, and safety rules              |
| `primecli-company`             | PrimeContact company search                                                       |
| `primecli-wechat-contact`      | WeChat touch stats, follow-up items, group chat content, and contact distribution |
| `primecli-wechat-official`     | WeChat official account articles and credential updates                           |
| `primecli-wecom-conversations` | Agent WeCom conversation analysis queue, context, and result updates              |
| `primecli-hot-topics`          | Hot topic date/detail lookup and JSON payload creation                            |

## Uninstallation

```bash
npm uninstall -g primecli
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
| `primecli wechat-touch item <id>`                     | Get a single follow-up item by ID                                 |
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

### WeCom Conversations

| Command                                                                                | Description                                                       |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `primecli wecom-conversations pending`                                                 | List pending conversations for agent analysis. `SUPER_ADMIN` only |
| `primecli wecom-conversations context --conversation-id <id>`                          | Get analysis context for a conversation. `SUPER_ADMIN` only       |
| `primecli wecom-conversations result --conversation-id <id> --last-analyzed-seq <seq>` | Update conversation analysis result. `SUPER_ADMIN` only           |

Pending options: `--conversation-type <ROOM|SINGLE>`, `--limit <limit>` (1-200)
Result options: `--rolling-summary <text>`, `--analysis-result-json <path>`, `--analysis-status <PENDING|SUCCESS|FAILED|SKIPPED>`

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
- `SUPER_ADMIN` only commands today: `wechat-touch chat`, `wechat-touch distribute`, `wechat-touch distribution-users`, `wechat-official articles fetch`, `wechat-official credentials update`, and all `wecom-conversations` commands.

## Development

```bash
npm install        # Install dependencies
npm run build      # Compile TypeScript
npm test           # Build + smoke test
npm run lint       # ESLint
npm run format     # Prettier
```

> **Note:** `dist/` is committed to GitHub because the package is installed directly from the repository. Run `npm run build` after any `src/` changes and commit the updated `dist/` files, otherwise users installing via `npx yujiewanwan/prime_cli` will get a broken or outdated binary.
