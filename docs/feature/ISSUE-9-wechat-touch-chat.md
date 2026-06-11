# ISSUE-9: 微信触达聊天内容查询

## 需求确认

在微信触达跟进功能中，绑定成功的群聊会返回 `roomId`。需要 CLI 支持：
1. 查询触达跟进列表（返回 `roomId`）
2. 根据 `roomId` 查询该群聊的聊天内容

## 范围

### 新增命令

#### 1. `primecli wechat-touch items`

查询触达跟进列表，支持以下可选参数：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--date` | string | 无（不过滤） | 日期 yyyy-MM-dd |
| `--group-bound` | boolean | 无（全部） | 是否已绑定群聊 |
| `--page` | number | 0 | 页码 |
| `--size` | number | 50 | 每页条数 |

核心场景：`primecli wechat-touch items --group-bound true` 拿到已绑定群聊的记录及其 `roomId`。

#### 2. `primecli wechat-touch chat`

根据 `roomId` 查询群聊聊天内容：

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--room-id` | string | 必填 | 群聊 roomId |
| `--page` | number | 0 | 页码 |
| `--size` | number | 50 | 每页条数 |

### 权限

- `chat` 命令对应后端接口仅 `SUPER_ADMIN` 可访问，CLI 不做额外判断

### 前置依赖

- prime_contact 后端已支持 `items` 接口返回 `roomId`、`groupBound` 字段
- prime_contact 后端需提供 `chat` 接口 `GET /api/wechat-touch/chat/{roomId}`

## 实现方案

在 `src/commands/wechat-touch.ts` 中新增两个子命令，遵循现有代码风格：

- 使用 Commander 的 `.command()` + `.description()` + `.option()` + `.action()` 模式
- 通过 `readConfig()` 读取 token，`createApiClient()` 发起 HTTP 请求
- 结果以 `JSON.stringify(data, null, 2)` 输出

## 验证计划

1. `primecli wechat-touch items` — 返回列表 JSON，含 `roomId`、`groupBound`
2. `primecli wechat-touch items --group-bound true` — 仅返回已绑定记录
3. `primecli wechat-touch chat --room-id <有效id>` — 返回消息列表 JSON
4. `primecli wechat-touch chat --room-id <无效id>` — 返回错误信息
5. 无 token 时提示先执行 `primecli auth login`
