'use client';

import { useMemo } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Rocket,
  X,
  FileCheck,
} from 'lucide-react';
import { STUDIO_STRINGS } from '@/lib/studio/strings';
import { validateMdxSource } from '@/lib/content/allowlist';
import { mdxToProseMirror } from '@/lib/editor/mdx-bridge';

interface PrepublishArticleData {
  title: string;
  slug: string;
  excerpt: string;
  contentMdx: string;
  coverImageUrl?: string;
  coverImageAlt?: string;
}

interface PrepublishChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: PrepublishArticleData;
  onConfirmPublish: () => Promise<void>;
  isPublishing: boolean;
  publishError: string | null;
}

export function PrepublishChecklistModal({
  isOpen,
  onClose,
  article,
  onConfirmPublish,
  isPublishing,
  publishError,
}: PrepublishChecklistModalProps) {
  const audit = useMemo(() => {
    const blocking: string[] = [];
    const warnings: string[] = [];

    // 1. Mandatory metadata checks
    if (!article.title || article.title.trim().length === 0) {
      blocking.push(STUDIO_STRINGS.errorTitleRequired);
    }
    if (!article.slug || article.slug.trim().length === 0) {
      blocking.push(STUDIO_STRINGS.errorSlugRequired);
    }
    if (!article.excerpt || article.excerpt.trim().length === 0) {
      blocking.push(STUDIO_STRINGS.errorExcerptRequired);
    }

    // 2. Cover image alt requirement
    if (article.coverImageUrl && (!article.coverImageAlt || article.coverImageAlt.trim().length === 0)) {
      blocking.push('صورة الغلاف مضافة ولكن بدون نص بديل إلزامي');
    }

    // 3. MDX Security & Component Allowlist validation
    const mdxValidation = validateMdxSource(article.contentMdx);
    if (!mdxValidation.isValid) {
      blocking.push(...mdxValidation.errors);
    }

    // 4. In-document Figure Alt text verification
    try {
      const pmDoc = mdxToProseMirror(article.contentMdx);
      let missingFigureAlt = false;

      const checkNode = (node: { type?: string; attrs?: { alt?: string }; content?: unknown[] }) => {
        if (node.type === 'figure') {
          const alt = node.attrs?.alt;
          if (!alt || alt.trim().length === 0) {
            missingFigureAlt = true;
          }
        }
        if (node.content && Array.isArray(node.content)) {
          for (const child of node.content) {
            if (child) {
              // SAFETY: child is an object node within ProseMirror JSONContent tree
              checkNode(child as { type?: string; attrs?: { alt?: string }; content?: unknown[] });
            }
          }
        }
      };

      // SAFETY: pmDoc is ProseMirror JSONContent root document
      checkNode(pmDoc as { type?: string; attrs?: { alt?: string }; content?: unknown[] });
      if (missingFigureAlt) {
        blocking.push('توجد صور توضيحية (Figure) داخل المحتوى تفتقر إلى النص البديل الإلزامي');
      }
    } catch {
      blocking.push(STUDIO_STRINGS.errorMdxInvalid);
    }

    // 5. Editorial warnings (non-blocking)
    const words = article.contentMdx.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean);
    if (words.length < 150) {
      warnings.push(`المحتوى قصير نسبياً (${words.length} كلمة)، يفضل أن تكون المقالات التحليلية أطول من 300 كلمة`);
    }

    if (article.excerpt && article.excerpt.length > 160) {
      warnings.push(`المقتطف يتجاوز 160 حرفاً (${article.excerpt.length} حرف)، قد يُقتطع في نتائج محركات البحث`);
    }

    return {
      blocking,
      warnings,
      isReady: blocking.length === 0,
    };
  }, [article]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full border border-lavender-border/60 shadow-soft-xl p-6 md:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-lavender-border/40">
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <FileCheck className="w-5 h-5" />
            <h3>{STUDIO_STRINGS.prepublishTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-ink-muted hover:text-ink-primary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Readiness Status Banner */}
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
            audit.isReady
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {audit.isReady ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">{STUDIO_STRINGS.prepublishReady}</span>
                <span className="text-[11px] text-emerald-700">
                  تم استيفاء جميع الشروط الإلزامية وتدقيق وسوم MDX والنصوص البديلة.
                </span>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold block">{STUDIO_STRINGS.prepublishHasErrors}</span>
                <span className="text-[11px] text-rose-700">
                  يجب حل الأخطاء الإلزامية أدناه لتتمكن من النشر.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Blocking Errors */}
        {audit.blocking.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-rose-700 block">شروط النشر الإلزامية:</span>
            <div className="space-y-1.5">
              {audit.blocking.map((err, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-rose-800 bg-rose-50/60 p-2.5 rounded-xl border border-rose-100"
                >
                  <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editorial Warnings */}
        {audit.warnings.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-700 block">
              {STUDIO_STRINGS.prepublishHasWarnings}
            </span>
            <div className="space-y-1.5">
              {audit.warnings.map((warn, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{warn}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Derivatives Explanation Card */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-lavender-border text-[11px] text-ink-secondary space-y-1">
          <span className="font-bold text-ink-primary block">النشر الذري الحتمي:</span>
          <p>
            عند النشر، يتم توليد المشتقات الثلاثة معاً في معاملة ذرية موحدة وحفظها في سجل المراجعات:
            <span className="font-mono text-primary mr-1">HTML، Markdown (.md)، و Plain Text (.txt)</span>.
          </p>
        </div>

        {publishError && (
          <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 text-xs rounded-xl">
            {publishError}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-lavender-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="px-4 py-2 text-xs font-semibold text-ink-secondary hover:text-ink-primary disabled:opacity-50"
          >
            {STUDIO_STRINGS.cancel}
          </button>

          <button
            type="button"
            onClick={onConfirmPublish}
            disabled={!audit.isReady || isPublishing}
            className="px-6 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Rocket className="w-4 h-4" />
            <span>
              {isPublishing ? 'جارٍ النشر وتوليد المشتقات…' : STUDIO_STRINGS.publishNow}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
