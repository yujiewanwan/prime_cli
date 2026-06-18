# primecli

CLI 程序，用于 AI Agent（OpenCode / Claude Code / HermesAgent / Codex 等）与 PrimeContact 系统交互。

[English](README.md) | [中文](#primecli)

## 安装

```bash
npm install -g yujiewanwan/prime_cli
```

## AI Agent 配置

安装 agent skill，让 AI agent 识别和使用 primecli：

```bash
npx skills add yujiewanwan/prime_cli
```

## 快速开始

```bash
# 登录（非交互模式）
primecli auth login --username admin --password admin123

# 登录（交互模式，密码不显示）
primecli auth login

# 查看当前用户
primecli auth profile
```

## 命令

### 认证

| 命令 | 说明 |
|---|---|
| `primecli auth login` | 登录并保存 token，支持 `--username` / `--password` |
| `primecli auth profile` | 获取并显示当前用户 profile |

### 公司

| 命令 | 说明 |
|---|---|
| `primecli company search -n <名称>` | 按公司名称模糊搜索 |

参数：`--page <页码>`（默认 1），`--size <条数>`（默认 10）

### 企微触达

| 命令 | 说明 |
|---|---|
| `primecli wechat-touch stats` | 全员触达统计数据 |
| `primecli wechat-touch team-summary` | 按个人维度的团队触达汇总 |
| `primecli wechat-touch distribution-users` | 查询可分发人员列表 |
| `primecli wechat-touch distribute -u <id> -c <count>` | 分发联系人给指定用户 |

团队汇总参数：`--start-date <日期>`，`--end-date <日期>`（默认均为当天）
分发参数：`-u, --user-id <id>`（必填），`-c, --count <count>`（必填，1-150）

## 配置

- Token 保存在 `~/.config/primecli/config.json`
- 默认 API 地址：`https://primeapi.aizee.cc`
- 可通过环境变量 `PRIMECLI_BASE_URL` 覆盖

## 开发

```bash
npm install        # 安装依赖
npm run build      # 编译 TypeScript
npm test           # 构建 + 冒烟测试
npm run lint       # ESLint
npm run format     # Prettier
```
