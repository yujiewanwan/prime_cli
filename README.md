# primecli

CLI 程序，用于 Agent（OpenCode / Claude Code / HermesAgent / Codex 等）与 PrimeContact 系统交互。

## 安装

```bash
npm install -g primecli
```

## 快速开始

```bash
# 登录（非交互模式）
primecli auth login --username admin --password admin123

# 登录（交互模式，密码不显示）
primecli auth login

# 查看当前登录用户
primecli auth profile
```

## 命令

| 命令 | 说明 |
|---|---|
| `primecli auth login` | 登录并保存 token，支持 `--username` / `--password` 参数 |
| `primecli auth profile` | 读取本地 token，调用 API 获取用户 profile |

## 配置

- Token 保存在 `~/.config/primecli/config.json`
- 默认 API 地址：`https://primeapi.aizee.cc`
- 可通过环境变量 `PRIMECLI_BASE_URL` 覆盖

## 开发

```bash
npm install        # 安装依赖
npm run build      # 编译 TypeScript
npm test           # 构建 + 冒烟测试
npm run lint       # ESLint 检查
npm run format     # Prettier 格式化
```
