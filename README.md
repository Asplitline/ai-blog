# Asplitline AI Blog

个人 AI 工程与技术学习博客，用于沉淀技术研究、Agent Engineering 学习周报、实践记录和阅读批注。

## 核心功能

- MDX 技术文章、分类与标签、全文搜索。
- Zen 专注阅读、阅读进度、深浅色主题。
- 本地划线与批注，支持编辑、删除及原文定位。
- JSON / Markdown 批注导出，便于备份及 AI 辅助学习。
- 每周 Agent Engineering 学习周报。

批注仅保存在当前浏览器，建议定期导出备份。

## 快速开始

```bash
pnpm install
pnpm dev
```

访问 http://localhost:3000。

## 技术架构

基于 Next.js 16、React 19、TypeScript、Fumadocs 和 Tailwind CSS 4，采用静态导出（`out/`）与 Vercel 部署。

| 目录 | 职责 |
| --- | --- |
| `app/` | 页面、路由与布局 |
| `components/` | 阅读、搜索和批注交互 |
| `lib/` | 内容聚合、数据模型和文本定位 |
| `content/posts/` | MDX 文章 |

批注通过 Selection / Range API 定位原文，使用浏览器 localStorage 保存，支持 JSON / Markdown 导出。当前无需后端或数据库，暂不支持跨设备同步和导入。

## 开发与发布

```bash
pnpm typecheck
pnpm build
```

- 优先复用现有组件与主题变量，保持静态导出兼容。
- 文章使用 MDX，包含标题、摘要、日期、分类、标签和 draft 状态。
- 每周五生成 Agent Engineering 学习周报，通过 Draft PR 人工审核。
- Asplitline 发起的同仓库非 Draft PR 在符合 CI 检查条件后自动 Squash Merge，Vercel 随 main 更新部署。

详细架构和规范见下方文档；AI 开发工具可从 [AGENTS.md](AGENTS.md) 获取入口。

## 项目文档

| 文档 | 内容 |
| --- | --- |
| [代码架构](docs/architecture.md) | 技术栈、目录结构、页面路由、核心模块 |
| [开发与部署](docs/development.md) | 开发约定、构建检查、CI 与自动合并 |
| [内容与发布规范](docs/content-guide.md) | MDX、文章规范、学习周报与发布流程 |
