import { Graphviz } from '@hpcc-js/wasm-graphviz';
import { visit } from 'unist-util-visit';

const LANGUAGES = new Set(['dot', 'graphviz']);

// Graphviz computes label boxes from font metrics, so the diagram must be laid
// out with a font the browser can also resolve. Helvetica metrics are built in
// and close enough to the Inter stack the stylesheet maps them onto.
const DEFAULTS = [
  'graph [bgcolor="transparent" fontname="Helvetica" fontsize=13];',
  'node [fontname="Helvetica" fontsize=13];',
  'edge [fontname="Helvetica" fontsize=12];',
].join('\n  ');

let graphviz;

// Astro's content loader swallows per-file render errors and still emits the
// page, so a bad diagram would otherwise deploy as a silently empty article.
// The integration below turns those into a failed build.
const failures = [];

export function graphvizBuildGuard() {
  return {
    name: 'graphviz-build-guard',
    hooks: {
      'astro:build:done': () => {
        if (failures.length === 0) return;
        throw new Error(`Diagrams failed to render:\n  ${failures.join('\n  ')}`);
      },
    },
  };
}

function withDefaults(source) {
  if (/fontname/i.test(source)) return source;
  return source.replace(/\{/, `{\n  ${DEFAULTS}`);
}

function clean(svg) {
  // Graphviz lays out in points. Keeping the natural width as a ceiling lets the
  // diagram shrink on narrow screens without being upscaled on wide ones.
  const points = svg.match(/<svg width="([\d.]+)pt"/);
  const ceiling = points ? ` style="max-width:${Math.round(Number(points[1]) * (4 / 3))}px"` : '';
  return svg
    .replace(/<\?xml[\s\S]*?\?>/, '')
    .replace(/<!DOCTYPE[\s\S]*?>/, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<svg width="[^"]*" height="[^"]*"/, '<svg')
    .replace(/<svg/, `<svg class="graphviz" role="img" preserveAspectRatio="xMidYMid meet"${ceiling}`)
    .trim();
}

export function remarkGraphviz() {
  return async function transform(tree, file) {
    const targets = [];
    visit(tree, 'code', (node, index, parent) => {
      if (parent && typeof index === 'number' && LANGUAGES.has(node.lang)) {
        targets.push({ node, index, parent });
      }
    });
    if (targets.length === 0) return;

    graphviz ??= await Graphviz.load();

    for (const { node, index, parent } of targets) {
      let svg;
      try {
        svg = graphviz.dot(withDefaults(node.value));
      } catch (error) {
        const message = `Invalid DOT diagram in ${file.path ?? 'markdown'}: ${error.message}`;
        failures.push(message);
        throw new Error(message);
      }
      parent.children[index] = {
        type: 'html',
        value: `<div class="diagram">${clean(svg)}</div>`,
      };
    }
  };
}
