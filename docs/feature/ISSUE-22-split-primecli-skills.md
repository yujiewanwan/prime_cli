# ISSUE-22 拆分 primecli Agent Skills

## 背景

当前 `primecli` 只有一个 `skills/primecli/SKILL.md`。随着 PrimeContact API 增多，单个 skill 会同时承担公司查询、企微触达、联系人分发、公众号文章、热点创建等多个领域的触发与执行说明，容易导致：

- front matter `description` 过长，触发边界变模糊。
- 业务命令和通用认证、权限、安全规则混在一起。
- 后续新增 API 时只能继续堆到同一个文档里，维护成本上升。

参考 Lark skills 的组织方式，本次将通用规则和业务能力拆分成多个独立 skill。

## 确认需求

新增以下 skill 模块：

- `primecli-shared`：安装、登录、API base URL、权限规则、错误处理、安全规则。
- `primecli-company`：公司查询。
- `primecli-wechat-official`：公众号文章查询、拉取、登录态更新。
- `primecli-hot-topics`：热点创建。
- `primecli-wechat-contact`：企微触达和联系人分发，对应当前 `wechat-touch` 与 contact distribution 命令。

业务 skill 应按 Lark 范式在文档开头要求先读取 `../primecli-shared/SKILL.md`。

## 范围

本次只调整 Agent skill 文档和必要的 README 说明，不改 CLI 运行逻辑。

包含：

- 新增多个 `skills/primecli-*/SKILL.md`。
- 将现有 `skills/primecli/SKILL.md` 拆分迁移到对应模块。
- 删除旧的巨型 `skills/primecli/SKILL.md`，避免与新业务 skill 抢触发。
- 同步 README / README_CN 中的 Agent skill 说明，说明安装后会提供多个 `primecli-*` skills。

不包含：

- 新增 CLI 命令。
- 修改 REST API 调用路径、参数或权限逻辑。
- 调整 npm 包名或安装命令。

## 设计方案

### 目录结构

```text
skills/
  primecli-shared/
    SKILL.md
  primecli-company/
    SKILL.md
  primecli-wechat-contact/
    SKILL.md
  primecli-wechat-official/
    SKILL.md
  primecli-hot-topics/
    SKILL.md
```

### shared skill

`primecli-shared` 只放跨模块通用规则：

- 何时使用 `primecli`。
- 安装和 skill 安装方式。
- 登录、profile、配置路径、base URL 优先级。
- 权限规则和当前 `SUPER_ADMIN` 命令清单。
- 写操作优先 `--dry-run`。
- 不回显 token、cookie、password。
- 常见错误处理。

### 业务 skill

每个业务 skill：

- front matter `description` 只覆盖自身领域。
- `allowed-tools` 仍使用 `Bash(primecli:*)`。
- 开头明确写：开始前必须先读取 `../primecli-shared/SKILL.md`。
- 只保留本领域命令和参数说明。
- 对写操作、`SUPER_ADMIN` 命令在本 skill 内再次标注。

### 旧 skill 处理

删除 `skills/primecli/SKILL.md`。原因：

- 如果保留同名总 skill，其宽泛 description 仍可能和新 skill 竞争触发。
- 当前包可以通过多个 `skills/<name>/SKILL.md` 暴露多个能力，不需要总入口。

如后续确实需要索引型 skill，应另开 issue 设计低触发、只路由不执行的入口。

## 验证计划

- 对照 `src/commands/*.ts` 检查各 skill 命令、参数、默认值、权限标注。
- 运行 `git diff --check` 检查 Markdown 无尾随空白等问题。
- 运行 `npm test`，确认文档调整未影响构建、lint 和 smoke test。
- 检查 `find skills -maxdepth 2 -name SKILL.md` 输出符合预期。

## 验收标准

- `skills/primecli/SKILL.md` 不再存在。
- 新增 5 个 `primecli-*` skill。
- 每个业务 skill 的触发描述边界清晰，不跨领域泛触发。
- 每个业务 skill 都明确要求读取 `primecli-shared`。
- `SUPER_ADMIN` 命令、写操作 `--dry-run`、敏感信息规则清楚标注。
- README / README_CN 的 Agent skill 描述与多 skill 结构一致。
