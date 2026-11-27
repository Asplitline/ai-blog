# 开发与部署

## 本地开发

使用支持 Next.js 16 的 Node.js 环境及项目指定的 pnpm 版本。

```bash
pnpm install
pnpm dev
```

访问 http://localhost:3000。

```bash
pnpm typecheck   # 生成 MDX / Next.js 类型并运行 TypeScript 检查
pnpm build       # 生成 out/ 静态站点
```

生产构建使用静态文件托管；本地开发使用 `pnpm dev`。

## 开发约定

- 保持静态导出架构，优先复用现有 Fumadocs 组件、Tailwind CSS 与主题变量。
- 客户端交互通过独立组件实现；浏览器 API 仅在客户端使用。
- 功能变更同步更新相关文档，保持 README 简洁。
- 提交前运行 `pnpm typecheck` 和 `pnpm build`，并验证受影响页面。

## 发布与 CI

文章发布规则见 [内容与发布规范](content-guide.md)。

### 自动合并

工作流：[`.github/workflows/owner-auto-merge.yml`](../.github/workflows/owner-auto-merge.yml)。

现有规则筛选由 Asplitline 创建、来源为当前仓库、目标为 main 且非 Draft 的开放 PR。要求 Vercel commit status 成功、综合 status 成功，以及已报告 check runs 完成并处于 success、neutral 或 skipped 状态。通过后调用 GitHub 自动 Squash Merge，并校验 head SHA。

Draft PR（包括每周学习周报）保留人工审核流程。失败或尚未满足检查条件的 PR 等待后续处理。

自动合并依赖仓库 Allow auto-merge、Actions 写权限及适当的分支保护配置。当前工作流检查已有 CI 结果，本身不执行构建或类型检查。建议在 main 的规则中将必须通过的检查设为 required checks。

### Vercel 部署

- PR / 非生产分支：Preview Deployment。
- main：Production Deployment。
- 构建命令：`pnpm build`，静态输出目录：`out/`。

合并及构建成功后仍应在预览或生产站点检查交互功能，尤其是移动端、Zen 切换、批注恢复及导出。
