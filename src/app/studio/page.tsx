import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  BookOpen,
  FileEdit,
  Clock,
  ShieldCheck,
  Plus,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Cpu,
  Search,
  CalendarClock,
  ArrowLeft,
} from 'lucide-react';
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
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 sm:p-10 rounded-3xl border border-lavender-border/60 shadow-soft-xs">
        <div>
          <span className="text-xs font-semibold text-primary block mb-1">مرحباً بك، ممدوح</span>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-primary tracking-tight">
            لوحة قيادة النشر التحريري
          </h1>
          <p className="text-sm text-ink-secondary mt-1.5 leading-relaxed">
            منظومة النشر الحتمية تعمل بكفاءة عالية. 0% انحراف محتوى عبر المشتقات الرقمية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/studio/articles/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-sm font-semibold rounded-xl shadow-soft-xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>{STUDIO_STRINGS.newArticle}</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-7 rounded-3xl border border-lavender-border/60 shadow-soft-xs hover:shadow-soft-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-ink-secondary">المقالات المنشورة</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-ink-primary">{counts.published}</div>
          <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1.5 mt-2.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>جميع المشتقات متزامنة</span>
          </span>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-lavender-border/60 shadow-soft-xs hover:shadow-soft-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-ink-secondary">المسودات قيد الكتابة</span>
            <div className="w-10 h-10 rounded-2xl bg-lavender/70 text-primary flex items-center justify-center">
              <FileEdit className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-ink-primary">{counts.drafts}</div>
          <span className="text-[11px] text-primary font-medium inline-flex items-center gap-1.5 mt-2.5">
            <span>●</span>
            <span>تلقائية الحفظ مفعلة</span>
          </span>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-lavender-border/60 shadow-soft-xs hover:shadow-soft-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-ink-secondary">المقالات المجدولة</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-ink-primary">{counts.scheduled}</div>
          <span className="text-[11px] text-blue-700 font-medium inline-flex items-center gap-1.5 mt-2.5">
            <span>●</span>
            <span>نشر زمني ذري مؤتمت</span>
          </span>
        </div>

        <div className="bg-white p-7 rounded-3xl border border-lavender-border/60 shadow-soft-xs hover:shadow-soft-sm transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-ink-secondary">المقالات الحصرية</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-ink-primary">{counts.premium}</div>
          <span className="text-[11px] text-purple-700 font-medium inline-flex items-center gap-1.5 mt-2.5">
            <span>●</span>
            <span>حماية الخادم Zero-Leakage</span>
          </span>
        </div>
      </div>

      {/* Publication Integrity Status */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-lavender-border/60 shadow-soft-xs">
        <h2 className="text-sm font-bold text-ink-primary mb-5">حالة سلامة منظومة النشر الحتمية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-5 bg-background/50 rounded-2xl border border-lavender-border/60">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-primary" />
              <span className="font-bold text-ink-primary">مُصرف AST والمشتقات</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>يعمل بكفاءة عالية</span>
            </div>
            <span className="text-ink-secondary leading-relaxed">
              توليد HTML، Markdown، وPlain Text تلقائياً بنقاء مع كل حفظ.
            </span>
          </div>

          <div className="p-5 bg-background/50 rounded-2xl border border-lavender-border/60">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-4 h-4 text-primary" />
              <span className="font-bold text-ink-primary">محرك البحث العربي</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>نشط ومُفهرس</span>
            </div>
            <span className="text-ink-secondary leading-relaxed">
              تطبيع الألف والتاء المربوطة وإزالة التشكيل للتطابق الكامل.
            </span>
          </div>

          <div className="p-5 bg-background/50 rounded-2xl border border-lavender-border/60">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="w-4 h-4 text-primary" />
              <span className="font-bold text-ink-primary">جدولة النشر التلقائي</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>مؤمنة ومربوطة بـ Cron</span>
            </div>
            <span className="text-ink-secondary leading-relaxed">
              تنفيذ حتمي متكرر مع حماية التوقيع الرقمي CRON_SECRET.
            </span>
          </div>
        </div>
      </div>

      {/* Recent Articles Table */}
      <div className="bg-white rounded-3xl border border-lavender-border/60 overflow-hidden shadow-soft-xs">
        <div className="p-6 border-b border-lavender-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink-primary">أحدث المقالات في الاستوديو</h2>
          <Link
            href="/studio/articles"
            className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span>إدارة جميع المقالات ({counts.published + counts.drafts + counts.scheduled + counts.archived})</span>
            <ArrowLeft className="w-3.5 h-3.5" />
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
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lavender hover:bg-lavender-dark text-primary text-xs font-semibold rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </Link>
                    {isPublished && (
                      <Link
                        href={`/articles/${article.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-lavender text-ink-secondary hover:text-primary text-xs font-semibold rounded-lg border border-lavender-border transition-colors"
                      >
                        <span>معاينة</span>
                        <ExternalLink className="w-3 h-3 text-ink-muted" />
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
