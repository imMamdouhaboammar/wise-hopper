'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import { Quote, Trash2 } from 'lucide-react';
import { STUDIO_STRINGS } from '@/lib/studio/strings';

function PullQuoteComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const quote = String(node.attrs.quote || '');
  const author = String(node.attrs.author || '');

  return (
    <NodeViewWrapper
      className="editorial-pullquote my-6 p-5 rounded-2xl border-r-4 border-primary bg-lavender-light/40 border border-lavender-border/50 shadow-xs relative"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-black/5" contentEditable={false}>
        <div className="flex items-center gap-2 text-primary font-bold text-xs">
          <Quote className="w-4 h-4 rotate-180" />
          <span>{STUDIO_STRINGS.slashPullQuote}</span>
        </div>

        <button
          type="button"
          onClick={deleteNode}
          className="p-1 text-ink-muted hover:text-rose-600 rounded-md transition-colors"
          title={STUDIO_STRINGS.delete}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-3" contentEditable={false}>
        <textarea
          rows={2}
          value={quote}
          onChange={(e) => updateAttributes({ quote: e.target.value })}
          placeholder={STUDIO_STRINGS.pullQuoteQuotePlaceholder}
          className="w-full bg-white/70 p-3 rounded-xl border border-lavender-border text-base font-bold text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20 leading-relaxed resize-y"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-muted font-medium">—</span>
          <input
            type="text"
            value={author}
            onChange={(e) => updateAttributes({ author: e.target.value })}
            placeholder={STUDIO_STRINGS.pullQuoteAuthorPlaceholder}
            className="w-64 bg-white/70 px-3 py-1.5 rounded-lg border border-lavender-border text-xs font-semibold text-ink-secondary placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const PullQuoteNode = Node.create({
  name: 'pullQuote',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      quote: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-quote') || '',
        renderHTML: (attributes) => ({
          'data-quote': attributes.quote,
        }),
      },
      author: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-author') || '',
        renderHTML: (attributes) => ({
          'data-author': attributes.author,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="pull-quote"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'pull-quote' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PullQuoteComponent);
  },
});
