# ISSUE-27 支持一条命令安装 primecli CLI 并注册 Agent Skills

## 背景

当前 `primecli` 的安装说明需要用户执行两条命令：

```bash
npm install -g yujiewanwan/prime_cli
npx skills add yujiewanwan/prime_cli
```

第一条安装 CLI binary，第二条把 `skills/` 下的 Agent Skills 注册到各 Agent CLI 的 skill 目录。两步分工清晰，但对用户来说不够友好，也容易漏掉第二步。

参考 `larksuite/cli` 的体验，它们通过 `npx @larksuite/cli@latest install` 把同样的两步包进一个 `install` 子命令里，首次安装只需要一条命令。

## 确认需求

为 `primecli` 增加一个 `install` 子命令，实现：

1. 全局安装 `primecli` 二进制（`npm install -g yujiewanwan/prime_cli`）。
2. 注册配套 Agent Skills（`npx skills add yujiewanwan/prime_cli -y -g`）。
3. 支持 `--dry-run`，只打印要执行的命令，不真正运行。

用户安装时只需执行：

```bash
npx yujiewanwan/prime_cli install
```

## 范围

### 包含

- 新增 `src/commands/install.ts` 实现 `primecli install`。
- 在 `src/index.ts` 注册 `install` 命令。
- 更新 README / README_CN 的安装说明，推荐单命令方式，保留手动两步作为 fallback。
- 更新 `skills/primecli-shared/SKILL.md` 的前置条件说明。
- 补充 install 命令的轻量 smoke test（至少 `--dry-run` 可正常输出）。

### 不包含

- 不修改现有业务命令逻辑。
- 不调整 npm 包名或发布流程。
- 不处理 CI/离线环境下的自动降级（仅给出友好错误提示）。

## 设计方案

### install 子命令

- 命令名：`primecli install`
- 参数：`--dry-run`
- 执行步骤：
  1. `npm install -g yujiewanwan/prime_cli`
  2. `npx skills add yujiewanwan/prime_cli -y -g`
- 使用 `node:child_process` 的 `spawn` 调用外部命令，`stdio: inherit` 让用户看到原始输出。
- Windows 下自动使用 `npm.cmd` / `npx.cmd`。
- 任一命令失败时，CLI 以非 0 退出码退出，并保留原始错误输出。

### 全局安装失败的处理

全局安装可能因 npm 目录权限失败。install 命令本身不尝试修复权限，但会在错误信息中提示用户检查 npm 全局目录权限，或提供手动命令 fallback。

### 目录结构变化

```text
src/
  commands/
    install.ts       # 新增
    ...
  index.ts           # 注册 install 命令
```

## 验证计划

1. `npm run build` 通过。
2. `npm run lint` 通过。
3. `npm test` 通过。
4. `node dist/index.js install --dry-run` 输出两条命令，不执行安装。
5. 在干净环境执行 `npx yujiewanwan/prime_cli install` 后，`primecli` 全局可用且 skills 已注册到 Agent skill 目录。
6. README / README_CN / `primecli-shared` skill 文档中的安装说明一致。

## 验收标准

- `primecli install --dry-run` 正常打印要执行的安装命令。
- `primecli install` 能成功完成 CLI 全局安装 + skills 注册。
- README 推荐单命令安装方式。
- 所有现有测试和 lint 保持通过。
