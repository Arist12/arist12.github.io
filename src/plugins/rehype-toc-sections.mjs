// Wraps each `##` heading and what follows it, up to the next `##`, in a <section>, and does the same for `###`
// inside it. Every section names a CSS view timeline (--toc-1, --toc-2, … in document order), which lets the
// contents column mark the section being read with scroll-driven CSS alone: no script runs in the browser.
// The order matches the list that TableOfContents.astro builds from the same headings.

const isHeading = (node, depth) => node.type === 'element' && node.tagName === `h${depth}`;
const isFootnotes = node =>
  node.type === 'element' && node.tagName === 'section' && node.properties && 'dataFootnotes' in node.properties;

function wrap(children, depth, counter) {
  const out = [];
  let current = null;
  for (const node of children) {
    if (isHeading(node, depth)) {
      counter.n += 1;
      current = {
        type: 'element',
        tagName: 'section',
        properties: { className: ['toc-section'], style: `view-timeline-name: --toc-${counter.n}` },
        children: [node],
      };
      out.push(current);
    } else if (current && !isFootnotes(node)) {
      current.children.push(node);
    } else {
      current = null;
      out.push(node);
    }
  }
  if (depth === 2) {
    // Number the `###` sections after their parent, in document order.
    let n = 0;
    for (const section of out) {
      if (section.tagName !== 'section' || !section.properties?.className?.includes('toc-section')) continue;
      n += 1;
      section.properties.style = `view-timeline-name: --toc-${n}`;
      const inner = { n };
      section.children = wrap(section.children, 3, inner);
      n = inner.n;
    }
  }
  return out;
}

export function rehypeTocSections() {
  return tree => {
    tree.children = wrap(tree.children, 2, { n: 0 });
  };
}
