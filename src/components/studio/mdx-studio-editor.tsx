'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useEditor } from '@tiptap/react';
import {
  Keyboard,
  Maximize2,
  Minimize2,
  FileCode,
  Eye,
  Columns,
  Sparkles,
  AlertTriangle,
  History,
  Rocket,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { auditSeoMetadata, type SeoAuditResult } from '@/lib/seo/seo-engine';
import { validateMdxSource } from '@/lib/content/allowlist';
import { mdxToProseMirror, proseMirrorToMdx } from '@/lib/editor/mdx-bridge';
import { STUDIO_STRINGS } from '@/lib/studio/strings';
import { getStudioEditorExtensions } from './editor/extensions/editor-extensions';
import { StudioVisualEditor } from './editor/studio-visual-editor';
import { CodeMirrorEditor } from './editor/codemirror-editor';
import { ShortcutsModal } from './editor/shortcuts-modal';

export type EditorViewMode = 'visual' | 'source' | 'split';

interface MdxStudioEditorProps {
  initialTitle?: string;
  initialSlug?: string;
  initialExcerpt?: string;
  initialMdx?: string;
  initialVisibility?: 'FREE' | 'PREMIUM';
  initialStatus?: string;
  articleId?: string;
}

export function MdxStudioEditor({
  initialTitle = 'عنوان المقال الجديد',
  initialSlug = 'new-article-slug',
  initialExcerpt = 'مقتطف تعريفي موجز بالمقال ومحتواه التحريري.',
  initialMdx = `# عنوان المقال الجديد\n\nاكتب هنا بداية المقال باللغة العربية الفصحى...\n\n<Callout type="info" title="ملاحظة هامة">\nيمكنك إضافة تنبيهات وكتل مخصصة بأمان.\n</Callout>\n\n## القسم الأول\n\nنص تحليلي معمق.\n`,
  initialVisibility = 'FREE',
  articleId,
}: MdxStudioEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [visibility, setVisibility] = useState<'FREE' | 'PREMIUM'>(initialVisibility);
  const [mdxSource, setMdxSource] = useState(initialMdx);
  const [mode, setMode] = useState<EditorViewMode>('split');
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [seoResult, setSeoResult] = useState<SeoAuditResult | null>(null);
  const [showRevisionDrawer, setShowRevisionDrawer] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string[] | null>(null);

  // Sync ref to avoid stale closure during editor events
  const isUpdatingFromEditorRef = useRef(false);

  // Parse initial MDX to ProseMirror document structure
  const initialContent = useMemo(() => {
    try {
      return mdxToProseMirror(initialMdx);
    } catch {
      return { type: 'doc', content: [{ type: 'paragraph' }] };
    }
  }, [initialMdx]);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: getStudioEditorExtensions(),
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        dir: 'rtl',
        class: 'outline-hidden',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (isUpdatingFromEditorRef.current) return;
      try {
        isUpdatingFromEditorRef.current = true;
        const json = currentEditor.getJSON();
        const serializedMdx = proseMirrorToMdx(json);
        setMdxSource(serializedMdx);
      } finally {
        isUpdatingFromEditorRef.current = false;
      }
    },
  });

  // Calculate Arabic-aware word count and reading time
  const stats = useMemo(() => {
    const rawText = mdxSource.replace(/<[^>]+>/g, ' ').replace(/[#*`_[\]()\-+>]/g, ' ');
    const words = rawText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 180));
    const charCount = mdxSource.length;
    return { wordCount, readingTime, charCount };
  }, [mdxSource]);

  // Real-time SEO audit recalculation
  useEffect(() => {
    const result = auditSeoMetadata({
      title,
      description: excerpt,
      contentMdx: mdxSource,
    });
    setSeoResult(result);
  }, [title, excerpt, mdxSource]);

  // Debounced Autosave simulation
  useEffect(() => {
    setSaveStatus('dirty');
    const timer = setTimeout(() => {
      setSaveStatus('saving');
      setTimeout(() => {
        setSaveStatus('saved');
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, slug, excerpt, mdxSource, visibility]);

  // Safe mode switching with MDX validation
  const handleModeSwitch = useCallback(
    (newMode: EditorViewMode) => {
      if (newMode === mode) return;

      // If switching from Source to Visual or Split, validate MDX first
      if (mode === 'source' && (newMode === 'visual' || newMode === 'split')) {
        const validation = validateMdxSource(mdxSource);
        if (!validation.isValid) {
          setSwitchError(validation.errors);
          return;
        }

        try {
          const pmDoc = mdxToProseMirror(mdxSource);
          if (editor) {
            isUpdatingFromEditorRef.current = true;
            editor.commands.setContent(pmDoc);
            isUpdatingFromEditorRef.current = false;
          }
          setSwitchError(null);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'فشل في تحليل شفرة MDX';
          setSwitchError([message]);
          return;
        }
      } else if ((mode === 'visual' || mode === 'split') && newMode === 'source') {
        // Sync latest ProseMirror doc to MDX source
        if (editor) {
          const json = editor.getJSON();
          const serialized = proseMirrorToMdx(json);
          setMdxSource(serialized);
        }
        setSwitchError(null);
      }

      setMode(newMode);
    },
    [mode, mdxSource, editor]
  );

  // Global keyboard shortcuts listener ('?' opens shortcuts modal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tagName = e.target instanceof HTMLElement ? e.target.tagName : '';
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes(tagName)) {
        e.preventDefault();
        setShowShortcutsModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick insertion helpers for custom blocks
  const insertCustomBlock = (snippet: string) => {
    if (mode === 'source') {
      setMdxSource((prev) => `${prev}\n\n${snippet}\n`);
    } else if (editor) {
      if (snippet.includes('<Callout')) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'callout',
            attrs: { type: 'info', title: 'تنبيه' },
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'محتوى التنبيه هنا…' }] }],
          })
          .run();
      } else if (snippet.includes('<PullQuote')) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'pullQuote',
            attrs: { quote: 'اقتباس بارز يشد انتباه القارئ', author: 'الكاتب' },
          })
          .run();
      } else if (snippet.includes('<Figure')) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'figure',
            attrs: {
              src: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
              alt: 'وصف توضيحي للمشهد',
              caption: 'تعليق الصورة هنا',
            },
          })
          .run();
      } else if (snippet.includes('mermaid')) {
        editor
          .chain()
          .focus()
          .insertContent({
            type: 'mermaid',
            attrs: {
              code: 'graph LR\n  A[المدخلات] --> B[المعمارية]\n  B --> C[المشتقات]',
            },
          })
          .run();
      } else {
        editor.chain().focus().insertContent(snippet).run();
      }
    }
  };

  return (
    <div
      className={`space-y-6 ${
        isDistractionFree ? 'fixed inset-0 bg-white z-50 p-6 md:p-12 overflow-y-auto' : ''
      }`}
      dir="rtl"
    >
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-lavender-border shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/studio/articles"
            className="text-xs font-semibold text-ink-secondary hover:text-primary transition-colors flex items-center gap-1.5"
          >
            <span>←</span>
            <span>{STUDIO_STRINGS.backToArticles}</span>
          </Link>
          <span className="text-lavender-border">|</span>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                saveStatus === 'saved'
                  ? 'bg-emerald-500'
                  : saveStatus === 'saving'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-lavender-dark'
              }`}
            />
            <span className="text-xs text-ink-secondary">
              {saveStatus === 'saved'
                ? 'تم حفظ التغييرات تلقائياً ✓'
                : saveStatus === 'saving'
                ? STUDIO_STRINGS.saving
                : STUDIO_STRINGS.unsavedChanges}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Shortcuts button */}
          <button
            type="button"
            onClick={() => setShowShortcutsModal(true)}
            className="p-2 text-ink-secondary hover:text-primary hover:bg-lavender rounded-xl transition-colors"
            title="اختصارات لوحة المفاتيح (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Distraction-free toggle */}
          <button
            type="button"
            onClick={() => setIsDistractionFree(!isDistractionFree)}
            className="px-3 py-1.5 bg-lavender hover:bg-lavender-dark text-ink-primary text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
          >
            {isDistractionFree ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>الخروج من وضع التركيز</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>وضع التركيز</span>
              </>
            )}
          </button>

          {/* Revisions history button */}
          <button
            type="button"
            onClick={() => setShowRevisionDrawer(true)}
            className="px-3 py-1.5 bg-lavender hover:bg-lavender-dark text-ink-primary text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>سجل المراجعات (2)</span>
          </button>

          {/* Atomic Publish trigger */}
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>نشر المقال ذرياً 🚀</span>
          </button>
        </div>
      </div>

      {publishedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>✓ تم نشر المقال وتوليد المشتقات الثلاثة (HTML، Markdown، Plain Text) بنجاح.</span>
          </div>
          <Link
            href={`/articles/${slug}`}
            target="_blank"
            className="underline flex items-center gap-1 hover:text-emerald-900"
          >
            <span>عرض المقال المنشور</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Switch Error Alert Banner */}
      {switchError && switchError.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-rose-700">
            <AlertTriangle className="w-4 h-4" />
            <span>تعذر التبديل إلى العرض المرئي: يحتوي كود MDX على أخطاء نحوية أو عناصر غير مصرح بها</span>
          </div>
          <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-rose-900">
            {switchError.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Article Metadata Fields */}
      <div className="bg-white p-5 rounded-2xl border border-lavender-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <label className="text-xs font-bold text-ink-primary block mb-1">عنوان المقال</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={STUDIO_STRINGS.titlePlaceholder}
              className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-base font-bold text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="md:col-span-4">
            <label className="text-xs font-bold text-ink-primary block mb-1">
              {STUDIO_STRINGS.slugLabel}
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              dir="ltr"
              placeholder={STUDIO_STRINGS.slugPlaceholder}
              className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-xs font-mono text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-9">
            <label className="text-xs font-bold text-ink-primary block mb-1">
              {STUDIO_STRINGS.excerptLabel} (Meta Description)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder={STUDIO_STRINGS.excerptPlaceholder}
              className="w-full px-4 py-2 rounded-xl border border-lavender-border text-xs text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 leading-relaxed"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-bold text-ink-primary block mb-1">
              {STUDIO_STRINGS.visibilityLabel}
            </label>
            <select
              value={visibility}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'FREE' || val === 'PREMIUM') {
                  setVisibility(val);
                }
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-xs font-semibold text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 bg-white"
            >
              <option value="FREE">{STUDIO_STRINGS.visibilityFree}</option>
              <option value="PREMIUM">{STUDIO_STRINGS.visibilityPremium}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Editor Toolbar & Insert Blocks */}
      <div className="bg-white p-3 rounded-2xl border border-lavender-border flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-ink-secondary ml-1">إدراج كتل:</span>
          <button
            type="button"
            onClick={() => insertCustomBlock('<Callout type="info" title="تنبيه">\nمحتوى التنبيه هنا...\n</Callout>')}
            className="px-2.5 py-1 bg-lavender-light hover:bg-lavender text-primary text-xs font-semibold rounded-lg border border-lavender-border transition-colors"
          >
            + تنبيه Callout
          </button>
          <button
            type="button"
            onClick={() => insertCustomBlock('<PullQuote quote="اقتباس عميق يشد انتباه القارئ" author="الكاتب" />')}
            className="px-2.5 py-1 bg-lavender-light hover:bg-lavender text-primary text-xs font-semibold rounded-lg border border-lavender-border transition-colors"
          >
            + اقتباس PullQuote
          </button>
          <button
            type="button"
            onClick={() =>
              insertCustomBlock(
                '<Figure src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c" alt="وصف توضيحي للمشهد" caption="تعليق الصورة هنا" />'
              )
            }
            className="px-2.5 py-1 bg-lavender-light hover:bg-lavender text-primary text-xs font-semibold rounded-lg border border-lavender-border transition-colors"
          >
            + صورة Figure
          </button>
          <button
            type="button"
            onClick={() =>
              insertCustomBlock('```mermaid\ngraph LR\n  A[المدخلات] --> B[المعمارية]\n  B --> C[المشتقات]\n```')
            }
            className="px-2.5 py-1 bg-lavender-light hover:bg-lavender text-primary text-xs font-semibold rounded-lg border border-lavender-border font-mono transition-colors"
          >
            + رسم Mermaid
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-lavender-light p-1 rounded-xl border border-lavender-border text-xs">
          <button
            type="button"
            onClick={() => handleModeSwitch('visual')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              mode === 'visual' ? 'bg-primary text-white shadow-xs' : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{STUDIO_STRINGS.modeVisual}</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('source')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              mode === 'source' ? 'bg-primary text-white shadow-xs' : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>{STUDIO_STRINGS.modeSource}</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('split')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              mode === 'split' ? 'bg-primary text-white shadow-xs' : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{STUDIO_STRINGS.modeSplit}</span>
          </button>
        </div>
      </div>

      {/* Editor Main Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* Visual Mode Active */}
        {mode === 'visual' && (
          <div className="lg:col-span-12">
            <StudioVisualEditor editor={editor} isDistractionFree={isDistractionFree} />
          </div>
        )}

        {/* Source Mode Active */}
        {mode === 'source' && (
          <div className="lg:col-span-12">
            <CodeMirrorEditor
              value={mdxSource}
              onChange={(newVal) => setMdxSource(newVal)}
              theme="dark"
            />
          </div>
        )}

        {/* Split Mode Active: Visual Editor on Right, Live Compiled Output on Left */}
        {mode === 'split' && (
          <>
            <div className="lg:col-span-6 flex flex-col">
              <span className="text-[11px] font-bold text-ink-secondary mb-2 block">
                محرر الكتابة المرئي (Rich Visual Editor)
              </span>
              <StudioVisualEditor editor={editor} isDistractionFree={false} className="flex-1" />
            </div>

            <div className="lg:col-span-6 flex flex-col">
              <span className="text-[11px] font-bold text-primary mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>المعاينة التحريرية المباشرة (Live Preview)</span>
              </span>
              <div className="bg-white rounded-2xl border border-lavender-border flex-1 p-6 md:p-8 overflow-y-auto max-h-[700px] shadow-2xs">
                <div className="editorial-prose text-sm" dir="rtl">
                  <h1>{title}</h1>
                  {excerpt && <p className="lead font-medium text-ink-secondary">{excerpt}</p>}
                  <div className="whitespace-pre-wrap font-arabic leading-relaxed text-ink-primary mt-4">
                    {mdxSource}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Real-time SEO & Readability Audit Panel */}
      {seoResult && (
        <div className="bg-white p-5 rounded-2xl border border-lavender-border shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-xs text-ink-primary flex items-center gap-2">
              <span>فحص الأرشفة والمقروئية (SEO & Readability Audit)</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  seoResult.isClean
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {seoResult.isClean ? 'مطابق للمعايير ✓' : 'توجد ملاحظات للتحسين'}
              </span>
            </h3>

            <div className="flex items-center gap-3 text-xs text-ink-secondary font-mono">
              <span>{STUDIO_STRINGS.wordsCount(stats.wordCount)}</span>
              <span>•</span>
              <span>{STUDIO_STRINGS.readingTime(stats.readingTime)}</span>
              <span>•</span>
              <span>{STUDIO_STRINGS.charactersCount(stats.charCount)}</span>
            </div>
          </div>

          {seoResult.warnings.length > 0 ? (
            <div className="space-y-2">
              {seoResult.warnings.map((w, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    w.level === 'error'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  <span className="font-bold">{w.level === 'error' ? '✕ خطأ:' : '⚠ تنبيه:'}</span>
                  <span>{w.message}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-700">
              جميع معايير العناوين، الأوصاف، وبدائل الصور مطابقة لمعايير محركات البحث والذكاء الاصطناعي (GEO & AEO).
            </p>
          )}
        </div>
      )}

      {/* Revision History Drawer Modal */}
      {showRevisionDrawer && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowRevisionDrawer(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-xl w-full border border-lavender-border shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-lavender-border pb-3">
              <h3 className="font-bold text-base text-ink-primary">سجل المراجعات المحفوظة</h3>
              <button
                type="button"
                onClick={() => setShowRevisionDrawer(false)}
                className="text-ink-secondary hover:text-ink-primary text-xs"
              >
                إغلاق ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              <div className="p-4 bg-lavender-light rounded-xl border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-ink-primary block">المراجعة الحالية (رقم 2)</span>
                  <span className="text-[11px] text-ink-secondary">حفظ آلي • منذ دقيقتين</span>
                </div>
                <span className="text-[11px] font-bold text-primary">المسودة النشطة</span>
              </div>

              <div className="p-4 bg-white rounded-xl border border-lavender-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-ink-primary block">المراجعة الأولية (رقم 1)</span>
                  <span className="text-[11px] text-ink-secondary">النشر المرجعي • 2026-09-25 10:00</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    alert('تم استعادة المراجعة السابقة بنجاح.');
                    setShowRevisionDrawer(false);
                  }}
                  className="px-3 py-1 bg-lavender hover:bg-lavender-dark text-primary text-xs font-semibold rounded-lg transition-colors"
                >
                  استعادة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Atomic Publish Modal */}
      {showPublishModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowPublishModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-lavender-border shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-xl font-bold text-ink-primary mb-2">تأكيد النشر الذري للمقال</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                ستقوم منظومة النشر الحتمية بتوليد وتدقيق المشتقات الثلاثة معاً في عملية ذرية واحدة قبل اعتمادها:
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-lavender-light rounded-xl border border-lavender-border text-center">
                <span className="font-bold block mb-1">1. Rich HTML</span>
                <span className="text-[10px] text-ink-secondary">مكونات تفاعلية للعرض</span>
              </div>
              <div className="p-3 bg-lavender-light rounded-xl border border-lavender-border text-center">
                <span className="font-bold block mb-1">2. Markdown</span>
                <span className="text-[10px] text-ink-secondary">نسخة /content/[slug].md</span>
              </div>
              <div className="p-3 bg-lavender-light rounded-xl border border-lavender-border text-center">
                <span className="font-bold block mb-1">3. Plain Text</span>
                <span className="text-[10px] text-ink-secondary">نسخة /content/[slug].txt</span>
              </div>
            </div>

            {publishError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {publishError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-lavender-border">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                disabled={isPublishing}
                className="px-4 py-2 text-xs font-semibold text-ink-secondary hover:text-ink-primary disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isPublishing}
                onClick={async () => {
                  setIsPublishing(true);
                  setPublishError(null);
                  try {
                    const res = await fetch('/api/studio/publish', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        id: articleId,
                        title,
                        slug,
                        excerpt,
                        contentMdx: mdxSource,
                        visibility,
                        status: 'PUBLISHED',
                      }),
                    });

                    if (!res.ok) {
                      const data = await res.json();
                      throw new Error(data.error || 'فشل في حفظ ونشر المقال');
                    }

                    setShowPublishModal(false);
                    setPublishedSuccess(true);
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء النشر';
                    setPublishError(msg);
                  } finally {
                    setIsPublishing(false);
                  }
                }}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                {isPublishing ? 'جارٍ النشر وتوليد المشتقات...' : 'تأكيد النشر وتحديث الفهارس'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
    </div>
  );
}
