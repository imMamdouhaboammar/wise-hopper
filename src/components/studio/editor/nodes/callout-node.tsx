'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import { Info, AlertTriangle, Lightbulb, Trash2 } from 'lucide-react';
import { STUDIO_STRINGS } from '@/lib/studio/strings';

type CalloutType = 'info' | 'warning' | 'tip';

function CalloutComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const currentType: CalloutType =
    node.attrs.type === 'warning' || node.attrs.type === 'tip'
      ? node.attrs.type
      : 'info';
  const title = String(node.attrs.title || '');

  const typeConfig = {
    info: {
      label: STUDIO_STRINGS.calloutTypeInfo,
      bgClass: 'bg-lavender-light/70',
      borderClass: 'border-primary',
      textClass: 'text-primary',
      icon: Info,
    },
    warning: {
      label: STUDIO_STRINGS.calloutTypeWarning,
      bgClass: 'bg-amber-50/80',
      borderClass: 'border-amber-500',
      textClass: 'text-amber-700',
      icon: AlertTriangle,
    },
    tip: {
      label: STUDIO_STRINGS.calloutTypeTip,
      bgClass: 'bg-emerald-50/80',
      borderClass: 'border-emerald-500',
      textClass: 'text-emerald-700',
      icon: Lightbulb,
    },
  } satisfies Record<
    CalloutType,
    { label: string; bgClass: string; borderClass: string; textClass: string; icon: typeof Info }
  >;

  const currentCfg = typeConfig[currentType];
  const IconComponent = currentCfg.icon;

  return (
    <NodeViewWrapper
      className={`my-5 p-4 rounded-xl border-r-4 ${currentCfg.borderClass} ${currentCfg.bgClass} border border-lavender-border/50 shadow-xs transition-colors`}
      dir="rtl"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-black/5" contentEditable={false}>
        <div className="flex items-center gap-2">
          <IconComponent className={`w-4 h-4 ${currentCfg.textClass}`} />
          <div className="flex items-center gap-1 bg-white/80 p-0.5 rounded-lg border border-lavender-border">
            {(['info', 'warning', 'tip'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => updateAttributes({ type: t })}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-colors ${
                  currentType === t
                    ? `${typeConfig[t].bgClass} ${typeConfig[t].textClass} shadow-2xs font-extrabold`
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {typeConfig[t].label}
              </button>
            ))}
          </div>
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

      <div className="mb-2" contentEditable={false}>
        <input
          type="text"
          value={title}
          onChange={(e) => updateAttributes({ title: e.target.value })}
          placeholder={STUDIO_STRINGS.calloutTitlePlaceholder}
          className="w-full bg-transparent text-sm font-bold text-ink-primary placeholder:text-ink-muted focus:outline-hidden"
        />
      </div>

      <NodeViewContent className="editorial-callout-body text-sm text-ink-primary leading-relaxed outline-hidden" />
    </NodeViewWrapper>
  );
}

export const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      type: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-callout-type') || 'info',
        renderHTML: (attributes) => ({
          'data-callout-type': attributes.type,
        }),
      },
      title: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-title') || '',
        renderHTML: (attributes) => ({
          'data-title': attributes.title,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'callout' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent);
  },
});
