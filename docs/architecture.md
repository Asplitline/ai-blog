# 代码架构

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

## 批注实现

数据保存在 `localStorage` 的 `ai-blog:annotations:v1` 键中，包含文章 slug、标题、URL、引用原文、前后文、文本偏移、批注内容和时间戳。文章更新后会尝试依据引用及上下文恢复定位，无法定位的批注仍保留在列表中。

批注交互由 `components/blog/reading-annotations.tsx` 管理，文本锚点捕获与恢复由 `lib/annotations.ts` 提供。高亮优先使用 CSS Custom Highlight API，旧浏览器使用矩形覆盖层。保持 MDX 渲染与批注存储分离，避免直接修改正文 DOM。

### 批注交互

选区完成后克隆 Range，编辑期间通过独立高亮保持原文可见；弹窗显示完整引用预览，并根据实际尺寸及视口计算位置。保存、悬停和定位使用独立强调状态，不改变持久化 schema。批注面板采用桌面抽屉、移动端底部面板，动效遵循 prefers-reduced-motion。无法定位的批注保留记录并禁用原文定位操作。

### 阅读导航

文章顶部阅读工具栏统一提供文章列表与 Zen 入口。文章抽屉默认收起，支持标题和分类筛选、当前文章定位、日期与分类展示，关闭后释放阅读空间。Z 切换 Zen，Esc 退出；输入框、搜索和批注弹窗打开时避免触发快捷键。
