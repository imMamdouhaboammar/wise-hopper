import Link from 'next/link';
import { getAllTopics } from '@/lib/data/article-service';

export const metadata = {
  title: 'حساب القارئ وإدارة الاشتراك',
  description: 'إدارة العضوية المدفوعة وتفضيلات النشرة البريدية.',
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; canceled?: string }>;
}) {
  const { updated, canceled } = await searchParams;
  const topics = await getAllTopics();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-12">
        <h1 className="text-3xl font-bold text-ink-primary mb-2">إدارة الحساب والاشتراك</h1>
        <p className="text-sm text-ink-secondary">
          تحكم في بيانات وصولك للعضوية المميزة، واضبط تفضيلات النشرة البريدية.
        </p>
      </div>

      {updated && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
          ✓ تم تحديث تفضيلاتك بنجاح.
        </div>
      )}

      {canceled && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
          تم إلغاء التجديد التلقائي. سيبقى اشتراكك سارياً حتى نهاية الدورة الحالية.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Subscription Status Card */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 bg-white rounded-2xl border border-lavender-border">
            <h2 className="text-lg font-bold text-ink-primary mb-4">حالة العضوية</h2>

            <div className="flex items-center justify-between p-4 bg-lavender-light rounded-xl mb-6">
              <div>
                <span className="text-xs text-ink-secondary block mb-1">الخطة الحالية</span>
                <span className="font-bold text-base text-ink-primary">عضوية سنوية مدفوعة (تجريبية)</span>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                نشط
              </span>
            </div>

            <div className="space-y-3 text-xs text-ink-secondary mb-6 border-b border-lavender-border pb-6">
              <div className="flex justify-between">
                <span>تاريخ التجديد القادم:</span>
                <span className="font-mono text-ink-primary">2027-09-25</span>
              </div>
              <div className="flex justify-between">
                <span>مزود الدفع:</span>
                <span className="font-mono text-ink-primary">Simulated / Lemon Squeezy</span>
              </div>
              <div className="flex justify-between">
                <span>المبلغ:</span>
                <span className="font-mono text-ink-primary">100.00 USD / سنوياً</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href="/membership"
                className="px-4 py-2 bg-lavender text-primary hover:bg-lavender-dark text-xs font-semibold rounded-lg transition-colors"
              >
                تغيير الخطة
              </Link>
              <form action="/api/billing/cancel" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold rounded-lg transition-colors"
                >
                  إلغاء الاشتراك
                </button>
              </form>
            </div>
          </div>

          {/* Newsletter Preferences Card */}
          <div className="p-6 bg-white rounded-2xl border border-lavender-border">
            <h2 className="text-lg font-bold text-ink-primary mb-4">تفضيلات النشرة البريدية</h2>
            <p className="text-xs text-ink-secondary mb-6">
              حدد المواضيع التي ترغب في استلام تحديثاتها عبر البريد:
            </p>

            <form action="/api/newsletter/update-topics" method="POST" className="space-y-4">
              {topics.map((t) => (
                <label key={t.id} className="flex items-center gap-3 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    name="topics"
                    value={t.slug}
                    defaultChecked
                    className="accent-primary w-4 h-4 rounded-sm"
                  />
                  <span className="text-ink-primary">{t.name}</span>
                </label>
              ))}

              <div className="pt-4 border-t border-lavender-border flex items-center justify-between">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  حفظ التفضيلات
                </button>

                <Link
                  href="/api/newsletter/unsubscribe?email=reader@example.com"
                  className="text-xs text-rose-600 hover:underline"
                >
                  إلغاء الاشتراك من النشرة
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Profile & Help */}
        <div className="space-y-6">
          <div className="p-6 bg-lavender-light rounded-2xl border border-lavender-border">
            <h3 className="font-bold text-sm text-ink-primary mb-2">الدعم الفني للقراء</h3>
            <p className="text-xs text-ink-secondary leading-relaxed mb-4">
              هل تواجه أي مشكلة في الوصول لمقال حصري أو تحميل المشتقات الرقمية؟
            </p>
            <a
              href="mailto:support@wisehopper.dev"
              className="text-xs font-semibold text-primary hover:underline block"
            >
              مراسلة الدعم المباشر ←
            </a>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-lavender-border">
            <h3 className="font-bold text-sm text-ink-primary mb-2">جلسة الدخول</h3>
            <p className="text-xs text-ink-secondary mb-4">
              مسجل الدخول كـ: <span className="font-mono text-ink-primary">reader@example.com</span>
            </p>
            <button
              type="button"
              className="w-full py-2 bg-lavender hover:bg-lavender-dark text-ink-secondary text-xs font-semibold rounded-lg transition-colors"
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
