---
name: primecli-image-generations
description: Use primecli-image-generations when the user wants PrimeContact to generate an image from a text prompt, create AI images through the authenticated backend, or dry-run an image generation request. Do not use for local image editing or public image search.
allowed-tools: Bash(primecli:*)
---

# primecli image generations

开始前必须先读取 `../primecli-shared/SKILL.md`，其中包含安装、登录、权限和安全规则。

## 使用场景

- 用户要求通过 PrimeContact 后端根据 prompt 生成图片。
- 用户提到“文生图”“生成图片”“AI 作图”，并且上下文明确要使用 PrimeContact / primecli。
- 用户提供 prompt，希望返回后端上传到 OSS 后的图片地址。
- 用户要求检查文生图请求参数时，使用 dry-run。

不要用于：

- 本地图片编辑、改图、生成素材文件；这些不是 PrimeContact 后端文生图接口。
- 公开互联网图片搜索。
- 用户没有要求使用 PrimeContact 或 primecli 的泛泛图片生成任务。

## 命令

```bash
primecli image-generations create --prompt <prompt> [--reference-image <path>] [--dry-run]
```

- `--prompt` 必填，不能为空白。
- `--reference-image` 可选；提供本地图片路径时，命令以 multipart 请求调用 `POST /api/image-generations/edits`。
- 这是写操作，且成功生成会消耗当日额度；优先使用 `--dry-run` 检查请求。
- 未显式声明角色要求，默认允许已登录用户请求，最终权限以后端为准。
- 未提供参考图时，命令调用 `POST /api/image-generations`，body 为：

```json
{
  "prompt": "a calm lighthouse on a small island at night, moonlight over the sea"
}
```

调用方不要传模型、尺寸、batch size、推理步数或 guidance scale；这些参数由后端固定。

提供参考图时，命令读取本地文件并以 `referenceImage` multipart 文件字段提交；文件不存在或为空时不会发起网络请求。

## 输出处理

成功后命令返回 JSON，重点向用户说明：

- `url`：OSS 图片地址。
- `remainingToday`：当前用户今日剩余成功生成额度。
- `model` 和 `imageSize`：后端实际使用的模型和尺寸。
- `createdAt`：生成记录时间。

如果返回失败，说明错误信息；失败记录不计入当日成功额度，但不要承诺一定不会落库。

## 示例

Dry-run：

```bash
primecli image-generations create --prompt "a calm lighthouse on a small island at night, moonlight over the sea" --dry-run
```

真实生成：

```bash
primecli image-generations create --prompt "a calm lighthouse on a small island at night, moonlight over the sea"
```
