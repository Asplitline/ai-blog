# Asplitline AI Blog

基于 Fumadocs + Next.js 的静态个人技术博客，用于把 ChatGPT 技术讨论沉淀成可长期维护的文章。

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Fumadocs UI / Core / MDX
- pnpm
- GitHub
- Vercel

## 本地开发

```bash
pnpm install
pnpm dev
```

访问 `http://localhost:3000`。

构建纯静态站点：

```bash
pnpm build
```

Next.js 使用 `output: 'export'`，构建产物输出到 `out/`。

## 页面结构

```text
/                              首页
/posts/<slug>                  文章详情
/categories                    分类列表
/categories/<category-slug>    分类文章
/tags                          标签列表
/tags/<tag-slug>               标签文章
```

首页和聚合页使用 Fumadocs `HomeLayout`，文章区使用 Notebook `DocsLayout` + `DocsPage`。

## 文章 Frontmatter

文章存放在 `content/posts/`。

```yaml
---
title: "文章标题"
description: "文章摘要"
date: "2026-09-04"
category: "AI Engineering"
tags:
  - Agent
  - MCP
  - Prompt Engineering
draft: false
---
```

规则：

- `category`：必填，一篇文章一个主分类。
- `tags`：可以有多个，用于跨分类描述技术、工具和概念。
- `draft: true`：不会出现在生产文章、首页、分类、标签和搜索结果中。
- 分类和标签页面从 Frontmatter 自动聚合，不维护额外配置文件。

## 搜索

使用 Fumadocs Built-in Search 的静态模式。构建时生成搜索索引，浏览器直接加载索引，因此继续兼容 `output: 'export'`。

## 发布工作流

```text
ChatGPT 对话
→ 整理成 MDX
→ 创建 blog/<slug> 分支
→ 提交 content/posts/<slug>.mdx
→ 创建 Draft Pull Request
→ Vercel 自动生成 Preview Deployment
→ 在线检查首页 / 文章 / 分类 / 标签 / 搜索
→ Merge
→ Vercel Production Deployment
```

后续在 ChatGPT 中说“发布成博客”，默认按照这套流程执行，并自动生成 `category` 与 `tags` Frontmatter。

## Vercel

Git Integration 已用于自动部署：

- PR / 非 Production 分支 → Preview Deployment
- `main` → Production Deployment

推荐在 Vercel Preview Check 成功后再合并 PR。
