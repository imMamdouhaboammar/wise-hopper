'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';

function FootnoteDefinitionComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const identifier = String(node.attrs.identifier || '1');

  return (
    <NodeViewWrapper
      className="editorial-footnote my-4 p-3 rounded-xl border border-lavender-border bg-slate-50 text-xs"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-2 mb-2 pb-1 border-b border-black/5" contentEditable={false}>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-primary">[{`^${identifier}`}]</span>
          <span className="text-[11px] text-ink-secondary">حاشية سفلية:</span>
          <input
            type="text"
            value={identifier}
            onChange={(e) => updateAttributes({ identifier: e.target.value })}
            className="w-16 px-1.5 py-0.5 text-[11px] font-mono rounded border border-lavender-border bg-white"
          />
        </div>
        <button
          type="button"
          onClick={deleteNode}
          className="text-ink-muted hover:text-rose-600 text-xs"
        >
          ✕
        </button>
      </div>
      <NodeViewContent className="text-ink-primary font-arabic leading-relaxed outline-hidden" />
    </NodeViewWrapper>
  );
}

export const FootnoteDefinitionNode = Node.create({
  name: 'footnoteDefinition',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      identifier: {
        default: '1',
        parseHTML: (element) => element.getAttribute('data-identifier') || '1',
        renderHTML: (attributes) => ({
          'data-identifier': attributes.identifier,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="footnote-definition"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'footnote-definition' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FootnoteDefinitionComponent);
  },
});
