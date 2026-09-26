'use client';

import { EditorContent, type Editor } from '@tiptap/react';
import { StudioBubbleMenu } from './bubble-menu';
import { StudioSlashMenu } from './slash-menu';

interface StudioVisualEditorProps {
  editor: Editor | null;
  className?: string;
  isDistractionFree?: boolean;
}

export function StudioVisualEditor({
  editor,
  className = '',
  isDistractionFree = false,
}: StudioVisualEditorProps) {
  if (!editor) {
    return (
      <div className="min-h-[460px] flex items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-lavender-border text-ink-muted text-xs">
        جارٍ تهيئة المحرر التحريري…
      </div>
    );
  }

  return (
    <div className={`relative min-h-[460px] flex flex-col ${className}`} dir="rtl">
      {/* Floating Menus */}
      <StudioBubbleMenu editor={editor} />
      <StudioSlashMenu editor={editor} />

      {/* Main Prose Editor Container */}
      <div
        className={`flex-1 rounded-2xl bg-white border border-lavender-border/60 p-7 md:p-10 transition-all ${
          isDistractionFree ? 'max-w-3xl mx-auto shadow-none border-transparent bg-background' : 'shadow-soft-xs'
        }`}
      >
        <EditorContent
          editor={editor}
          className="editorial-prose focus:outline-hidden min-h-[400px] text-ink-primary font-arabic leading-[1.95] text-base"
        />
      </div>
    </div>
  );
}
