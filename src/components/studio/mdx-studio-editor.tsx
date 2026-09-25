'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { auditSeoMetadata, type SeoAuditResult } from '@/lib/seo/seo-engine';

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
}: MdxStudioEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [excerpt, setExcerpt] = useState(initialExcerpt);
  const [visibility, setVisibility] = useState<'FREE' | 'PREMIUM'>(initialVisibility);
  const [mdxSource, setMdxSource] = useState(initialMdx);
  const [mode, setMode] = useState<'split' | 'source' | 'preview'>('split');
  const [isDistractionFree, setIsDistractionFree] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [seoResult, setSeoResult] = useState<SeoAuditResult | null>(null);
  const [showRevisionDrawer, setShowRevisionDrawer] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedSuccess, setPublishedSuccess] = useState(false);

  // SEO audit recalculation on change
  useEffect(() => {
    const result = auditSeoMetadata({
      title,
      description: excerpt,
      contentMdx: mdxSource,
    });
    setSeoResult(result);
  }, [title, excerpt, mdxSource]);

  // Debounced Autosave Simulation
  useEffect(() => {
    setSaveStatus('dirty');
    const timer = setTimeout(() => {
      setSaveStatus('saving');
      setTimeout(() => {
        setSaveStatus('saved');
      }, 600);
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, excerpt, mdxSource, visibility]);

  // Insert block helpers
  const insertBlock = (snippet: string) => {
    setMdxSource((prev) => `${prev}\n\n${snippet}\n`);
  };

  return (
    <div
      className={`space-y-6 ${
        isDistractionFree ? 'fixed inset-0 bg-white z-50 p-8 overflow-y-auto' : ''
      }`}
    >
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-lavender-border shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/studio/articles"
            className="text-xs font-semibold text-ink-secondary hover:text-primary transition-colors"
          >
            ← العودة للمقالات
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
                ? 'جاري الحفظ التلقائي...'
                : 'تغييرات غير محفوظة'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDistractionFree(!isDistractionFree)}
            className="px-3 py-1.5 bg-lavender hover:bg-lavender-dark text-ink-primary text-xs font-medium rounded-lg transition-colors"
          >
            {isDistractionFree ? 'الخروج من وضع التركيز' : 'وضع الكتابة المركز'}
          </button>

          <button
            type="button"
            onClick={() => setShowRevisionDrawer(true)}
            className="px-3 py-1.5 bg-lavender hover:bg-lavender-dark text-ink-primary text-xs font-medium rounded-lg transition-colors"
          >
            سجل المراجعات (2)
          </button>

          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            نشر المقال ذرياً 🚀
          </button>
        </div>
      </div>

      {publishedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <span>✓ تم نشر المقال وتوليد المشتقات الثلاثة (HTML، Markdown، Plain Text) بنجاح.</span>
          <Link href={`/articles/${slug}`} target="_blank" className="underline">
            عرض المقال المنشور ↗
          </Link>
        </div>
      )}

      {/* Article Metadata Fields */}
      <div className="bg-white p-6 rounded-2xl border border-lavender-border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <label className="text-xs font-bold text-ink-primary block mb-1">عنوان المقال</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-base font-bold text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="md:col-span-4">
            <label className="text-xs font-bold text-ink-primary block mb-1">الرابط الدائم (Slug)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              dir="ltr"
              className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-xs font-mono text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-9">
            <label className="text-xs font-bold text-ink-primary block mb-1">
              المقتطف التعريفي والوصف (Meta Description)
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-lavender-border text-xs text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 leading-relaxed"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-bold text-ink-primary block mb-1">نوع الرؤية والوصول</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'FREE' | 'PREMIUM')}
              className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-xs font-semibold text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 bg-white"
            >
              <option value="FREE">مقال مفتوح (FREE)</option>
              <option value="PREMIUM">حصري للمشتركين (PREMIUM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Editor Toolbar & Insert Blocks */}
      <div className="bg-white p-3 rounded-2xl border border-lavender-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-ink-secondary ml-2">إدراج كتل تحريرية:</span>
          <button
            type="button"
            onClick={() => insertBlock('<Callout type="info" title="تنبيه">\nمحتوى التنبيه هنا...\n</Callout>')}
            className="px-2.5 py-1 bg-lavender-light hover:bg-lavender text-primary text-xs font-semibold rounded-lg border border-lavender-border"
          >
            + تنبيه Callout
          </button>
          <button
            type="button"
            onClick={() => insertBlock('<PullQuote quote="اقتباس عميق يشد انتباه القارئ" author="الكاتب" />')}
            className="px-2.5 py-1 bg-lavender-light hover:bg-lavender text-primary text-xs font-semibold rounded-lg border border-lavender-border"
          >
            + اقتباس PullQuote
          </button>
          <button
            type="button"
            onClick={() =>
              insertBlock(
                '<Figure src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c" alt="وصف توضيحي للمشهد" caption="تعليق الصورة هنا" />'
              )
            }
            className="px-2.5 py-1 bg-lavender-light hover:bg-lavender text-primary text-xs font-semibold rounded-lg border border-lavender-border"
          >
            + صورة Figure
          </button>
          <button
            type="button"
            onClick={() =>
              insertBlock('```mermaid\ngraph LR\n  A[المدخلات] --> B[المعمارية]\n  B --> C[المشتقات]\n```')
            }
            className="px-2.5 py-1 bg-lavender-light hover:bg-lavender text-primary text-xs font-semibold rounded-lg border border-lavender-border font-mono"
          >
            + رسم Mermaid
          </button>
          <button
            type="button"
            onClick={() => insertBlock('```typescript\nconst message: string = "أهلاً بك";\n```')}
            className="px-2.5 py-1 bg-lavender-light hover:bg-lavender text-primary text-xs font-semibold rounded-lg border border-lavender-border font-mono"
          >
            + شفرة Code
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-lavender-light p-1 rounded-xl border border-lavender-border text-xs">
          <button
            type="button"
            onClick={() => setMode('split')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              mode === 'split' ? 'bg-primary text-white shadow-xs' : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            عرض منقسم
          </button>
          <button
            type="button"
            onClick={() => setMode('source')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              mode === 'source' ? 'bg-primary text-white shadow-xs' : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            المصدر MDX
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              mode === 'preview' ? 'bg-primary text-white shadow-xs' : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            المعاينة الحية
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        {/* MDX Source Editor Pane */}
        {(mode === 'split' || mode === 'source') && (
          <div className={`${mode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col`}>
            <div className="bg-white rounded-2xl border border-lavender-border flex-1 flex flex-col p-4">
              <span className="text-[11px] font-mono text-ink-muted mb-2 block text-left">
                MDX Editor Source Mode
              </span>
              <textarea
                value={mdxSource}
                onChange={(e) => setMdxSource(e.target.value)}
                dir="rtl"
                className="flex-1 w-full p-4 font-mono text-sm leading-relaxed border-0 focus:outline-hidden text-ink-primary resize-y min-h-[460px] bg-slate-50/50 rounded-xl"
                placeholder="اكتب مستند MDX المرجعي هنا..."
              />
            </div>
          </div>
        )}

        {/* Live Synchronized Preview Pane */}
        {(mode === 'split' || mode === 'preview') && (
          <div className={`${mode === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col`}>
            <div className="bg-white rounded-2xl border border-lavender-border flex-1 p-6 overflow-y-auto max-h-[600px]">
              <span className="text-[11px] font-bold text-primary mb-4 block">
                المعاينة التحريرية المباشرة (Live Editorial Preview)
              </span>
              <div className="editorial-prose text-sm">
                <h1>{title}</h1>
                <p className="lead font-medium text-ink-secondary">{excerpt}</p>
                <div className="whitespace-pre-wrap font-arabic leading-relaxed text-ink-primary mt-4">
                  {mdxSource}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real-time SEO & Readability Audit Panel */}
      {seoResult && (
        <div className="bg-white p-6 rounded-2xl border border-lavender-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-ink-primary flex items-center gap-2">
              <span>فحص الأرشفة والمقروئية (SEO & Readability Audit)</span>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  seoResult.isClean
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {seoResult.isClean ? 'ممتاز ومطابق للمعايير ✓' : 'توجد ملاحظات للتحسين'}
              </span>
            </h3>

            <div className="flex items-center gap-4 text-xs text-ink-secondary font-mono">
              <span>عدد الكلمات: {seoResult.stats.wordCount}</span>
              <span>•</span>
              <span>وقت القراءة التقديري: {seoResult.stats.readingTimeMinutes} دقيقة</span>
            </div>
          </div>

          {seoResult.warnings.length > 0 ? (
            <div className="space-y-2">
              {seoResult.warnings.map((w, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-6 max-w-xl w-full border border-lavender-border shadow-2xl space-y-4">
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
                  className="px-3 py-1 bg-lavender hover:bg-lavender-dark text-primary text-xs font-semibold rounded-lg"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full border border-lavender-border shadow-2xl space-y-6">
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

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-lavender-border">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 text-xs font-semibold text-ink-secondary hover:text-ink-primary"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPublishModal(false);
                  setPublishedSuccess(true);
                }}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                تأكيد النشر وتحديث الفهارس
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
