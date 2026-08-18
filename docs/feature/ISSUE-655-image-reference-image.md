# PrimeCLI 图片生成参考图

## 基本信息

- Issue: #655
- 状态: Approved

## 背景与目标

PrimeCLI 当前只能通过提示词调用 PrimeContact 文生图接口。图片生成服务新增参考图编辑能力后，PrimeCLI 需要能够提交本地参考图文件。

## 需求说明

保留 `primecli image-generations create --prompt <text>` 的现有行为。新增可选 `--reference-image <path>` 参数；提供该参数时，命令以 multipart 请求调用 PrimeContact 的参考图编辑 API。

## 改动范围

- CLI 命令：增加参考图文件选项、文件存在性校验和 multipart 提交。
- HTTP 客户端：提供 multipart POST 支持。
- 文档：更新中英文 README 与 `primecli-image-generations` Skill。
- 测试：覆盖参考图参数的 dry-run 与不存在文件校验。

## 验收标准

- [ ] 不传 `--reference-image` 时，命令仍调用现有文生图 API。
- [ ] 传入存在的 `--reference-image` 时，命令调用参考图编辑 API 并以 multipart 提交图片。
- [ ] 不存在的参考图文件会在发起网络请求前失败。
- [ ] `npm test` 通过，且 `dist/` 与源码同步。

## 审核记录

- 需求文档审核人：用户
- 需求文档审核结论：Approved
