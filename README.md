# Asplitline AI Blog

个人 AI 工程与技术学习博客，用于沉淀技术研究、Agent Engineering 学习周报、实践记录，以及阅读过程中产生的批注与问题。

## 当前功能

- **文章与知识组织**：MDX 文章、按日期排序、分类和标签自动聚合、静态全文搜索。
- **阅读体验**：文章列表按需展开、正文目录、Zen 专注阅读模式、阅读进度条、深浅色主题。
- **本地阅读批注**：选中文字后弹出输入框，支持纯划线或附加想法与问题；可编辑、删除、定位原文。
- **批注导出**：一次导出当前站点所有文章的批注，支持 JSON 和 Markdown，便于备份及交给 AI 分析。
- **内容生产**：通过 ChatGPT 整理技术文章及每周 Agent Engineering 学习资料，使用 GitHub PR 发布。
- **部署与合并**：Vercel Preview / Production 部署，GitHub Actions 为符合条件的个人 PR 执行自动合并。

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 应用 | Next.js 16、React 19、TypeScript |
| UI | Fumadocs UI 16、Tailwind CSS 4 |
| 内容 | Fumadocs Core 16、Fumadocs MDX 15、Zod |
| 搜索 | Fumadocs 静态搜索客户端 |
| 批注 | Selection / Range API、CSS Custom Highlight API、localStorage |
| 工程 | pnpm 10.17.1、GitHub Actions、Vercel |

Next.js 使用 `output: 'export'`，构建产物为 `out/`。阅读和批注功能均在浏览器运行，当前无需数据库、登录、GitHub Token 或运行时后端。

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

## 页面与项目结构

| 路由 | 功能 |
| --- | --- |
| `/` | 文章首页 |
| `/posts/<slug>` | 文章详情、Zen 阅读、本地批注 |
| `/categories` | 分类列表 |
| `/categories/<category-slug>` | 分类文章 |
| `/tags` | 标签列表 |
| `/tags/<tag-slug>` | 标签文章 |

核心文件：

```text
app/
  global.css                       全局样式、Zen 与批注样式
  posts/
    layout.tsx                     文章区 Notebook DocsLayout
    [slug]/page.tsx                文章渲染与阅读功能入口
components/
  blog/
    article-navigation.tsx         按需展开的文章列表
    article-meta.tsx               文章元数据
    zen-reading-toggle.tsx         专注模式、阅读进度与位置恢复
    reading-annotations.tsx        划线、批注编辑、侧栏与导出
  search.tsx                       静态搜索对话框
  root-provider.tsx                全局 Provider
lib/
  source.ts                        MDX collection 与 schema
  posts.ts                         发布文章、分类和标签聚合
  annotations.ts                   批注类型、持久化读取与文本锚点
  layout.shared.tsx                 公共导航配置
content/posts/                     MDX 文章
.github/workflows/
  owner-auto-merge.yml             个人 PR 自动合并
next.config.mjs                    Next.js 静态导出配置
```

首页和聚合页使用 HomeLayout，文章使用 Fumadocs Notebook DocsLayout / DocsPage。搜索索引在构建阶段生成，由浏览器读取。

## 阅读与批注

### Zen 模式

文章页点击「Zen 阅读」，隐藏导航、侧边栏和目录，将正文居中展示，保留退出按钮、阅读进度与批注入口。支持 Esc 退出，并尝试保持切换前的阅读位置。

### 本地批注

1. 在正文选中文字，等待批注输入框弹出。
2. 留空保存即可划线；也可输入问题、理解或补充内容。
3. 点击已有划线可编辑；通过批注侧栏查看记录、定位原文或删除。
4. 使用批注侧栏中的导出按钮备份所有文章的记录。

批注采用统一的数据模型，内容选填。支持 Cmd/Ctrl + Enter 保存、Esc 取消；移动端使用底部弹窗。

数据保存在 `localStorage` 的 `ai-blog:annotations:v1` 键中，包含文章 slug、标题、URL、引用原文、前后文、文本偏移、批注内容和时间戳。文章更新后会尝试依据引用及上下文恢复定位，无法定位的批注仍保留在列表中。

### 导出与 AI 学习

| 格式 | 用途 |
| --- | --- |
| JSON | 结构化备份，包含完整批注及锚点，外层含版本与导出时间 |
| Markdown | 阅读复盘、向 AI 提供引用原文与问题 |

可将导出的 Markdown 或 JSON 提交给 ChatGPT，要求结合对应 MDX 原文逐条解答。当前没有自动 AI 解答、导入、跨设备同步或 GitHub Issue 同步功能。

批注数据按浏览器和站点 origin 隔离；Vercel Preview 与生产域名分别保存。清除站点数据会删除本地记录，建议定期导出。JSON 备份目前尚无内置恢复入口。

## 内容规范

文章放在 `content/posts/<slug>.mdx`，slug 应尽量稳定，以保留文章链接与本地批注关联。

```yaml
---
title: "文章标题"
description: "文章摘要"
date: "2026-11-27"
category: "AI Engineering"
tags:
  - AI Agent
  - Harness
draft: false
---
```

- 日期采用 YYYY-MM-DD；文章按日期倒序排列。
- category 为必填的单一主分类；tags 可包含多个主题，默认空数组。
- draft 默认 false；true 时从发布文章列表及文章静态路由中排除。
- 分类与标签根据已发布文章自动聚合，无需维护独立索引。
- 技术文章保留可点击的原始资料、仓库、代码或文档链接，区分事实与分析；转载内容应注明来源。

### Agent Engineering 学习周报

每周五上午整理上周五至本周五（UTC+8）的学习资料，关注 GitHub Trending、相关项目的提交、Release 和文档。

- 按 Agent 工程能力层分类，例如 Skills、Harness、Runtime、Context / Memory、Coding Agents、Evaluation。
- 区分本周新增或重要更新、持续学习项目和前期学习延续；记录可验证证据。
- 说明项目定位、核心原理、工程价值、学习优先级与实践建议。
- 提供周六、周日及下一周的学习计划。

命名：`content/posts/agent-engineering-weekly-YYYY-MM-DD.mdx`，日期取统计周期结束的周五。同一期已有文章或 PR 时优先更新，避免重复发布。周报使用 AI Engineering 分类，创建 Draft PR 等待人工审核。

## 发布与 CI

### 文章发布

```text
整理文章 → blog/<slug> 分支 → MDX 提交
→ Draft PR → Vercel Preview → 人工审核 → 合并 main → Production
```

普通代码修改使用独立功能或修复分支，提交 PR 后检查构建和预览效果。

### 自动合并

工作流：[`.github/workflows/owner-auto-merge.yml`](.github/workflows/owner-auto-merge.yml)。

现有规则筛选由 Asplitline 创建、来源为当前仓库、目标为 main 且非 Draft 的开放 PR。要求 Vercel commit status 成功、综合 status 成功，以及已报告 check runs 完成并处于 success、neutral 或 skipped 状态。通过后调用 GitHub 自动 Squash Merge，并校验 head SHA。

Draft PR（包括每周学习周报）保留人工审核流程。失败或尚未满足检查条件的 PR 等待后续处理。

自动合并依赖仓库 Allow auto-merge、Actions 写权限及适当的分支保护配置。当前工作流检查已有 CI 结果，本身不执行构建或类型检查。建议在 main 的规则中将必须通过的检查设为 required checks。

### Vercel 部署

- PR / 非生产分支：Preview Deployment。
- main：Production Deployment。
- 构建命令：`pnpm build`，静态输出目录：`out/`。

合并及构建成功后仍应在预览或生产站点检查交互功能，尤其是移动端、Zen 切换、批注恢复及导出。
