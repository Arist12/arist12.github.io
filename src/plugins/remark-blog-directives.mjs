import { visit } from 'unist-util-visit';

const CALLOUTS = new Set(['note', 'aside', 'warning']);

function element(name, properties, children) {
  return { type: 'blogElement', data: { hName: name, hProperties: properties }, children };
}

export function remarkBlogDirectives() {
  return function transform(tree, file) {
    let figures = 0;

    visit(tree, (node) => {
      if (node.type !== 'containerDirective' && node.type !== 'leafDirective') return;

      if (node.name === 'figure') {
        const { src, alt = '', wide } = node.attributes ?? {};
        figures += 1;

        // The trailing paragraph is the caption; whatever precedes it is the
        // figure body, so a diagram can be authored inline inside the block.
        const body = [...node.children];
        const caption = body.at(-1)?.type === 'paragraph' ? body.pop() : null;

        const children = [];
        if (src) children.push({ type: 'image', url: src, alt, title: null });
        children.push(...body);
        if (caption) {
          children.push(
            element('figcaption', null, [
              element('span', { class: 'figure-label' }, [{ type: 'text', value: `Fig. ${figures}.` }]),
              { type: 'text', value: ' ' },
              ...caption.children,
            ]),
          );
        }

        node.data = {
          hName: 'figure',
          hProperties: { class: wide === undefined ? 'figure' : 'figure figure-wide' },
        };
        node.children = children;
        return;
      }

      if (CALLOUTS.has(node.name)) {
        if (node.type !== 'containerDirective') {
          file.fail(`":::${node.name}" must be a container directive`, node);
        }
        const [first] = node.children;
        if (first?.data?.directiveLabel) {
          first.data.hName = 'p';
          first.data.hProperties = { class: 'callout-title' };
        }
        node.data = {
          hName: 'aside',
          hProperties: { class: `callout callout-${node.name}` },
        };
      }
    });
  };
}
