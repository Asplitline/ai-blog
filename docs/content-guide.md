# 内容与发布规范

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

## 文章发布

```text
整理文章 → blog/<slug> 分支 → MDX 提交
→ Draft PR → Vercel Preview → 人工审核 → 合并 main → Production
```

普通代码修改使用独立功能或修复分支，提交 PR 后检查构建和预览效果。
