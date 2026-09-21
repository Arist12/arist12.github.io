import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { remarkBlogDirectives } from './src/plugins/remark-blog-directives.mjs';
import { graphvizBuildGuard, remarkGraphviz } from './src/plugins/remark-graphviz.mjs';

export default defineConfig({
  site: 'https://arist12.github.io',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [graphvizBuildGuard()],
  markdown: {
    shikiConfig: { theme: 'github-light' },
    processor: unified({
      remarkPlugins: [remarkDirective, remarkBlogDirectives, remarkMath, remarkGraphviz],
      rehypePlugins: [[rehypeKatex, { output: 'html', strict: false }]],
    }),
  },
});
