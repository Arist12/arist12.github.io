import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://arist12.github.io',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  markdown: { shikiConfig: { theme: 'github-light' } },
});
