# AI Blog 设计说明

## 目标

建立一个面向个人技术沉淀的静态博客。核心使用流程：

1. 在 ChatGPT 中完成技术讨论。
2. 将有价值的对话整理为 Markdown/MDX 文章。
3. ChatGPT 通过 GitHub 创建文章分支并提交内容。
4. 创建 Draft Pull Request。
5. Vercel 为 PR 自动生成在线 Preview URL。
6. 在线检查文章效果后 Merge。
7. `main` 分支自动部署正式博客。

## 技术选型

- Next.js 16，App Router。
- React + TypeScript。
- Tailwind CSS 4。
- Fumadocs UI + Fumadocs Core。
- Fumadocs MDX 作为内容源。
- pnpm 作为包管理器。
- GitHub 作为文章与源码存储。
- Vercel 负责 Preview Deployment 和 Production Deployment。

优先使用 Fumadocs 提供的现成能力，包括 MDX 渲染、布局、目录、导航、代码块与内容源管理，减少自行实现文档基础设施。

## 页面结构

### 首页 `/`

定位为个人技术博客首页，而不是传统文档站首页。

展示：

- 站点名称与简短介绍。
- 最新文章列表。
- 文章标题、摘要、日期、标签。
- 进入文章详情页的链接。

第一版保持简单，不引入数据库、CMS 或复杂交互。

### 文章页 `/posts/[...slug]`

文章正文由 Fumadocs 渲染。

包含：

- 标题。
- 描述。
- 发布日期。
- 标签。
- Markdown/MDX 正文。
- 自动目录 TOC。
- 代码高亮。
- Fumadocs 提供的文档阅读布局能力。

博客 URL 使用 `/posts`，底层继续复用 Fumadocs Source API。

## 内容组织

文章放在：

```text
content/posts/
  prompt-cache.mdx
  opencli-vs-chrome-devtools-mcp.mdx
```

Frontmatter 第一版固定为：

```yaml
---
title: "文章标题"
description: "文章摘要"
date: "2026-09-03"
tags:
  - AI
  - Agent
draft: false
---
```

通过 `source.config.ts` 定义 Frontmatter schema，避免每篇文章字段结构漂移。

## 静态生成

目标输出为纯静态页面。

Next.js 配置：

```js
const nextConfig = {
  output: 'export',
}
```

文章路径在构建阶段生成静态 HTML。

这样站点可以继续部署到 Vercel，也保留未来迁移到 Cloudflare Pages、GitHub Pages 或对象存储 + CDN 的能力。

## 搜索

第一版采用 Fumadocs 官方静态搜索方案。

静态构建时生成搜索索引，浏览器端完成搜索，避免为博客引入独立搜索服务。

如果静态搜索配置增加较多复杂度，项目初始化阶段允许先保留搜索入口与配置边界，文章发布主流程优先完成。

## GitHub 发布流程

默认分支：

```text
main
```

每篇新文章创建独立分支：

```text
blog/<slug>
```

例如：

```text
blog/prompt-cache
```

提交信息：

```text
docs: add <article title>
```

随后创建 Draft Pull Request。

PR 描述至少包含：

- 文章标题。
- 文章路径。
- 内容来源说明，例如“整理自 ChatGPT 技术讨论”。
- Preview 状态说明。

## Vercel Preview

仓库连接 Vercel 后：

- `main` 对应 Production。
- 非 Production 分支对应 Preview Deployment。
- 每个 PR 可以直接访问 Preview URL。
- 分支后续 push 自动更新 Preview。

审核流程：

```text
ChatGPT 生成文章
→ GitHub Draft PR
→ Vercel Preview
→ 在线阅读
→ 修改文章或确认
→ Merge
→ Production
```

## ChatGPT 发布约定

后续用户说：

```text
发布成博客
```

默认理解为：

1. 整理当前对话中的有效内容。
2. 删除聊天语气和重复追问。
3. 保留技术背景、原理、代码、排查过程和结论。
4. 生成 title、description、date、tags、slug。
5. 读取博客现有文章风格与 Frontmatter schema。
6. 创建 `blog/<slug>` 分支。
7. 写入 `content/posts/<slug>.mdx`。
8. 创建 Draft PR。
9. 返回 PR 信息；Vercel 连接完成后，Preview URL 由部署流程产生。

## 非目标

第一版不加入：

- 数据库。
- 登录系统。
- 在线 CMS。
- 评论系统。
- 文章后台管理。
- 阅读量统计。
- AI 自动扫描全部历史 ChatGPT 对话。

这些能力根据后续实际使用需求逐步增加。

## 第一版完成标准

- `pnpm install` 可以完成依赖安装。
- `pnpm dev` 可以启动博客。
- 首页可以展示文章列表。
- 示例 MDX 文章可以访问。
- 文章页面包含 Fumadocs 阅读布局、TOC 和代码高亮。
- `pnpm build` 可以完成静态导出。
- 新增一个 MDX 文件后能够生成对应 `/posts/...` 页面。
- README 说明本地开发和 ChatGPT → GitHub → PR → Preview 发布流程。
- 项目可以直接导入 Vercel。
