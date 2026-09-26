'use client';

import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link2,
  Unlink,
  Heading2,
  Heading3,
  Quote,
  Check,
  X,
} from 'lucide-react';
import { STUDIO_STRINGS } from '@/lib/studio/strings';

interface StudioBubbleMenuProps {
  editor: Editor | null;
}

export function StudioBubbleMenu({ editor }: StudioBubbleMenuProps) {
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  if (!editor) return null;

  const handleOpenLinkInput = () => {
    const existingHref = editor.getAttributes('link').href || '';
    setLinkUrl(existingHref);
    setIsLinkInputOpen(true);
  };

  const handleApplyLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl.trim() }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setIsLinkInputOpen(false);
    setLinkUrl('');
  };

  const handleRemoveLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setIsLinkInputOpen(false);
    setLinkUrl('');
  };

  return (
    <BubbleMenu
      editor={editor}
      className="bg-white/95 backdrop-blur-md rounded-2xl border border-lavender-border shadow-xl p-1.5 flex items-center gap-1 z-40 transition-all text-xs"
    >
      {isLinkInputOpen ? (
        <div className="flex items-center gap-1 p-1" dir="ltr">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleApplyLink();
              } else if (e.key === 'Escape') {
                setIsLinkInputOpen(false);
              }
            }}
            placeholder="https://example.com"
            className="w-48 px-2 py-1 text-xs rounded-lg border border-lavender-border focus:outline-hidden focus:ring-1 focus:ring-primary font-mono"
            autoFocus
          />
          <button
            type="button"
            onClick={handleApplyLink}
            className="p-1 rounded-md bg-primary text-white hover:bg-primary-hover"
            title="تطبيق الرابط"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsLinkInputOpen(false)}
            className="p-1 rounded-md text-ink-muted hover:text-ink-primary"
            title="إلغاء"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          {/* Format Marks */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('bold')
                ? 'bg-lavender text-primary font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-slate-100'
            }`}
            title={STUDIO_STRINGS.bold}
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('italic')
                ? 'bg-lavender text-primary font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-slate-100'
            }`}
            title={STUDIO_STRINGS.italic}
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('strike')
                ? 'bg-lavender text-primary font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-slate-100'
            }`}
            title={STUDIO_STRINGS.strike}
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('code')
                ? 'bg-lavender text-primary font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-slate-100'
            }`}
            title={STUDIO_STRINGS.code}
          >
            <Code className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-lavender-border my-auto" />

          {/* Link Button */}
          <button
            type="button"
            onClick={handleOpenLinkInput}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('link')
                ? 'bg-lavender text-primary font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-slate-100'
            }`}
            title={STUDIO_STRINGS.link}
          >
            <Link2 className="w-4 h-4" />
          </button>

          {editor.isActive('link') && (
            <button
              type="button"
              onClick={handleRemoveLink}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
              title={STUDIO_STRINGS.unlink}
            >
              <Unlink className="w-4 h-4" />
            </button>
          )}

          <span className="w-px h-4 bg-lavender-border my-auto" />

          {/* Turn into: Heading 2, Heading 3, Blockquote */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-lavender text-primary font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-slate-100'
            }`}
            title={STUDIO_STRINGS.slashHeading2}
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-lavender text-primary font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-slate-100'
            }`}
            title={STUDIO_STRINGS.slashHeading3}
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('blockquote')
                ? 'bg-lavender text-primary font-bold'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-slate-100'
            }`}
            title={STUDIO_STRINGS.slashBlockquote}
          >
            <Quote className="w-4 h-4" />
          </button>
        </>
      )}
    </BubbleMenu>
  );
}
