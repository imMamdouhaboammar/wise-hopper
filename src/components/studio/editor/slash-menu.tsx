'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Code,
  Minus,
  AlertCircle,
  Quote as PullQuoteIcon,
  Image as ImageIcon,
  Network,
  Sparkles,
} from 'lucide-react';
import { STUDIO_STRINGS } from '@/lib/studio/strings';

interface SlashItem {
  id: string;
  title: string;
  subtitle: string;
  aliases: string[];
  icon: typeof Heading2;
  action: (editor: Editor) => void;
}

const SLASH_ITEMS: SlashItem[] = [
  {
    id: 'heading-2',
    title: STUDIO_STRINGS.slashHeading2,
    subtitle: 'عنوان رئيسي فرعي للمقال',
    aliases: ['h2', 'عنوان 2', 'heading 2', 'عنوان'],
    icon: Heading2,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'heading-3',
    title: STUDIO_STRINGS.slashHeading3,
    subtitle: 'عنوان فرعي لأقسام المحتوى',
    aliases: ['h3', 'عنوان 3', 'heading 3'],
    icon: Heading3,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'heading-4',
    title: STUDIO_STRINGS.slashHeading4,
    subtitle: 'عنوان أصغر للتفاصيل',
    aliases: ['h4', 'عنوان 4', 'heading 4'],
    icon: Heading4,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 4 }).run(),
  },
  {
    id: 'paragraph',
    title: 'فقرة نصية',
    subtitle: 'نص عادي مستمر',
    aliases: ['p', 'text', 'فقرة', 'نص'],
    icon: Pilcrow,
    action: (editor) => editor.chain().focus().setParagraph().run(),
  },
  {
    id: 'bullet-list',
    title: STUDIO_STRINGS.slashBulletList,
    subtitle: 'قائمة نقاط غير مرتبة',
    aliases: ['ul', 'bullet', 'نقط', 'نقاط', 'قائمة'],
    icon: List,
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'ordered-list',
    title: STUDIO_STRINGS.slashOrderedList,
    subtitle: 'قائمة أرقام متسلسلة',
    aliases: ['ol', 'number', 'ارقام', 'رقم', 'ترقيم'],
    icon: ListOrdered,
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'blockquote',
    title: STUDIO_STRINGS.slashBlockquote,
    subtitle: 'اقتباس مقالي منسق',
    aliases: ['quote', 'اقتباس', 'نقل'],
    icon: Quote,
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'table',
    title: STUDIO_STRINGS.slashTable,
    subtitle: 'جدول بيانات 3 أعمدة وصفين',
    aliases: ['table', 'جدول', 'بيانات'],
    icon: TableIcon,
    action: (editor) =>
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  {
    id: 'code-block',
    title: STUDIO_STRINGS.slashCodeBlock,
    subtitle: 'كتلة نصية للأكواد البرمجية',
    aliases: ['code', 'كود', 'شفرة', 'برمجة'],
    icon: Code,
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'horizontal-rule',
    title: STUDIO_STRINGS.slashHorizontalRule,
    subtitle: 'خط فاصل بين أقسام المقال',
    aliases: ['hr', 'divider', 'فاصل', 'خط'],
    icon: Minus,
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
  {
    id: 'callout',
    title: STUDIO_STRINGS.slashCallout,
    subtitle: 'صندوق تنبيه أو فائدة أو تحذير',
    aliases: ['callout', 'تنبيه', 'ملاحظة', 'تحذير', 'فائدة'],
    icon: AlertCircle,
    action: (editor) =>
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'callout',
          attrs: { type: 'info', title: 'ملاحظة تحريرية' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'نص التنبيه هنا…' }] }],
        })
        .run(),
  },
  {
    id: 'pull-quote',
    title: STUDIO_STRINGS.slashPullQuote,
    subtitle: 'اقتباس عريض لافت للانتباه',
    aliases: ['pullquote', 'اقتباس بارز', 'اقتباس عريض'],
    icon: PullQuoteIcon,
    action: (editor) =>
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'pullQuote',
          attrs: { quote: 'اقتباس بارز يشد انتباه القارئ…', author: 'الكاتب' },
        })
        .run(),
  },
  {
    id: 'figure',
    title: STUDIO_STRINGS.slashFigure,
    subtitle: 'صورة مع نص بديل إلزامي وتعليق',
    aliases: ['figure', 'صورة', 'image', 'شكل'],
    icon: ImageIcon,
    action: (editor) =>
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'figure',
          attrs: { src: '', alt: '', caption: '' },
        })
        .run(),
  },
  {
    id: 'mermaid',
    title: STUDIO_STRINGS.slashMermaid,
    subtitle: 'مخطط بياني انسيابي أو تتابعي',
    aliases: ['mermaid', 'رسم', 'مخطط', 'diagram'],
    icon: Network,
    action: (editor) =>
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'mermaid',
          attrs: {
            code: 'graph LR\n  A[المدخلات] --> B[المعالجة]\n  B --> C[المخرجات]',
          },
        })
        .run(),
  },
  {
    id: 'icon',
    title: 'أيقونة أو رمز تحريري (Icon)',
    subtitle: 'إدراج رمز تعبيري أو ناقل متجهي من مكتبة Lucide',
    aliases: ['icon', 'ايقونة', 'أيقونة', 'رمز', 'svg', 'sparkles', 'شعار'],
    icon: Sparkles,
    action: (editor) => {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'icon',
          attrs: { name: 'Sparkles', size: 18 },
        })
        .run();
    },
  },
];

interface SlashMenuProps {
  editor: Editor | null;
}

export function StudioSlashMenu({ editor }: SlashMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const triggerRangeRef = useRef<{ from: number; to: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Filter items matching query
  const filteredItems = useMemo(() => {
    if (!query) return SLASH_ITEMS;
    const cleanQ = query.trim().toLowerCase();
    return SLASH_ITEMS.filter((item) => {
      if (item.title.toLowerCase().includes(cleanQ)) return true;
      if (item.subtitle.toLowerCase().includes(cleanQ)) return true;
      return item.aliases.some((alias) => alias.toLowerCase().includes(cleanQ));
    });
  }, [query]);

  // Keep selected index bounded
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const executeItem = (item: SlashItem) => {
    if (!editor) return;

    if (triggerRangeRef.current) {
      editor
        .chain()
        .focus()
        .deleteRange(triggerRangeRef.current)
        .run();
    }

    item.action(editor);
    setIsOpen(false);
    setQuery('');
    triggerRangeRef.current = null;
  };

  // Keyboard navigation listener while open
  useEffect(() => {
    if (!isOpen || !editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          executeItem(selected);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, editor, filteredItems, selectedIndex]);

  // Listen to editor selection and text changes to detect slash command
  useEffect(() => {
    if (!editor) return;

    const updateHandler = () => {
      const { selection, doc } = editor.state;
      const { from, empty } = selection;
      if (!empty) {
        setIsOpen(false);
        return;
      }

      // Check current text block before cursor
      const $pos = doc.resolve(from);
      const textBefore = $pos.parent.textBetween(0, $pos.parentOffset, undefined, '\ufffc');

      const slashIndex = textBefore.lastIndexOf('/');
      if (slashIndex === -1) {
        setIsOpen(false);
        return;
      }

      // Check if slash was typed at start of block or after a space
      const isStart = slashIndex === 0;
      const prevChar = slashIndex > 0 ? textBefore.charAt(slashIndex - 1) : '';
      const isPrecededByWhitespace = prevChar === ' ' || prevChar === '\n' || prevChar === '\t';

      if (!isStart && !isPrecededByWhitespace) {
        setIsOpen(false);
        return;
      }

      const q = textBefore.slice(slashIndex + 1);
      // If query contains space or newline, dismiss slash menu
      if (q.includes(' ') || q.includes('\n')) {
        setIsOpen(false);
        return;
      }

      const slashPos = from - q.length - 1;
      triggerRangeRef.current = { from: slashPos, to: from };
      setQuery(q);

      try {
        const coords = editor.view.coordsAtPos(from);
        const editorBounds = editor.view.dom.getBoundingClientRect();
        setPosition({
          x: Math.min(Math.max(coords.left, editorBounds.left), editorBounds.right - 300),
          y: coords.bottom + 8,
        });
        setIsOpen(true);
      } catch {
        setIsOpen(false);
      }
    };

    editor.on('selectionUpdate', updateHandler);
    editor.on('update', updateHandler);

    return () => {
      editor.off('selectionUpdate', updateHandler);
      editor.off('update', updateHandler);
    };
  }, [editor]);

  if (!isOpen || !editor || !position || filteredItems.length === 0) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxHeight: '340px',
      }}
      className="w-72 bg-white/95 backdrop-blur-md rounded-2xl border border-lavender-border shadow-2xl overflow-y-auto p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
      dir="rtl"
    >
      <div className="px-3 py-1.5 text-[11px] font-bold text-ink-secondary border-b border-lavender-border/50 mb-1 flex items-center justify-between">
        <span>العناصر التحريرية</span>
        {query && <span className="font-mono text-primary text-[10px]">/{query}</span>}
      </div>

      <div className="space-y-0.5">
        {filteredItems.map((item, idx) => {
          const Icon = item.icon;
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => executeItem(item)}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-right transition-colors ${
                isSelected
                  ? 'bg-lavender text-primary font-bold shadow-2xs'
                  : 'text-ink-primary hover:bg-slate-50'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg ${
                  isSelected ? 'bg-white text-primary shadow-2xs' : 'bg-slate-100 text-ink-secondary'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs block leading-tight truncate">{item.title}</span>
                <span className="text-[10px] text-ink-secondary font-normal block leading-tight truncate">
                  {item.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
