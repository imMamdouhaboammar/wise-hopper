'use client';

import { useState } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import * as LucideIcons from 'lucide-react';
import { Sparkles, Trash2, Sliders } from 'lucide-react';

type LucideIconComponent = React.ComponentType<{
  size?: number;
  className?: string;
  'aria-hidden'?: boolean;
}>;

function toPascalCase(str: string): string {
  return str
    .replace(/^lucide:/i, '')
    .replace(/[-_]([a-z0-9])/gi, (_match, char: string) => char.toUpperCase())
    .replace(/^[a-z]/, (first: string) => first.toUpperCase());
}

function resolveIconComponent(name: string): LucideIconComponent {
  const pascalName = toPascalCase(name);
  if (pascalName in LucideIcons) {
    // SAFETY: Verified property existence on LucideIcons namespace
    const found = LucideIcons[pascalName as keyof typeof LucideIcons];
    if (found && Boolean(found)) {
      // SAFETY: Lucide export adheres to standard React component signature
      return found as LucideIconComponent;
    }
  }
  const suffixed = `${pascalName}Icon`;
  if (suffixed in LucideIcons) {
    // SAFETY: Verified property existence on LucideIcons namespace
    const found = LucideIcons[suffixed as keyof typeof LucideIcons];
    if (found && Boolean(found)) {
      // SAFETY: Lucide export adheres to standard React component signature
      return found as LucideIconComponent;
    }
  }
  return Sparkles;
}

const COMMON_QUICK_ICONS = [
  'Sparkles',
  'CheckCircle',
  'AlertCircle',
  'Info',
  'Flame',
  'BookOpen',
  'Code',
  'ArrowLeft',
  'Heart',
  'Star',
];

function IconNodeComponent({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const name = String(node.attrs.name || 'Sparkles');
  const size = Number(node.attrs.size) || 18;
  const customClass = String(node.attrs.className || '');

  const IconComp = resolveIconComponent(name);

  return (
    <NodeViewWrapper
      as="span"
      className={`editorial-icon-node inline-flex items-center align-middle mx-1 relative select-none rounded-md transition-all ${
        selected ? 'ring-2 ring-primary ring-offset-1 bg-lavender/50' : 'hover:bg-lavender/30'
      }`}
      contentEditable={false}
      dir="rtl"
    >
      <span
        onClick={() => setShowQuickMenu(!showQuickMenu)}
        className="inline-flex items-center justify-center p-1 cursor-pointer text-primary hover:text-primary-hover transition-colors"
        title={`أيقونة: ${name} (انقر للتعديل)`}
        role="img"
        aria-label={name}
      >
        <IconComp size={size} className={customClass} aria-hidden={true} />
      </span>

      {/* Floating Quick Action Popover when clicked or active */}
      {showQuickMenu && (
        <span
          className="absolute bottom-full mb-1.5 right-1/2 translate-x-1/2 z-50 flex flex-col items-center bg-white p-2 rounded-xl shadow-xl border border-lavender-border text-ink-primary whitespace-nowrap animate-in fade-in zoom-in-95 text-xs min-w-56"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="flex items-center justify-between w-full pb-1.5 mb-1.5 border-b border-lavender-border font-medium text-[11px] text-ink-secondary">
            <span className="flex items-center gap-1 font-mono text-primary font-bold">
              <Sparkles className="w-3 h-3" />
              <span>{name}</span>
            </span>
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const event = new CustomEvent('open-icon-picker', {
                    detail: {
                      currentName: name,
                      currentSize: size,
                      onSelect: (selectedName: string, selectedSize: number) => {
                        updateAttributes({ name: selectedName, size: selectedSize });
                        setShowQuickMenu(false);
                      },
                    },
                  });
                  window.dispatchEvent(event);
                }}
                className="p-1 hover:bg-lavender rounded text-primary text-[10px] font-medium flex items-center gap-0.5"
                title="تصفح جميع الأيقونات"
              >
                <Sliders className="w-3 h-3" />
                <span>المزيد</span>
              </button>
              <button
                type="button"
                onClick={deleteNode}
                className="p-1 hover:bg-rose-50 text-ink-muted hover:text-rose-600 rounded"
                title="حذف الأيقونة"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          </span>

          {/* Quick preset icons grid */}
          <span className="grid grid-cols-5 gap-1 w-full mb-2">
            {COMMON_QUICK_ICONS.map((iconName) => {
              const PresetIcon = resolveIconComponent(iconName);
              const isCurrent = iconName.toLowerCase() === name.toLowerCase();
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    updateAttributes({ name: iconName });
                    setShowQuickMenu(false);
                  }}
                  className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
                    isCurrent
                      ? 'bg-primary text-white shadow-2xs'
                      : 'hover:bg-lavender text-ink-primary'
                  }`}
                  title={iconName}
                >
                  <PresetIcon size={14} aria-hidden={true} />
                </button>
              );
            })}
          </span>

          {/* Size Selector */}
          <span className="flex items-center justify-between w-full pt-1.5 border-t border-lavender-border text-[10px]">
            <span className="text-ink-secondary">الحجم:</span>
            <span className="flex items-center gap-1">
              {[14, 18, 22, 28].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateAttributes({ size: s })}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    size === s ? 'bg-primary text-white font-bold' : 'hover:bg-lavender text-ink-secondary'
                  }`}
                >
                  {s}px
                </button>
              ))}
            </span>
          </span>
        </span>
      )}
    </NodeViewWrapper>
  );
}

export const IconNode = Node.create({
  name: 'icon',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      name: {
        default: 'Sparkles',
        parseHTML: (element) =>
          element.getAttribute('data-name') ||
          element.getAttribute('data-icon') ||
          element.getAttribute('name') ||
          'Sparkles',
        renderHTML: (attributes) => ({
          'data-name': attributes.name,
          'data-icon': attributes.name,
        }),
      },
      size: {
        default: 18,
        parseHTML: (element) => {
          const val = element.getAttribute('data-size') || element.getAttribute('size');
          return val ? parseInt(val, 10) : 18;
        },
        renderHTML: (attributes) => ({
          'data-size': attributes.size,
        }),
      },
      className: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-custom-class') || '',
        renderHTML: (attributes) => ({
          'data-custom-class': attributes.className || undefined,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="editorial-icon"]',
      },
      {
        tag: 'span.editorial-icon',
      },
      {
        tag: 'Icon',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'editorial-icon',
        class: 'editorial-icon inline-flex items-center align-middle',
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(IconNodeComponent);
  },
});
