'use client';

import { useState, useEffect, useRef } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import { Network, Code, Eye, AlertCircle, Trash2 } from 'lucide-react';
import { STUDIO_STRINGS } from '@/lib/studio/strings';

function MermaidComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const code = String(node.attrs.code || '');
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [renderError, setRenderError] = useState<string | null>(null);
  const renderIndexRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    renderIndexRef.current += 1;
    const currentRun = renderIndexRef.current;

    async function renderMermaid() {
      if (!code || code.trim().length === 0) {
        if (isMounted) {
          setSvgHtml('');
          setRenderError(null);
        }
        return;
      }

      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'loose',
          fontFamily: 'var(--font-ibm-plex-arabic), sans-serif',
        });

        const elementId = `mermaid-studio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const { svg } = await mermaid.render(elementId, code);

        if (isMounted && currentRun === renderIndexRef.current) {
          setSvgHtml(svg);
          setRenderError(null);
        }
      } catch (err: unknown) {
        if (isMounted && currentRun === renderIndexRef.current) {
          const msg = err instanceof Error ? err.message : 'خطأ في بنية كود المخطط';
          setRenderError(msg);
          setSvgHtml('');
        }
      }
    }

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [code]);

  return (
    <NodeViewWrapper
      className="editorial-mermaid my-6 p-5 rounded-2xl border border-lavender-border bg-lavender-light/30 shadow-xs"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-lavender-border" contentEditable={false}>
        <div className="flex items-center gap-2 text-primary font-bold text-xs">
          <Network className="w-4 h-4" />
          <span>{STUDIO_STRINGS.slashMermaid}</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-lavender-border text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'preview'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>المعاينة</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'code'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>الكود</span>
            </button>
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
      </div>

      <div contentEditable={false}>
        {activeTab === 'preview' ? (
          <div>
            {renderError ? (
              <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 text-xs rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-700">
                  <AlertCircle className="w-4 h-4" />
                  <span>{STUDIO_STRINGS.mermaidErrorTitle}</span>
                </div>
                <pre className="font-mono text-[11px] whitespace-pre-wrap text-rose-900 bg-rose-100/50 p-2 rounded-lg" dir="ltr">
                  {renderError}
                </pre>
                <button
                  type="button"
                  onClick={() => setActiveTab('code')}
                  className="text-[11px] underline font-bold text-rose-800"
                >
                  انقر هنا لتعديل كود المخطط ←
                </button>
              </div>
            ) : svgHtml ? (
              <div
                className="overflow-x-auto p-4 flex justify-center bg-white rounded-xl border border-lavender-border"
                dangerouslySetInnerHTML={{ __html: svgHtml }}
              />
            ) : (
              <div className="p-8 text-center text-xs text-ink-muted">
                جارٍ معالجة وتصيير الرسم البياني…
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-ink-secondary">
              <span>صيغة كود Mermaid:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    updateAttributes({
                      code: 'graph LR\n  A[المدخلات] --> B[المعالجة]\n  B --> C[المخرجات]',
                    })
                  }
                  className="underline hover:text-primary"
                >
                  انسيابي (Flowchart)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() =>
                    updateAttributes({
                      code: 'sequenceDiagram\n  autonumber\n  القارئ->>الخادم: طلب المقال\n  الخادم-->>القارئ: استجابة المشتقات',
                    })
                  }
                  className="underline hover:text-primary"
                >
                  تتابعي (Sequence)
                </button>
              </div>
            </div>
            <textarea
              rows={6}
              value={code}
              onChange={(e) => updateAttributes({ code: e.target.value })}
              dir="ltr"
              placeholder="graph TD..."
              className="w-full font-mono text-xs p-3 rounded-xl border border-lavender-border bg-[#1E1B2E] text-[#EDE9FE] focus:outline-hidden focus:ring-2 focus:ring-primary/20 leading-relaxed"
            />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const MermaidNode = Node.create({
  name: 'mermaid',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      code: {
        default: 'graph LR\n  A[المدخلات] --> B[المعالجة]\n  B --> C[المخرجات]',
        parseHTML: (element) => element.getAttribute('data-code') || '',
        renderHTML: (attributes) => ({
          'data-code': attributes.code,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="mermaid"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'mermaid' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidComponent);
  },
});
