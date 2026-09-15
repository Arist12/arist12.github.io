# Yikai Zhang — personal site

A custom, minimal Astro site. Static HTML, local fonts, no browser-side JavaScript
in the production pages. Built independently of the old academic homepage template.

## Local preview

Requires Node.js 22.12+ (Node.js 24 recommended).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4321/. Astro 7 keeps the development server running in the
background; stop it with `npx astro dev stop` from this directory.

## Edit the profile

Name, work, emails, social links and education: `src/data/profile.ts`.
Homepage wording and layout: `src/components/HomePage.astro`.
Styles: `src/styles/global.css`.

The homepage name uses Cormorant Garamond, medium italic. Fonts are served locally.

## Add a blog post

Copy `src/content/posts/first-post.md` to a descriptive filename, such as
`src/content/posts/llm-agents.md`. Replace the example content and metadata:

```yaml
---
title: "My article title"
description: "A short description for search results."
date: 2026-09-14
draft: false
---
```

Write the article below the metadata using Markdown. Its URL will be
`/writing/llm-agents/`. Add images to `public/images/` and reference them as
`![Description](/images/example.png)`.

- `draft: true` excludes a post from **both** lists and generated article URLs.
- The Writing navigation is always visible. Before the first post, its page shows
  “Notes and essays, coming soon.” Publishing adds the latest posts to the homepage.
- The homepage shows the latest three articles. `/writing/` lists all articles.
- Articles share `src/layouts/ArticleLayout.astro`: title, description, author,
  date, and a comfortable reading column. They support headings, links, images,
  tables, quotations and light highlighted code blocks.
- For a Notion-style aside, use `<aside class="callout"><p>Your note.</p></aside>`.
- Optional image captions can use standard `<figure>` and `<figcaption>` HTML.
- The included template is a draft and is never published by default.

## Preview article typography

While the development server is running, open `/preview/article/` to see the draft
sample in the actual article layout. This route is excluded from production builds
and has `noindex` metadata. It is not linked from the public Writing list.

## Publish to GitHub Pages

```sh
npm run build
```

The `dist/` folder contains the complete static site. The canonical site URL is
configured in `astro.config.mjs` as `https://arist12.github.io`.

Push changes to `main` to publish. `.github/workflows/deploy.yml` installs the locked
dependencies, builds the site, and deploys to GitHub Pages. The repository's Pages
source is GitHub Actions. You can also run the workflow manually from the Actions tab.

To publish a post directly on GitHub, add a Markdown file under `src/content/posts/`
with the metadata above and `draft: false`, then commit to `main`. The site rebuilds
automatically. Upload article images to `public/images/` in the same way.

The previous academic homepage remains available in Git history before the redesign
commit; reverting that commit restores its source. Restoring the old Jekyll deployment
also requires switching Pages back to deployment from the `main` branch root.
