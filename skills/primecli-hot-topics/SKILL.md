---
name: primecli-hot-topics
description: Use primecli-hot-topics when the user explicitly asks to create, submit, write, or dry-run PrimeContact hot topics from a JSON payload file. Do not use for researching public trending topics.
allowed-tools: Bash(primecli:*)
---

# primecli hot topics

开始前必须先读取 `../primecli-shared/SKILL.md`，其中包含安装、登录、权限和安全规则。

## 使用场景

- 用户要求把热点 JSON 写入 PrimeContact。
- 用户要求创建、提交或 dry-run 热点 payload。

不要用于公开热点调研；当前 CLI 只提供热点创建或覆盖命令，不提供热点查询命令。

## 热点创建

```bash
primecli hot-topics create --json <payload.json> [--dry-run]
```

- 从 JSON 文件创建或覆盖热点。
- `--json` 指向完整热点创建 payload 文件，结构见下方“请求体格式”。
- 这是写操作，优先使用 `--dry-run`。
- 未显式声明角色要求，默认允许已登录用户请求，最终权限以后端为准。
- 当前不提供热点按日期查询命令。

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

## 输出处理

- dry-run 时说明将提交的方法、路径和 payload 摘要。
- 真实提交后说明后端返回结果。
- 如果 payload 中包含敏感信息，不要在回复中完整展开。
