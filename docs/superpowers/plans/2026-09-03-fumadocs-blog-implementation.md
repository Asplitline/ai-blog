# Fumadocs Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a static personal blog using Fumadocs, Next.js 16, MDX, GitHub PRs, and Vercel Preview Deployments.

**Architecture:** Fumadocs MDX manages `content/posts` as a typed content collection. Next.js App Router renders a custom blog home page and statically generates `/posts/[slug]` article pages with Fumadocs UI components. GitHub branches/PRs manage publication and Vercel supplies online previews.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Fumadocs UI/Core/MDX, pnpm, GitHub, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-03-ai-blog-design.md`

## Global Constraints

- Use Next.js 16 App Router.
- Use Tailwind CSS 4.
- Use Fumadocs for MDX/content/document UI capabilities.
- Content lives in `content/posts`.
- Public article URLs use `/posts/<slug>`.
- Build output is static via `output: 'export'`.
- Publication flow is branch → Draft PR → Vercel Preview → merge.

---

### Task 1: Project foundation

**Files:** `package.json`, `tsconfig.json`, `next-env.d.ts`, `next.config.mjs`, `postcss.config.mjs`, `.gitignore`

- [ ] Define pnpm scripts for dev, build, lint, and Fumadocs type generation.
- [ ] Configure Next.js static export and the Fumadocs MDX plugin.
- [ ] Configure TypeScript aliases and Tailwind PostCSS.
- [ ] Verify required generated folders are ignored.

### Task 2: Content source and sample article

**Files:** `source.config.ts`, `lib/source.ts`, `content/posts/hello-ai-blog.mdx`

- [ ] Define a typed Fumadocs collection with title, description, date, tags, and draft fields.
- [ ] Load the collection at base URL `/posts`.
- [ ] Add one sample article so static generation can be verified.

### Task 3: Blog UI and static routes

**Files:** `app/layout.tsx`, `app/global.css`, `app/page.tsx`, `app/posts/[slug]/page.tsx`, `components/mdx.tsx`

- [ ] Configure Fumadocs root provider and global styles.
- [ ] Render the home page from the content source.
- [ ] Render article title, description, date, tags, TOC, and MDX body.
- [ ] Generate static article params and SEO metadata.

### Task 4: Documentation and preview workflow

**Files:** `README.md`

- [ ] Document local pnpm usage.
- [ ] Document ChatGPT → branch → Draft PR → Vercel Preview → merge workflow.
- [ ] Document Vercel import settings and static build behavior.

### Task 5: Verification and preview deployment

- [ ] Inspect committed files on the feature branch.
- [ ] Create a Draft PR targeting `main`.
- [ ] Connect/import the repository into Vercel when supported by the connected Vercel tooling.
- [ ] Trigger a Preview deployment and verify its deployment status/build logs.
- [ ] Return the real Preview URL when deployment succeeds.
