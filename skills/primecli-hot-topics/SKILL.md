---
name: primecli-hot-topics
description: 'Use primecli-hot-topics for PrimeContact hot topic workflows: listing hot topic dates, viewing hot topics for a specific date such as "6月23日热点有哪些", checking whether hot topics exist, or creating/submitting/dry-running hot topics from JSON. Do not use for public internet trend research.'
allowed-tools: Bash(primecli:*)
---

# primecli hot topics

开始前必须先读取 `../primecli-shared/SKILL.md`，其中包含安装、登录、权限和安全规则。

## 使用场景

- 用户要求查看 PrimeContact 中的热点列表、热点日期列表。
- 用户要求查看某天热点，例如“6月23日热点有哪些”“昨天的热点”“今天有没有热点”。
- 用户问热点是否存在、某天有几个热点、热点标题/摘要/内容是什么。
- 用户要求把热点 JSON 写入 PrimeContact。
- 用户要求创建、提交或 dry-run 热点 payload。

不要用于公开互联网热点调研；只有用户明确要查 PrimeContact 系统里的热点数据时使用。

## 任务到命令

| 用户意图 | 做法 |
| --- | --- |
| 查看最近有哪些热点日期 | 调用 `GET /api/hot-topics?page=1&size=<n>` |
| 查看某天热点列表 | 调用 `GET /api/hot-topics/<yyyy-MM-dd>` |
| 创建或覆盖热点 | `primecli hot-topics create --json <payload.json>` |

注意：当前 `primecli hot-topics` 只有 `create` 子命令，查询热点时使用上面的后端只读 API；不要误用公众号文章命令。

## 热点查询

- 最近热点日期列表：`GET /api/hot-topics?page=1&size=10`
- 指定日期热点详情：`GET /api/hot-topics/<yyyy-MM-dd>`

日期处理：

- 用户说“6月23日”且未给年份时，使用当前年份。
- 用户说“今天/昨天/前天”时，按当前运行环境日期换算成 `yyyy-MM-dd`。
- 如果指定日期返回空数组，明确说“这一天没有热点数据”，再可选查询最近热点日期列表帮助定位。

输出处理：

- 热点详情优先汇总：日期、话题数量、每个话题的标题、摘要、来源文章数量、内容类型数量。
- 用户只问“有哪些”时，不要展开长正文；列标题和一行摘要即可。
- 用户追问具体热点时，再展示该热点的 `contents` 标题、摘要或正文片段。
- 如果接口返回分页日期列表，展示日期、topicCount、keywords。

## 热点创建

```bash
primecli hot-topics create --json <payload.json> [--dry-run]
```

- 从 JSON 文件创建或覆盖热点。
- `--json` 指向完整热点创建 payload 文件，结构见下方“请求体格式”。
- 这是写操作，优先使用 `--dry-run`。
- 未显式声明角色要求，默认允许已登录用户请求，最终权限以后端为准。

## 请求体格式

`primecli hot-topics create` 会把 JSON 文件内容原样作为 `POST /api/hot-topics` 的 body 提交。JSON 按下面格式准备：

```json
{
  "topicDate": "2026-06-23",
  "topics": [
    {
      "title": "热点标题",
      "summary": "热点摘要",
      "sourceArticleIds": [1, 2, 3],
      "contents": [
        {
          "contentType": "SUMMARY",
          "styleCode": "default",
          "title": "内容标题",
          "summary": "内容摘要",
          "content": "生成内容正文",
          "imageUrls": [],
          "sortOrder": 1
        }
      ]
    }
  ]
}
```

注意事项：

- 这个接口主要创建热点元数据和非媒体内容，并返回创建后的 topic ID。
- 同一天重复提交会先删除旧热点和旧内容，再按新 payload 写入；旧的 `ARTICLE` / `IMAGE_ARTICLE` 媒体内容会按热点标题尝试恢复。
- `sourceArticleIds`、`contents`、`imageUrls` 可以为空数组；`contents` 不传时只创建热点元数据。
- `ARTICLE` 和 `IMAGE_ARTICLE` 内容不要放在 `contents` 里，此接口会跳过；需要写入时使用对应上传接口或依赖重复提交恢复。
- 真实提交前先执行 `primecli hot-topics create --json <payload.json> --dry-run` 检查 body。

## 创建输出处理

- dry-run 时说明将提交的方法、路径和 payload 摘要。
- 真实提交后说明后端返回结果。
- 如果 payload 中包含敏感信息，不要在回复中完整展开。
