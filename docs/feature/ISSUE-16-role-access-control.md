# ISSUE-16 本地角色权限校验

## 需求背景

`primecli` 目前在登录后即可调用所有命令，部分后端接口实际仅允许 `SUPER_ADMIN` 访问。普通用户需要等到 API 返回 403 才知道无权限，Agent 也无法在执行前判断命令是否可用。

## 目标

- `auth login` 成功后调用 `/api/auth/profile`，从当前用户 profile 中提取角色并缓存到 `~/.config/primecli/config.json`。
- 对 `wechat-touch chat`、`wechat-touch distribute`、`wechat-touch distribution-users` 增加本地 `SUPER_ADMIN` 校验。
- 非 `SUPER_ADMIN` 用户在命令 action 发起业务 API 前得到明确错误。
- 后端 403 仍作为兜底，并输出更友好的权限错误。
- 更新 Agent Skill 文档，标注相关命令仅 `SUPER_ADMIN` 可用。

## 范围

### 包含

- 配置结构增加 `role` 和可选 `roles`。
- 增加角色提取和命令级 `requireRole(...roles)` helper。
- `auth login` 登录后获取 profile 并写入角色。
- 相关命令接入角色校验。
- `api-client` 对 HTTP 403 返回友好错误。
- 更新 `skills/primecli/SKILL.md`，必要时同步 README。

### 不包含

- 不新增完整测试框架。
- 不改变后端权限模型。
- 不为非 SUPER_ADMIN 命令增加额外权限配置。
- 不改变现有命令参数和输出数据结构。

## 方案

1. 在 `src/lib/config.ts` 扩展 `PrimeCliConfig`：
   - `token?: string`
   - `role?: string`
   - `roles?: string[]`

2. 新增 `src/lib/roles.ts`：
   - `extractRoles(profile)`：兼容 `role`、`roles`、`authorities` 以及常见对象数组字段。
   - `requireRole(...roles)`：使用 commander `preAction` hook，在 action 前读取本地配置并校验角色。

3. 修改 `auth login`：
   - 登录成功并提取 token 后，用 token 调用 `/api/auth/profile`。
   - 从 profile 中提取角色并保存。
   - 如果 profile 中没有角色，仍保存 token，但不写入角色。

4. 修改 `wechat-touch`：
   - 对 `chat`、`distribute`、`distribution-users` 链式调用 `requireRole("SUPER_ADMIN")`。

5. 修改 `api-client`：
   - HTTP 401 保持现有重新登录提示。
   - HTTP 403 输出权限不足提示。

## 验证计划

- 运行 `npm run build`，确保 TypeScript 编译通过。
- 运行 `npm run lint`，确保 lint 通过。
- 如可连接测试后端，手动验证：
  - 普通用户登录后配置文件包含角色，执行 SUPER_ADMIN 命令会在业务 API 调用前失败。
  - SUPER_ADMIN 用户登录后可继续执行相关命令。
  - 后端返回 403 时 CLI 输出友好权限错误。
