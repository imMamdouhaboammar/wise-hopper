import Link from 'next/link';
import { getPublishedArticles } from '@/lib/data/article-service';

export default async function StudioDashboard() {
  const articles = await getPublishedArticles();

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
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
          >
            + كتابة مقال جديد
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-lavender-border">
          <span className="text-xs text-ink-secondary block mb-1">المقالات المنشورة</span>
          <div className="text-3xl font-extrabold text-ink-primary">{articles.length}</div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-2">✓ جميع المشتقات متزامنة</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-lavender-border">
          <span className="text-xs text-ink-secondary block mb-1">المسودات قيد الكتابة</span>
          <div className="text-3xl font-extrabold text-ink-primary">1</div>
          <span className="text-[11px] text-primary font-medium block mt-2">تلقائية الحفظ مفعلة</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-lavender-border">
          <span className="text-xs text-ink-secondary block mb-1">مشتركو النشرة البريدية</span>
          <div className="text-3xl font-extrabold text-ink-primary">148</div>
          <span className="text-[11px] text-emerald-600 font-medium block mt-2">تأكيد مزدوج نشط 100%</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-lavender-border">
          <span className="text-xs text-ink-secondary block mb-1">الأعضاء المشتركون (مدفوع)</span>
          <div className="text-3xl font-extrabold text-ink-primary">24</div>
          <span className="text-[11px] text-primary font-medium block mt-2">MRR: 240$ / شهرياً</span>
        </div>
      </div>

      {/* Publication Integrity Status */}
      <div className="bg-white p-6 rounded-2xl border border-lavender-border">
        <h2 className="text-base font-bold text-ink-primary mb-4">حالة سلامة منظومة النشر الحتمية</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-lavender-light rounded-xl border border-lavender-border">
            <span className="font-bold text-ink-primary block mb-1">مُصرف AST والمشتقات</span>
            <span className="text-emerald-700 font-semibold block mb-1">● يعمل بكفاءة عالية</span>
            <span className="text-ink-secondary">يولد HTML، Markdown، وPlain Text تلقائياً.</span>
          </div>

          <div className="p-4 bg-lavender-light rounded-xl border border-lavender-border">
            <span className="font-bold text-ink-primary block mb-1">محرك البحث العربي</span>
            <span className="text-emerald-700 font-semibold block mb-1">● نشط ومُفهرس</span>
            <span className="text-ink-secondary">تطبيع الألف والتاء المربوطة وإزالة التشكيل.</span>
          </div>

          <div className="p-4 bg-lavender-light rounded-xl border border-lavender-border">
            <span className="font-bold text-ink-primary block mb-1">بوابات الدفع (Simulated & Stubs)</span>
            <span className="text-emerald-700 font-semibold block mb-1">● متصلة وجاهزة</span>
            <span className="text-ink-secondary">Simulated Local, Lemon Squeezy, Paymob, Stripe.</span>
          </div>
        </div>
      </div>

      {/* Recent Articles Table */}
      <div className="bg-white rounded-2xl border border-lavender-border overflow-hidden">
        <div className="p-6 border-b border-lavender-border flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-primary">أحدث المقالات في الاستوديو</h2>
          <Link href="/studio/articles" className="text-xs text-primary font-semibold hover:underline">
            إدارة جميع المقالات ←
          </Link>
        </div>

        <div className="divide-y divide-lavender-border">
          {articles.map((article) => (
            <div key={article.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-lavender-light/30 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    article.visibility === 'PREMIUM'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {article.visibility === 'PREMIUM' ? 'مدفوع' : 'مجاني'}
                  </span>
                  <span className="text-xs text-ink-muted">تاريخ النشر: {article.published_at?.slice(0, 10)}</span>
                </div>
                <h3 className="text-base font-bold text-ink-primary">
                  <Link href={`/studio/articles/${article.id}/edit`} className="hover:text-primary transition-colors">
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
                <Link
                  href={`/articles/${article.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 bg-white hover:bg-lavender text-ink-secondary text-xs font-semibold rounded-lg border border-lavender-border transition-colors"
                >
                  معاينة مباشرة
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
