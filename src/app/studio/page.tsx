import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getArticleRepository } from '@/lib/data';
import { verifyOwnerSession } from '@/lib/auth/session';
import { STUDIO_STRINGS } from '@/lib/studio/strings';

export default async function StudioDashboard() {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    redirect('/account?error=unauthorized_studio');
  }

  const repo = getArticleRepository();
  const [counts, recentArticles] = await Promise.all([
    repo.getArticleCounts(),
    repo.getRecentStudioArticles(5),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-lavender-border shadow-xs">
        <div>
          <span className="text-xs font-semibold text-primary block mb-1">مرحباً بك، ممدوح</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-primary">لوحة قيادة النشر التحريري</h1>
          <p className="text-sm text-ink-secondary mt-1">
            منظومة النشر الحتمية تعمل بكفاءة. 0% انحراف محتوى عبر المشتقات الرقمية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/studio/articles/new"
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
          >
            + {STUDIO_STRINGS.newArticle}
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-lavender-border">
          <span className="text-xs text-ink-secondary block mb-1">المقالات المنشورة</span>
          <div className="text-3xl font-extrabold text-ink-primary">{counts.published}</div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-2">✓ جميع المشتقات متزامنة</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-lavender-border">
          <span className="text-xs text-ink-secondary block mb-1">المسودات قيد الكتابة</span>
          <div className="text-3xl font-extrabold text-ink-primary">{counts.drafts}</div>
          <span className="text-[11px] text-primary font-medium block mt-2">تلقائية الحفظ مفعلة</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-lavender-border">
          <span className="text-xs text-ink-secondary block mb-1">المقالات المجدولة</span>
          <div className="text-3xl font-extrabold text-ink-primary">{counts.scheduled}</div>
          <span className="text-[11px] text-blue-600 font-medium block mt-2">نشر زمني ذري</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-lavender-border">
          <span className="text-xs text-ink-secondary block mb-1">المقالات الحصرية (للمشتركين)</span>
          <div className="text-3xl font-extrabold text-ink-primary">{counts.premium}</div>
          <span className="text-[11px] text-primary font-medium block mt-2">حماية الخادم Zero-Leakage</span>
        </div>
      </div>

      {/* Publication Integrity Status */}
      <div className="bg-white p-6 rounded-2xl border border-lavender-border">
        <h2 className="text-base font-bold text-ink-primary mb-4">حالة سلامة منظومة النشر الحتمية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-lavender-light rounded-xl border border-lavender-border">
            <span className="font-bold text-ink-primary block mb-1">مُصرف AST والمشتقات</span>
            <span className="text-emerald-700 font-semibold block mb-1">● يعمل بكفاءة عالية</span>
            <span className="text-ink-secondary">يولد HTML، Markdown، وPlain Text تلقائياً عند النشر.</span>
          </div>

          <div className="p-4 bg-lavender-light rounded-xl border border-lavender-border">
            <span className="font-bold text-ink-primary block mb-1">محرك البحث العربي</span>
            <span className="text-emerald-700 font-semibold block mb-1">● نشط ومُفهرس</span>
            <span className="text-ink-secondary">تطبيع الألف والتاء المربوطة وإزالة التشكيل للتطابق الكامل.</span>
          </div>

          <div className="p-4 bg-lavender-light rounded-xl border border-lavender-border">
            <span className="font-bold text-ink-primary block mb-1">جدولة النشر التلقائي</span>
            <span className="text-emerald-700 font-semibold block mb-1">● مؤمنة ومربوطة بـ Cron</span>
            <span className="text-ink-secondary">تنفيذ حتمي متكرر مع حماية التوقيع الرقمي CRON_SECRET.</span>
          </div>
        </div>
      </div>

      {/* Recent Articles Table */}
      <div className="bg-white rounded-2xl border border-lavender-border overflow-hidden">
        <div className="p-6 border-b border-lavender-border flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-primary">أحدث المقالات في الاستوديو</h2>
          <Link href="/studio/articles" className="text-xs text-primary font-semibold hover:underline">
            إدارة جميع المقالات ({counts.published + counts.drafts + counts.scheduled + counts.archived}) ←
          </Link>
        </div>

        {recentArticles.length === 0 ? (
          <div className="p-12 text-center text-ink-secondary text-sm">
            لا توجد مقالات بعد. اضغط على "+ مقال جديد" للبدء في كتابة مقالك الأول.
          </div>
        ) : (
          <div className="divide-y divide-lavender-border">
            {recentArticles.map((article) => {
              const isPublished = article.status === 'PUBLISHED';
              const isScheduled = article.status === 'SCHEDULED';
              const isDraft = article.status === 'DRAFT';

              return (
                <div
                  key={article.id}
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-lavender-light/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {/* Status Badge */}
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                          isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isScheduled
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : isDraft
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isPublished
                          ? STUDIO_STRINGS.statusPublished
                          : isScheduled
                          ? STUDIO_STRINGS.statusScheduled
                          : isDraft
                          ? STUDIO_STRINGS.statusDraft
                          : STUDIO_STRINGS.statusArchived}
                      </span>

                      {/* Visibility Badge */}
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          article.visibility === 'PREMIUM'
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-slate-100 text-ink-secondary border border-slate-200'
                        }`}
                      >
                        {article.visibility === 'PREMIUM'
                          ? STUDIO_STRINGS.statusPremium
                          : STUDIO_STRINGS.statusFree}
                      </span>

                      <span className="text-xs text-ink-muted">
                        {isPublished && article.published_at
                          ? `نُشر: ${article.published_at.slice(0, 10)}`
                          : isScheduled && article.scheduled_at
                          ? `مجدول: ${article.scheduled_at.slice(0, 10)}`
                          : `تعديل: ${article.updated_at.slice(0, 10)}`}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-ink-primary">
                      <Link
                        href={`/studio/articles/${article.id}/edit`}
                        className="hover:text-primary transition-colors"
                      >
                        {article.title}
                      </Link>
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/studio/articles/${article.id}/edit`}
                      className="px-3 py-1.5 bg-lavender hover:bg-lavender-dark text-primary text-xs font-semibold rounded-lg transition-colors"
                    >
                      تعديل ومراجعة
                    </Link>
                    {isPublished && (
                      <Link
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        className="px-3 py-1.5 bg-white hover:bg-lavender text-ink-secondary text-xs font-semibold rounded-lg border border-lavender-border transition-colors"
                      >
                        معاينة مباشرة ↗
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
