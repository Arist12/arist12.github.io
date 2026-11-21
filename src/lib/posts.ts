import { getCollection } from "astro:content";

export async function publishedPosts() {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

// Estimated reading time of a post's Markdown body, in whole minutes (at least 1).
// Counts the prose at 230 words a minute and adds 12 seconds per figure. Code blocks,
// HTML tags, URLs and directive markers are not counted as words.
export function readingMinutes(markdown: string | undefined) {
  if (!markdown) return 1;
  const figures = (markdown.match(/^:::figure/gm) ?? []).length;
  const prose = markdown
    .replace(/^(```|~~~)[\s\S]*?^\1[^\n]*$/gm, " ") // fenced code and dot diagrams
    .replace(/<[^>]+>/g, " ") // inline HTML such as <picture>
    .replace(/^:::.*$/gm, " ") // directive openers and closers
    .replace(/\]\([^)]*\)/g, "] ") // link and image targets
    .replace(/\$\$[\s\S]*?\$\$/g, " ") // display maths
    .replace(/https?:\/\/\S+/g, " ");
  const words = prose.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,-]*/gu)?.length ?? 0;
  return Math.max(1, Math.round(words / 230 + (figures * 12) / 60));
}
