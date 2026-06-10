# primecli Agent 使用说明

## 适用场景

当 Agent 需要与 PrimeContact 系统交互时，使用 `primecli`。首版能力集中在认证：

- 登录并保存 JWT token
- 查看当前登录用户 profile

## 前置条件

- 默认 API Base URL: `https://primeapi.aizee.cc`
- 如需调试其他环境，可以设置环境变量 `PRIMECLI_BASE_URL`
- 本地配置文件路径: `~/.config/primecli/config.json`

## 登录

Agent 优先使用非交互式参数：

```bash
primecli auth login --username <username> --password <password>
```

登录成功后，`primecli` 会把 token 保存到 `~/.config/primecli/config.json`。

如果缺少 `--username` 或 `--password`，命令会进入交互式输入模式。

## 查看当前用户

```bash
primecli auth profile
```

该命令会读取本地保存的 token，调用 `GET /api/auth/profile`，并以 JSON 格式输出 profile 数据。

## 常见失败处理

- 提示未登录时，先运行 `primecli auth login --username <username> --password <password>`。
- 出现 401 或认证失败时，重新运行 `primecli auth login`。
- API 地址异常时，检查 `PRIMECLI_BASE_URL` 是否被设置为错误地址。

## 当前命令清单

```bash
primecli --help
primecli auth --help
primecli auth login --username <username> --password <password>
primecli auth profile
```
