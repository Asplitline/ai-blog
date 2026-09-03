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

访问：

```text
http://localhost:3000
```

构建静态站点：

```bash
pnpm build
```

Next.js 使用 `output: 'export'`，构建产物输出到 `out/`。

## 文章

文章存放在：

```text
content/posts/
```

Frontmatter：

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

文章 URL：

```text
/posts/<slug>
```

## 发布工作流

推荐流程：

```text
ChatGPT 对话
→ 整理成 MDX
→ 创建 blog/<slug> 分支
→ 提交 content/posts/<slug>.mdx
→ 创建 Draft Pull Request
→ Vercel 自动生成 Preview Deployment
→ 在线检查
→ Merge
→ Production Deployment
```

后续在 ChatGPT 中说“发布成博客”，默认按照这套流程执行。

## Vercel

将 `Asplitline/ai-blog` 导入 Vercel 后保持默认 Next.js 构建配置即可：

- Framework Preset: Next.js
- Install Command: `pnpm install`
- Build Command: `pnpm build`
- Output Directory: Next.js 自动识别

Git 集成完成后，每个 Pull Request 都会生成独立 Preview Deployment，合并到 `main` 后生成 Production Deployment。
