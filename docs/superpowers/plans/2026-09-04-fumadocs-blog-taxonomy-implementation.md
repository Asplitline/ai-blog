# Fumadocs Blog Taxonomy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom blog shell with Fumadocs HomeLayout + Notebook DocsLayout/DocsPage, and add static category/tag browsing plus static Fumadocs search.

**Architecture:** The existing Fumadocs MDX source remains the single source of truth. `lib/posts.ts` becomes the blog query/taxonomy boundary; route groups use Fumadocs layouts, and all taxonomy/search routes are generated at build time so `output: 'export'` remains valid.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Fumadocs UI/Core/MDX, GitHub, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-04-fumadocs-blog-taxonomy-design.md`

## Global Constraints

- Keep article content in `content/posts/*.mdx`.
- Keep public article URLs at `/posts/<slug>`.
- Use one required `category` plus zero-or-more `tags` in Frontmatter.
- Derive categories and tags from published articles; do not hardcode taxonomy lists.
- Keep `output: 'export'` and generate static params for every dynamic route.
- Prefer Fumadocs layouts/page/search primitives over custom equivalents.
- Draft articles must be excluded from homepage, taxonomy pages, article output, and search indexes.
- Keep the existing `neutral` Fumadocs theme.

---

### Task 1: Content schema and taxonomy query layer

**Files:**
- Modify: `lib/source.ts`
- Create: `lib/posts.ts`
- Modify: `content/posts/hello-ai-blog.mdx`

**Interfaces:**
- Produces `getPublishedPosts()`, `getCategories()`, `getTags()`, `getPostsByCategory(slug)`, `getPostsByTag(slug)`, `toTaxonomySlug(value)`.
- Produces required `page.data.category: string` on every post.

- [ ] **Step 1: Extend the Fumadocs collection schema**

Add `category: z.string().min(1)` beside `date`, `tags`, and `draft` in `lib/source.ts`.

- [ ] **Step 2: Add taxonomy helpers in `lib/posts.ts`**

Implement:

```ts
import { blog } from '@/lib/source';

export function toTaxonomySlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/gu, '-')
    .replace(/-+/gu, '-');
}

export function getPublishedPosts() {
  return blog
    .getPages()
    .filter((page) => !page.data.draft)
    .sort((a, b) => b.data.date.localeCompare(a.data.date));
}
```

Define taxonomy entries as `{ name: string; slug: string; count: number }`, derived from published posts only. Category/tag lookup must compare using `toTaxonomySlug()`.

- [ ] **Step 3: Migrate the sample article**

Add:

```yaml
category: "AI Engineering"
```

to `content/posts/hello-ai-blog.mdx`.

- [ ] **Step 4: Verify type generation/build reaches the new schema**

Run through Vercel Preview after this task; expected result is no missing `category` schema error.

---

### Task 2: Shared Fumadocs layout configuration

**Files:**
- Create: `lib/layout.shared.tsx`
- Create: `app/(home)/layout.tsx`
- Create: `app/posts/layout.tsx`
- Move/replace: `app/page.tsx` → `app/(home)/page.tsx`

**Interfaces:**
- `baseOptions(): BaseLayoutProps` is used by both `HomeLayout` and Notebook `DocsLayout`.
- Notebook layout consumes `blog.getPageTree()`.

- [ ] **Step 1: Create shared layout options**

Use current Fumadocs API:

```tsx
import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'Asplitline Blog',
      url: '/',
      transparentMode: 'top',
    },
    links: [
      { text: '文章', url: '/', active: 'nested-url' },
      { text: '分类', url: '/categories', active: 'nested-url' },
      { text: '标签', url: '/tags', active: 'nested-url' },
    ],
    githubUrl: 'https://github.com/Asplitline/ai-blog',
  };
}
```

- [ ] **Step 2: Wrap homepage/taxonomy routes with HomeLayout**

Create `app/(home)/layout.tsx` using:

```tsx
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
```

- [ ] **Step 3: Wrap posts with Notebook DocsLayout**

Create `app/posts/layout.tsx` using:

```tsx
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { blog } from '@/lib/source';
```

and pass `tree={blog.getPageTree()}` plus `baseOptions()`.

- [ ] **Step 4: Move the homepage into `(home)`**

Create `app/(home)/page.tsx` and remove the old root `app/page.tsx` after the replacement exists.

---

### Task 3: Reusable blog cards and taxonomy pages

**Files:**
- Create: `components/blog/article-card.tsx`
- Create: `components/blog/taxonomy-list.tsx`
- Create: `app/(home)/categories/page.tsx`
- Create: `app/(home)/categories/[slug]/page.tsx`
- Create: `app/(home)/tags/page.tsx`
- Create: `app/(home)/tags/[slug]/page.tsx`
- Modify: `app/(home)/page.tsx`

**Interfaces:**
- `ArticleCard` consumes one item returned by `getPublishedPosts()`.
- `TaxonomyList` consumes `{ name, slug, count }[]` and a base path (`/categories` or `/tags`).

- [ ] **Step 1: Build `ArticleCard`**

Render date, category link, tag links, title, and description. Generate every taxonomy URL via `toTaxonomySlug()` or the precomputed taxonomy slug.

- [ ] **Step 2: Build `TaxonomyList`**

Render a responsive list of taxonomy links with article counts; keep the component presentation-only.

- [ ] **Step 3: Replace homepage content**

Homepage sections:

```text
Hero
Categories
Latest Posts
Popular Tags
```

Use `getCategories()`, `getPublishedPosts()`, and `getTags()`.

- [ ] **Step 4: Build `/categories` and `/tags` indexes**

Use `TaxonomyList` with data derived at build time.

- [ ] **Step 5: Build category detail route**

`generateStaticParams()` must return every category slug. Resolve the taxonomy entry by slug, call `notFound()` for an unknown slug, and render its `ArticleCard` list.

- [ ] **Step 6: Build tag detail route**

Mirror the category route using `getTags()` and `getPostsByTag()`.

---

### Task 4: Notebook DocsPage article rendering

**Files:**
- Create: `components/blog/article-meta.tsx`
- Modify: `app/posts/[slug]/page.tsx`

**Interfaces:**
- `ArticleMeta` receives `date`, `category`, `tags`.
- Article page imports `DocsPage`, `DocsTitle`, `DocsDescription`, `DocsBody` explicitly from `fumadocs-ui/layouts/notebook/page`.

- [ ] **Step 1: Create `ArticleMeta`**

Render date and clickable category/tag links. Keep all taxonomy URLs generated with `toTaxonomySlug()`.

- [ ] **Step 2: Replace the hand-written article shell**

Use:

```tsx
<DocsPage toc={page.data.toc}>
  <ArticleMeta ... />
  <DocsTitle>{page.data.title}</DocsTitle>
  {page.data.description ? (
    <DocsDescription>{page.data.description}</DocsDescription>
  ) : null}
  <DocsBody>
    <MDX components={getMDXComponents()} />
  </DocsBody>
</DocsPage>
```

Remove `InlineTOC` and the hand-built `<main>`, header, and typography wrappers.

- [ ] **Step 3: Keep static article generation**

`generateStaticParams()` must only emit non-draft pages from `getPublishedPosts()`.

---

### Task 5: Static Fumadocs search

**Files:**
- Create: `app/api/search/route.ts`
- Create: `components/search.tsx`
- Create: `components/root-provider.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Search index is built only from `getPublishedPosts()`.
- Search UI uses Fumadocs `staticClient()` so it consumes the static index generated by the route.

- [ ] **Step 1: Build a draft-safe static search route**

Use `createSearchAPI('advanced', { indexes })` rather than indexing the full source, so drafts are excluded explicitly:

```ts
import { createSearchAPI } from 'fumadocs-core/search/server';
import { getPublishedPosts } from '@/lib/posts';

export const revalidate = false;

export const { staticGET: GET } = createSearchAPI('advanced', {
  indexes: getPublishedPosts().map((page) => ({
    title: page.data.title,
    description: page.data.description,
    url: page.url,
    id: page.url,
    structuredData: page.data.structuredData,
  })),
});
```

- [ ] **Step 2: Build the static SearchDialog**

Create a client component using `useDocsSearch({ client: staticClient() })` and Fumadocs search dialog primitives (`SearchDialog`, `SearchDialogOverlay`, `SearchDialogContent`, `SearchDialogHeader`, `SearchDialogIcon`, `SearchDialogInput`, `SearchDialogClose`, `SearchDialogList`).

- [ ] **Step 3: Wire SearchDialog into RootProvider**

Create a client `components/root-provider.tsx` wrapper around `RootProvider` from `fumadocs-ui/provider/next`, pass `search={{ SearchDialog }}`, and use that wrapper in `app/layout.tsx`.

---

### Task 6: Documentation and deployment verification

**Files:**
- Modify: `README.md`

**Interfaces:**
- README documents the final Frontmatter model and static taxonomy/search URLs.

- [ ] **Step 1: Update README**

Document `category`, multi-tags, `/categories`, `/tags`, and the PR → Vercel Preview → Merge → Production workflow.

- [ ] **Step 2: Create/update the feature PR**

Open a PR from `feat/fumadocs-blog-taxonomy` to `main` with a concise summary of layout, taxonomy, and search changes.

- [ ] **Step 3: Verify Vercel Preview**

Expected checks:

```text
Vercel: success
GET /                      renders HomeLayout homepage
GET /posts/hello-ai-blog   renders Notebook DocsPage
GET /categories            lists AI Engineering
GET /categories/ai-engineering renders the sample article
GET /tags                  lists AI, Blog, Workflow
GET /tags/ai               renders the sample article
Search                     returns the sample article
```

- [ ] **Step 4: Inspect build errors before merge**

If Vercel fails, use the deployment/check logs to fix the feature branch and re-run Preview. Merge only after the Vercel check is green.
