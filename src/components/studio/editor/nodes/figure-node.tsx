'use client';

import { useState, useRef } from 'react';
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import { Image as ImageIcon, Upload, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { STUDIO_STRINGS } from '@/lib/studio/strings';

function FigureComponent({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const src = String(node.attrs.src || '');
  const alt = String(node.attrs.alt || '');
  const caption = String(node.attrs.caption || '');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isAltEmpty = !alt || alt.trim().length === 0;

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/studio/media', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || STUDIO_STRINGS.uploadErrorFailed);
      }

      const data = await res.json();
      if (!data.success || !data.url) {
        throw new Error(data.error || STUDIO_STRINGS.uploadErrorFailed);
      }

      updateAttributes({ src: data.url });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : STUDIO_STRINGS.uploadErrorFailed;
      setUploadError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <NodeViewWrapper
      className="editorial-figure my-6 p-5 rounded-2xl border border-lavender-border bg-white shadow-xs"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-lavender-border" contentEditable={false}>
        <div className="flex items-center gap-2 text-primary font-bold text-xs">
          <ImageIcon className="w-4 h-4" />
          <span>{STUDIO_STRINGS.slashFigure}</span>
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

      <div className="space-y-4" contentEditable={false}>
        {/* Image Preview or Upload Dropzone */}
        {src ? (
          <div className="space-y-2">
            <div className="relative group rounded-xl overflow-hidden bg-slate-50 border border-lavender-border flex items-center justify-center min-h-[200px] max-h-[420px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt || 'معاينة الصورة'}
                className="max-h-[400px] max-w-full object-contain mx-auto rounded-lg"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/75 hover:bg-black text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? STUDIO_STRINGS.figureUploading : STUDIO_STRINGS.figureUploadImage}</span>
              </button>
            </div>
            <input
              type="text"
              value={src}
              onChange={(e) => updateAttributes({ src: e.target.value })}
              placeholder="https://..."
              dir="ltr"
              className="w-full px-3 py-1 text-[11px] font-mono rounded-lg border border-lavender-border text-ink-secondary bg-slate-50"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-lavender-border hover:border-primary/50 rounded-xl p-8 text-center transition-colors bg-lavender-light/30">
            <ImageIcon className="w-10 h-10 text-primary/40 mx-auto mb-2" />
            <p className="text-xs font-semibold text-ink-secondary mb-3">
              اسحب وأفلت صورة هنا أو اضغط لرفع ملف (JPEG, PNG, WebP, AVIF)
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? STUDIO_STRINGS.figureUploading : STUDIO_STRINGS.figureUploadImage}</span>
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileUpload(file);
            }
          }}
        />

        {uploadError && (
          <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-200 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Mandatory Alt Text Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
              <span>{STUDIO_STRINGS.figureAltLabel}</span>
              {isAltEmpty ? (
                <span className="text-rose-600 text-[10px] font-extrabold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  إلزامي للنشر
                </span>
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </label>
          </div>
          <input
            type="text"
            value={alt}
            onChange={(e) => updateAttributes({ alt: e.target.value })}
            placeholder={STUDIO_STRINGS.figureAltPlaceholder}
            className={`w-full px-3 py-2 rounded-xl text-xs font-medium text-ink-primary transition-all ${
              isAltEmpty
                ? 'border-2 border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-200 focus:outline-hidden'
                : 'border border-lavender-border focus:ring-2 focus:ring-primary/20 focus:outline-hidden'
            }`}
          />
          {isAltEmpty && (
            <p className="mt-1 text-[11px] text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{STUDIO_STRINGS.figureAltRequiredError}</span>
            </p>
          )}
        </div>

        {/* Optional Caption Field */}
        <div>
          <label className="text-xs font-bold text-ink-primary block mb-1">
            التعليق التوضيحي (Caption)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => updateAttributes({ caption: e.target.value })}
            placeholder={STUDIO_STRINGS.figureCaptionPlaceholder}
            className="w-full px-3 py-2 rounded-xl border border-lavender-border text-xs text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const FigureNode = Node.create({
  name: 'figure',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-src') || '',
        renderHTML: (attributes) => ({
          'data-src': attributes.src,
        }),
      },
      alt: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-alt') || '',
        renderHTML: (attributes) => ({
          'data-alt': attributes.alt,
        }),
      },
      caption: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-caption') || '',
        renderHTML: (attributes) => ({
          'data-caption': attributes.caption,
        }),
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const val = element.getAttribute('data-width');
          return val ? parseInt(val, 10) : null;
        },
        renderHTML: (attributes) => ({
          'data-width': attributes.width,
        }),
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const val = element.getAttribute('data-height');
          return val ? parseInt(val, 10) : null;
        },
        renderHTML: (attributes) => ({
          'data-height': attributes.height,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure[data-type="figure"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['figure', mergeAttributes(HTMLAttributes, { 'data-type': 'figure' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureComponent);
  },
});
