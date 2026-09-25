import { redirect } from 'next/navigation';
import { getPublishedArticles } from '@/lib/data/article-service';
import { verifyOwnerSession } from '@/lib/auth/session';

export default async function StudioNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; count?: string }>;
}) {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    redirect('/account?error=unauthorized_studio');
  }

  const { sent, count } = await searchParams;
  const articles = await getPublishedArticles();

  return (
    <div className="space-y-8">
      {sent === 'true' && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-sm font-semibold rounded-2xl border border-emerald-200 flex items-center gap-3">
          <span>✓</span>
          <span>تم إرسال الحملة البريدية بنجاح إلى المشتركين {count ? `(${count} مستلم)` : ''}!</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary">إدارة النشرات والحملات البريدية</h1>
          <p className="text-xs text-ink-secondary mt-1">
            أرسل تحديثات ودراسات معمقة إلى جمهورك مع فصل تام بين الرسائل التسويقية والاشتراكات.
          </p>
        </div>
      </div>

      {/* Campaign Composer Card */}
      <div className="bg-white rounded-3xl p-8 border border-lavender-border space-y-6">
        <h2 className="text-lg font-bold text-ink-primary">إنشاء حملة بريدية جديدة</h2>

        <form action="/api/newsletter/campaign" method="POST" className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <label className="text-xs font-bold text-ink-primary block mb-1">عنوان رسالة البريد (Subject)</label>
              <input
                type="text"
                name="subject"
                placeholder="مثال: العدد رقم 13 | نظرة جديدة على مستقبل النشر العربي"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-sm text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-4">
              <label className="text-xs font-bold text-ink-primary block mb-1">الشريحة المستهدفة (Segment)</label>
              <select
                name="segment"
                className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-xs font-semibold text-ink-primary bg-white focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">كافة المشتركين (148 مشترك)</option>
                <option value="free">المشتركون المجانيون فقط (124)</option>
                <option value="premium">أعضاء العضوية المميزة فقط (24)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-ink-primary block mb-1">
              أو قم بإنشاء محتوى الحملة من مقال منشور:
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-xs text-ink-secondary bg-white focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            >
              <option value="">-- اختر مقالاً لتضمين مقتطفه ورابطه تلقائياً --</option>
              {articles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.visibility === 'PREMIUM' ? 'مقال حصري' : 'مقال مجاني'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-ink-primary block mb-1">نص الحملة التحريري (Markdown / HTML)</label>
            <textarea
              name="body"
              rows={8}
              placeholder="اكتب رسالتك البريدية هنا بأسلوب تحريري أنيق..."
              className="w-full p-4 rounded-xl border border-lavender-border text-sm text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 font-arabic leading-relaxed"
            />
          </div>

          <div className="p-4 bg-lavender-light rounded-xl border border-lavender-border flex items-center justify-between text-xs">
            <span className="text-ink-secondary">
              تنبيه الأمان: إرسال مقال عام لا يطلق رسائل جماعية تلقائياً لتجنب إزعاج المشتركين.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="px-4 py-2 bg-white text-ink-secondary hover:text-primary rounded-lg border border-lavender-border font-medium"
              >
                إرسال بريد تجريبي للمؤلف
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-xs"
              >
                موافقة صريحة وإرسال الحملة ✉
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Deliverability & Compliance Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-lavender-border">
          <span className="text-xs text-ink-secondary block mb-1">معدل التسليم الإجمالي</span>
          <div className="text-2xl font-bold text-emerald-700">99.4%</div>
          <span className="text-[11px] text-ink-muted block mt-1">عبر Resend API الموثق</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-lavender-border">
          <span className="text-xs text-ink-secondary block mb-1">توثيق النطاق (DKIM / SPF)</span>
          <div className="text-2xl font-bold text-emerald-700">مكتمل وصحيح ✓</div>
          <span className="text-[11px] text-ink-muted block mt-1">DMARC policy: quarantine</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-lavender-border">
          <span className="text-xs text-ink-secondary block mb-1">الارتدادات والشكاوى</span>
          <div className="text-2xl font-bold text-ink-primary">0.1%</div>
          <span className="text-[11px] text-ink-muted block mt-1">ضمن الحدود الآمنة للسمعة</span>
        </div>
      </div>
    </div>
  );
}
