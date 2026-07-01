# Feature Spec

## 基本信息

- Issue: #33
- 标题: [primecli] 增加 wechat-touch item 详情查询命令
- 负责人: @yujiewanwan
- 状态: Approved

## 审核门禁

- [x] 需求文档已完成人工审核
- [x] 审核结论为 Approved
- [x] 未通过人工审核前，不开始编码实现

## 背景与目标

### 背景

`primecli wechat-touch items` 已支持触达跟进列表查询，但缺少查看单条记录详情的入口。PrimeContact 后端已提供 `GET /api/wechat-touch/items/{id}` 接口，需要 CLI 进行封装。

### 目标

新增一个只读命令，用于根据 ID 查询单条 wechat-touch item 详情。

### 非目标

- 不修改 PrimeContact 后端代码、数据库或业务逻辑。
- 不新增写操作。
- 不修改现有命令行为。

## 需求说明

### 查询单条触达跟进详情

后端接口：

```http
GET /api/wechat-touch/items/{id}
```

CLI 命令：

```bash
primecli wechat-touch item <id>
```

- `<id>` 为必填位置参数，对应接口路径中的 item ID。
- 普通已登录用户即可发起请求；最终权限由后端 403 兜底。
- 输出接口返回的 `data` JSON，格式与现有命令保持一致。

## 方案概述

- 在 `src/commands/wechat-touch.ts` 中新增 `item` 子命令。
- 使用 Commander 的 `.command()` + `.description()` + `.argument()` + `.action()` 模式。
- 通过 `readConfig()` 读取 token，`createApiClient()` 发起 HTTP 请求。
- 结果以 `JSON.stringify(data, null, 2)` 输出。
- 更新 `skills/primecli-wechat-contact/SKILL.md` 与 `README.md` / `README_CN.md` 中的命令说明。

## 改动范围

- `src/commands/wechat-touch.ts`：新增 `item <id>` 子命令。
- `skills/primecli-wechat-contact/SKILL.md`：更新命令映射与说明。
- `README.md` / `README_CN.md`：更新 wechat-touch 命令列表。
- `docs/feature/ISSUE-33-wechat-touch-item-detail.md`：本需求文档。

## 验收标准

- [ ] `primecli wechat-touch item 123` 能正确调用 `GET /api/wechat-touch/items/123` 并返回详情 JSON。
- [ ] 缺少 `<id>` 参数时给出明确报错。
- [ ] 未登录时提示先执行 `primecli auth login`。
- [ ] 相关 SKILL 文档与 README 已更新。
- [ ] `npm run build && npm run lint` 通过。

## 测试与回归

- 测试点：
  - `primecli wechat-touch item --help` 输出正常。
  - `primecli wechat-touch item 123` 在无 token 时给出登录提示。
  - 现有 `wechat-touch items` 列表命令行为不变。
- 回归范围：
  - 现有 `wechat-touch` 命令行为不变。
  - `npm run test` 通过。

## 审核记录

- 需求文档审核人：用户
- 需求文档审核结论：Approved
- 实现结果审核人：
- 实现结果审核结论：

## 发布与回滚

- 发布步骤：合并 PR 后随 npm 包正常发布。
- 回滚方案：回滚本 Issue PR。
