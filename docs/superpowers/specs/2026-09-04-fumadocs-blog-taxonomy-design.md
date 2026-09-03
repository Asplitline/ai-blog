# Fumadocs 博客布局与分类体系设计

## 目标

将当前“自定义博客页面 + Fumadocs 局部组件”的结构升级为以 Fumadocs 原生布局为主的博客/知识库，同时加入稳定的分类与标签体系。

目标使用流程保持不变：

```text
ChatGPT 整理文章
→ 新建文章分支
→ 提交 MDX
→ GitHub PR
→ Vercel Preview
→ 在线检查
→ Merge main
→ Vercel Production 自动更新
```

## 设计原则

1. 优先使用 Fumadocs 官方布局、页面和搜索能力，减少自维护 UI 基础设施。
2. 文章仍然是 `content/posts/*.mdx`，保持 Git 友好和可迁移。
3. 分类与标签来自 Frontmatter，构建时生成全部页面，不引入数据库。
4. 所有页面兼容 Next.js `output: 'export'`。
5. URL 稳定，可长期积累，不把分类结构嵌进文章 URL。

## Fumadocs 布局

### 首页及聚合页

使用 Fumadocs `HomeLayout`。

适用页面：

- `/`
- `/categories`
- `/categories/[slug]`
- `/tags`
- `/tags/[slug]`

`HomeLayout` 负责统一 Navbar、搜索入口、主题切换和共享导航。

首页内部继续使用博客式内容排版，而不是文档侧边栏。

### 文章区

`/posts/*` 使用 Fumadocs `Notebook` Layout。

```text
/posts
└── Notebook DocsLayout
    └── DocsPage
        ├── Breadcrumb
        ├── Article Meta
        ├── DocsTitle
        ├── DocsDescription
        ├── DocsBody
        ├── TOC
        └── Footer / neighbour navigation
```

文章页面使用 `fumadocs-ui/layouts/notebook/page` 的 `DocsPage`、`DocsTitle`、`DocsDescription`、`DocsBody`。

Notebook 的侧边导航来自 Fumadocs page tree。第一版把它作为文章导航/知识库导航使用。

## 全局导航

抽出 `lib/layout.shared.tsx`，统一提供 Fumadocs `BaseLayoutProps`。

Navbar 第一版包含：

- 站点标题 `Asplitline Blog`，点击返回首页。
- `文章` → `/posts/hello-ai-blog` 或后续文章索引入口。
- `分类` → `/categories`。
- `标签` → `/tags`。
- GitHub 仓库链接。
- Fumadocs 搜索按钮。
- Fumadocs 主题切换按钮。

后续新增导航只修改共享 options。

## 内容模型

Frontmatter 统一为：

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

字段约束：

- `title`: 必填字符串。
- `description`: Fumadocs page schema 现有字段。
- `date`: 必填 `YYYY-MM-DD` 字符串。
- `category`: 必填字符串，一篇文章只有一个主分类。
- `tags`: 字符串数组，可以为空。
- `draft`: 布尔值，默认 `false`。

现有示例文章补上：

```yaml
category: "AI Engineering"
```

## 分类与标签语义

### Category

Category 用于回答“这篇文章主要属于哪个主题域”。

初始推荐分类：

- `AI Engineering`
- `Frontend`
- `DevOps`
- `Tools`

分类列表不写死在代码中，始终从已发布文章 Frontmatter 聚合生成。

### Tags

Tags 用于横跨主分类描述具体技术或概念，例如：

- `Agent`
- `MCP`
- `Next.js`
- `ECharts`
- `Git`
- `Vercel`

同样从文章动态聚合生成。

## URL 设计

文章 URL 保持：

```text
/posts/<article-slug>
```

分类：

```text
/categories
/categories/<category-slug>
```

标签：

```text
/tags
/tags/<tag-slug>
```

文章 URL 不包含 category，避免以后移动分类导致文章永久链接变化。

## Slug 规范

分类和标签展示值与 URL slug 分离。

建立单一工具函数：

```ts
toTaxonomySlug(value: string): string
```

规则：

1. `trim()`。
2. 转小写。
3. 空白和 `_` 统一为 `-`。
4. 连续 `-` 合并。
5. 保留 Unicode 字母/数字，以支持中文分类和标签。

示例：

```text
AI Engineering → ai-engineering
Prompt Engineering → prompt-engineering
前端开发 → 前端开发
```

路由生成和链接生成必须统一使用该函数。

## 内容查询层

新增 `lib/posts.ts`，把页面层需要的聚合逻辑集中起来。

职责：

- `getPublishedPosts()`：过滤 draft，按日期倒序。
- `getCategories()`：聚合分类和文章数。
- `getTags()`：聚合标签和文章数。
- `getPostsByCategory(slug)`：按分类 slug 查询文章。
- `getPostsByTag(slug)`：按标签 slug 查询文章。
- `toTaxonomySlug()`：统一分类/标签 URL slug。

页面组件不重复实现筛选、排序或 slug 逻辑。

## 首页

首页放在 `(home)` route group 下并由 `HomeLayout` 包裹。

首页信息结构：

```text
Hero
├── Asplitline Blog
├── 一句话介绍
└── 搜索/浏览入口

分类
├── AI Engineering
├── Frontend
├── DevOps
└── Tools

最新文章
└── Article Cards

热门标签
└── Tag Chips
```

文章卡片展示：

- 日期
- 主分类
- 标签
- 标题
- description

分类与标签均可点击。

## 分类页面

### `/categories`

展示所有分类及文章数量。

### `/categories/[slug]`

展示：

- 分类名称。
- 文章数量。
- 对应文章列表。

使用 `generateStaticParams()` 从现有分类生成静态路由。

找不到 slug 时返回 `notFound()`。

## 标签页面

结构与分类页面一致：

### `/tags`

展示全部标签及文章数量。

### `/tags/[slug]`

展示指定标签下的文章。

使用 `generateStaticParams()` 静态生成。

## 文章页面

文章页从当前手写 `<main>` 和 `InlineTOC` 切换为 Notebook `DocsPage`。

页面结构：

```tsx
<DocsPage toc={page.data.toc}>
  <ArticleMeta />
  <DocsTitle>{page.data.title}</DocsTitle>
  <DocsDescription>{page.data.description}</DocsDescription>
  <DocsBody>
    <MDX />
  </DocsBody>
</DocsPage>
```

`ArticleMeta` 只负责博客特有信息：

- date
- category
- tags

TOC、breadcrumb、正文排版、移动端 TOC、footer 和上一篇/下一篇优先交给 Fumadocs。

## 搜索

使用 Fumadocs Built-in Search 的 static mode。

新增：

```text
app/api/search/route.ts
```

使用 `createFromSource(blog)` 的 `staticGET`，让搜索索引在静态构建阶段生成，搜索在浏览器执行。

这与 `output: 'export'` 兼容。

搜索范围第一版覆盖所有 Fumadocs blog pages；draft 页面不应该出现在生产搜索结果中，如果 source 层无法直接过滤，则在构建 search index 时显式忽略 draft。

## 主题

继续使用：

```css
@import 'fumadocs-ui/css/neutral.css';
@import 'fumadocs-ui/css/preset.css';
```

本次重点是布局和信息架构，主题颜色暂不切换。后续可以单独比较 `neutral`、`black`、`ocean`、`aspen`。

## Route Groups

目标 App Router 结构：

```text
app/
├── layout.tsx
├── global.css
├── (home)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── categories/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   └── tags/
│       ├── page.tsx
│       └── [slug]/page.tsx
├── posts/
│   ├── layout.tsx
│   └── [slug]/page.tsx
└── api/
    └── search/route.ts
```

Route Group `(home)` 不改变浏览器 URL。

## 组件边界

新增小型博客组件，避免页面重复：

```text
components/blog/
├── article-card.tsx
├── article-meta.tsx
└── taxonomy-list.tsx
```

职责：

- `article-card.tsx`：聚合页统一文章卡片。
- `article-meta.tsx`：文章详情页分类、标签、日期。
- `taxonomy-list.tsx`：分类/标签聚合入口。

Fumadocs 能提供的基础 UI 不重复封装。

## Draft 行为

Production 页面只展示 `draft: false`。

第一版 Preview 也保持相同行为，避免为了 Draft Preview 引入额外环境判断。

以后确实需要“PR 中预览 draft 文章”时，再独立设计 Preview-only draft 支持。

## 静态构建约束

继续保留：

```js
output: 'export'
```

所有动态路由必须拥有 `generateStaticParams()`：

- `/posts/[slug]`
- `/categories/[slug]`
- `/tags/[slug]`

不新增依赖运行时服务器的 API。

搜索 route 使用 Fumadocs 官方 static search 方案。

## 发布自动化

当前 Vercel Git Integration 已工作。

保持：

```text
push feature/blog branch
→ Vercel Preview
→ GitHub Check
→ Merge main
→ Vercel Production Deployment
```

这次改造完成后创建独立 PR，由 Vercel 生成 Preview URL 验收。

## 验收标准

1. 首页由 Fumadocs `HomeLayout` 包裹，有统一 Navbar、Search、Theme Switch。
2. `/posts/*` 使用 Fumadocs Notebook `DocsLayout` 和 Notebook `DocsPage`。
3. 文章 TOC、正文 typography、breadcrumb/footer 使用 Fumadocs 原生能力。
4. Frontmatter 支持且要求 `category`，继续支持多 `tags`。
5. `/categories` 和 `/tags` 可以浏览所有聚合项及文章数。
6. 分类与标签详情页均静态生成。
7. 分类/标签链接使用统一 slug 逻辑。
8. 首页文章卡片显示分类和标签。
9. Fumadocs 静态搜索可以在 `output: 'export'` 构建下工作。
10. `npm run build` / Vercel Preview 构建成功。
11. Preview 页面在桌面与移动宽度下可正常阅读。
12. Merge 后 Vercel 自动 Production Deploy。

## 非目标

本次不加入：

- 数据库/CMS。
- 多级分类。
- 标签别名系统。
- 自定义主题设计系统。
- 评论、点赞、阅读量。
- Preview-only draft。
- 自动推荐相关文章算法。

这些能力保持可扩展，但不增加本次复杂度。
