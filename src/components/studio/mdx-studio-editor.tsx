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
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';
import { auditSeoMetadata, type SeoAuditResult } from '@/lib/seo/seo-engine';
import { validateMdxSource } from '@/lib/content/allowlist';
import { mdxToProseMirror, proseMirrorToMdx } from '@/lib/editor/mdx-bridge';
import { STUDIO_STRINGS } from '@/lib/studio/strings';
import {
  saveArticleDraftAction,
  checkSlugAvailableAction,
  getArticleRevisionsAction,
  publishArticleAction,
} from '@/app/studio/actions/article-actions';
import type { ArticleRevision } from '@/lib/supabase/types';
import { getStudioEditorExtensions } from './editor/extensions/editor-extensions';
import { StudioVisualEditor } from './editor/studio-visual-editor';
import { CodeMirrorEditor } from './editor/codemirror-editor';
import { ShortcutsModal } from './editor/shortcuts-modal';
import { MetadataSidebar, type MetadataState } from './editor/metadata-sidebar';
import { RevisionsDrawer } from './editor/revisions-drawer';
import { ConflictModal } from './editor/conflict-modal';
import { PrepublishChecklistModal } from './editor/prepublish-checklist-modal';

export type EditorViewMode = 'visual' | 'source' | 'split';

interface MdxStudioEditorProps {
  initialTitle?: string;
  initialSlug?: string;
  initialExcerpt?: string;
  initialMdx?: string;
  initialVisibility?: 'FREE' | 'PREMIUM';
  initialStatus?: string;
  initialTopicId?: string;
  initialCoverImageUrl?: string;
  initialCoverImageAlt?: string;
  initialSeoTitle?: string;
  initialSeoDescription?: string;
  initialVersion?: number;
  articleId?: string;
}

interface LocalDraftPayload {
  title: string;
  slug: string;
  excerpt: string;
  mdxSource: string;
  visibility: 'FREE' | 'PREMIUM';
  topicId: string;
  coverImageUrl: string;
  coverImageAlt: string;
  savedAt: number;
}

export function MdxStudioEditor({
  initialTitle = 'عنوان المقال الجديد',
  initialSlug = 'new-article-slug',
  initialExcerpt = 'مقتطف تعريفي موجز بالمقال ومحتواه التحريري.',
  initialMdx = `# عنوان المقال الجديد\n\nاكتب هنا بداية المقال باللغة العربية الفصحى...\n\n<Callout type="info" title="ملاحظة هامة">\nيمكنك إضافة تنبيهات وكتل مخصصة بأمان.\n</Callout>\n\n## القسم الأول\n\nنص تحليلي معمق.\n`,
  initialVisibility = 'FREE',
  initialTopicId = '',
  initialCoverImageUrl = '',
  initialCoverImageAlt = '',
  initialSeoTitle = '',
  initialSeoDescription = '',
  initialVersion = 1,
  articleId,
}: MdxStudioEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [mdxSource, setMdxSource] = useState(initialMdx);
  const [metadata, setMetadata] = useState<MetadataState>({
    slug: initialSlug,
    excerpt: initialExcerpt,
    coverImageUrl: initialCoverImageUrl,
    coverImageAlt: initialCoverImageAlt,
    topicId: initialTopicId,
    tags: [],
    visibility: initialVisibility,
    seoTitle: initialSeoTitle || initialTitle,
    seoDescription: initialSeoDescription || initialExcerpt,
  });

  const [expectedVersion, setExpectedVersion] = useState(initialVersion);
  const [serverConflictVersion, setServerConflictVersion] = useState<number | undefined>();
  const [mode, setMode] = useState<EditorViewMode>('split');
  const [showSidebar, setShowSidebar] = useState(false);
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty' | 'failed'>('saved');
  const [seoResult, setSeoResult] = useState<SeoAuditResult | null>(null);

  // Modals & Drawers
  const [showRevisionDrawer, setShowRevisionDrawer] = useState(false);
  const [revisions, setRevisions] = useState<ArticleRevision[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showPrepublishModal, setShowPrepublishModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [switchError, setSwitchError] = useState<string[] | null>(null);

  // Local draft restore prompt
  const [localDraftAvailable, setLocalDraftAvailable] = useState(false);
  const localDraftPayloadRef = useRef<LocalDraftPayload | null>(null);

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
      description: metadata.excerpt,
      contentMdx: mdxSource,
    });
    setSeoResult(result);
  }, [title, metadata.excerpt, mdxSource]);

  // localStorage draft checking on mount
  useEffect(() => {
    const storageKey = `wise-hopper:draft:${articleId || 'new'}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed: LocalDraftPayload = JSON.parse(stored);
        if (parsed && parsed.savedAt && parsed.mdxSource && parsed.mdxSource !== initialMdx) {
          localDraftPayloadRef.current = parsed;
          setLocalDraftAvailable(true);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [articleId, initialMdx]);

  // Debounced Autosave (mirrors to localStorage and triggers server action)
  useEffect(() => {
    setSaveStatus('dirty');

    // 1. Mirror to localStorage
    const storageKey = `wise-hopper:draft:${articleId || 'new'}`;
    const draftPayload: LocalDraftPayload = {
      title,
      slug: metadata.slug,
      excerpt: metadata.excerpt,
      mdxSource,
      visibility: metadata.visibility,
      topicId: metadata.topicId,
      coverImageUrl: metadata.coverImageUrl,
      coverImageAlt: metadata.coverImageAlt,
      savedAt: Date.now(),
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(draftPayload));
    } catch {
      // Ignore quota errors
    }

    // 2. Server autosave after 2000ms debounce
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      const res = await saveArticleDraftAction({
        id: articleId,
        title,
        slug: metadata.slug,
        excerpt: metadata.excerpt,
        draftMdxSource: mdxSource,
        visibility: metadata.visibility,
        topicId: metadata.topicId || null,
        coverImageUrl: metadata.coverImageUrl || null,
        coverImageAlt: metadata.coverImageAlt || null,
        seoTitle: metadata.seoTitle || null,
        seoDescription: metadata.seoDescription || null,
        readingTimeMinutes: stats.readingTime,
        expectedVersion,
      });

      if (res.isConflict) {
        setSaveStatus('failed');
        setServerConflictVersion(res.serverVersion);
        setShowConflictModal(true);
      } else if (res.success && res.data) {
        setSaveStatus('saved');
        setExpectedVersion(res.data.version);
      } else {
        setSaveStatus('failed');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, metadata, mdxSource, articleId, expectedVersion, stats.readingTime]);

  // Safe mode switching with MDX validation
  const handleModeSwitch = useCallback(
    (newMode: EditorViewMode) => {
      if (newMode === mode) return;

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

  // Open revisions drawer
  const handleOpenRevisions = async () => {
    if (articleId) {
      const res = await getArticleRevisionsAction(articleId);
      if (res.success && res.data) {
        setRevisions(res.data);
      }
    }
    setShowRevisionDrawer(true);
  };

  // Restore revision handler
  const handleRestoreRevision = (restoredMdx: string) => {
    setMdxSource(restoredMdx);
    if (editor) {
      isUpdatingFromEditorRef.current = true;
      try {
        const pmDoc = mdxToProseMirror(restoredMdx);
        editor.commands.setContent(pmDoc);
      } catch {
        // Fallback
      } finally {
        isUpdatingFromEditorRef.current = false;
      }
    }
  };

  // Restore local draft
  const handleRestoreLocalDraft = () => {
    const payload = localDraftPayloadRef.current;
    if (payload) {
      setTitle(payload.title);
      setMdxSource(payload.mdxSource);
      setMetadata((prev) => ({
        ...prev,
        slug: payload.slug,
        excerpt: payload.excerpt,
        visibility: payload.visibility,
        topicId: payload.topicId,
        coverImageUrl: payload.coverImageUrl,
        coverImageAlt: payload.coverImageAlt,
      }));
      if (editor) {
        try {
          const pmDoc = mdxToProseMirror(payload.mdxSource);
          editor.commands.setContent(pmDoc);
        } catch {
          // ignore
        }
      }
    }
    setLocalDraftAvailable(false);
  };

  // Atomic Publish confirmation
  const handleConfirmPublish = async () => {
    setIsPublishing(true);
    setPublishError(null);
    try {
      const res = await publishArticleAction({
        id: articleId || crypto.randomUUID(),
        expectedVersion,
        title,
        slug: metadata.slug,
        excerpt: metadata.excerpt,
        coverImageUrl: metadata.coverImageUrl || null,
        coverImageAlt: metadata.coverImageAlt || null,
        visibility: metadata.visibility,
        topicId: metadata.topicId || null,
        seoTitle: metadata.seoTitle || title,
        seoDescription: metadata.seoDescription || metadata.excerpt,
        readingTimeMinutes: stats.readingTime,
        mdxSource,
        richHtml: '', // compiled by repository if empty
        markdownDerivative: '',
        plaintextDerivative: '',
      });

      if (!res.success) {
        throw new Error(res.error || 'فشل في حفظ ونشر المقال');
      }

      setShowPrepublishModal(false);
      setPublishedSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ أثناء النشر';
      setPublishError(msg);
    } finally {
      setIsPublishing(false);
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
                  : saveStatus === 'failed'
                  ? 'bg-rose-500'
                  : 'bg-lavender-dark'
              }`}
            />
            <span className="text-xs text-ink-secondary">
              {saveStatus === 'saved'
                ? 'تم حفظ التغييرات تلقائياً ✓'
                : saveStatus === 'saving'
                ? STUDIO_STRINGS.saving
                : saveStatus === 'failed'
                ? STUDIO_STRINGS.saveFailed
                : STUDIO_STRINGS.unsavedChanges}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Metadata Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setShowSidebar(!showSidebar)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 ${
              showSidebar ? 'bg-primary text-white shadow-2xs' : 'bg-lavender hover:bg-lavender-dark text-ink-primary'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>بيانات المقال</span>
          </button>

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
                <span>الخروج من التركيز</span>
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
            onClick={handleOpenRevisions}
            className="px-3 py-1.5 bg-lavender hover:bg-lavender-dark text-ink-primary text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>سجل المراجعات</span>
          </button>

          {/* Pre-publish Checklist & Atomic Publish Trigger */}
          <button
            type="button"
            onClick={() => setShowPrepublishModal(true)}
            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>نشر المقال ذرياً 🚀</span>
          </button>
        </div>
      </div>

      {/* Local Draft Restore Prompt Banner */}
      {localDraftAvailable && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{STUDIO_STRINGS.restorePrompt}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRestoreLocalDraft}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{STUDIO_STRINGS.restoreConfirm}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLocalDraftAvailable(false);
                const storageKey = `wise-hopper:draft:${articleId || 'new'}`;
                localStorage.removeItem(storageKey);
              }}
              className="px-3 py-1 bg-white hover:bg-amber-100 text-amber-800 rounded-lg font-semibold text-xs border border-amber-300 transition-colors"
            >
              {STUDIO_STRINGS.discardLocal}
            </button>
          </div>
        </div>
      )}

      {publishedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>✓ تم نشر المقال وتوليد المشتقات الثلاثة (HTML، Markdown، Plain Text) بنجاح.</span>
          </div>
          <Link
            href={`/articles/${metadata.slug}`}
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

      {/* Title Input Header */}
      <div className="bg-white p-5 rounded-2xl border border-lavender-border">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={STUDIO_STRINGS.titlePlaceholder}
          className="w-full text-2xl md:text-3xl font-bold text-ink-primary placeholder:text-ink-muted focus:outline-hidden leading-tight font-arabic"
        />
      </div>

      {/* Main Workspace Layout (Editor + Optional Collapsible Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={showSidebar ? 'lg:col-span-8 space-y-6' : 'lg:col-span-12 space-y-6'}>
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

          {/* Editor Workspaces */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
            {mode === 'visual' && (
              <div className="lg:col-span-12">
                <StudioVisualEditor editor={editor} isDistractionFree={isDistractionFree} />
              </div>
            )}

            {mode === 'source' && (
              <div className="lg:col-span-12">
                <CodeMirrorEditor
                  value={mdxSource}
                  onChange={(newVal) => setMdxSource(newVal)}
                  theme="dark"
                />
              </div>
            )}

            {mode === 'split' && (
              <>
                <div className="lg:col-span-6 flex flex-col">
                  <span className="text-[11px] font-bold text-ink-secondary mb-2 block">
                    محرر الكتابة المرئي (Visual Editor)
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
                      {metadata.excerpt && (
                        <p className="lead font-medium text-ink-secondary">{metadata.excerpt}</p>
                      )}
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
        </div>

        {/* Collapsible Sidebar */}
        {showSidebar && (
          <div className="lg:col-span-4">
            <MetadataSidebar
              metadata={metadata}
              onChange={setMetadata}
              articleId={articleId}
              onCheckSlug={async (testSlug) => checkSlugAvailableAction(testSlug, articleId)}
            />
          </div>
        )}
      </div>

      {/* Pre-publish Checklist Modal */}
      <PrepublishChecklistModal
        isOpen={showPrepublishModal}
        onClose={() => setShowPrepublishModal(false)}
        article={{
          title,
          slug: metadata.slug,
          excerpt: metadata.excerpt,
          contentMdx: mdxSource,
          coverImageUrl: metadata.coverImageUrl,
          coverImageAlt: metadata.coverImageAlt,
        }}
        onConfirmPublish={handleConfirmPublish}
        isPublishing={isPublishing}
        publishError={publishError}
      />

      {/* Revisions History Drawer Modal */}
      <RevisionsDrawer
        isOpen={showRevisionDrawer}
        onClose={() => setShowRevisionDrawer(false)}
        revisions={revisions}
        currentMdx={mdxSource}
        onRestoreRevision={handleRestoreRevision}
      />

      {/* Optimistic Lock Conflict Modal */}
      <ConflictModal
        isOpen={showConflictModal}
        serverVersion={serverConflictVersion}
        expectedVersion={expectedVersion}
        onKeepMine={() => {
          if (serverConflictVersion) {
            setExpectedVersion(serverConflictVersion);
          }
          setShowConflictModal(false);
        }}
        onLoadTheirs={() => {
          setShowConflictModal(false);
          // Reload page to fetch latest server state
          window.location.reload();
        }}
      />

      {/* Keyboard Shortcuts Modal */}
      <ShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
    </div>
  );
}
