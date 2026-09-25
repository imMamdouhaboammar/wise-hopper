import Link from 'next/link';
import { getAllTopics } from '@/lib/data/article-service';
import { verifyOwnerSession } from '@/lib/auth/session';
import { AdminLoginCard } from '@/components/studio/admin-login-card';

export const metadata = {
  title: 'حساب القارئ وإدارة الاشتراك',
  description: 'إدارة العضوية المدفوعة وتفضيلات النشرة البريدية وبوابة إدارة الاستوديو.',
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{
    updated?: string;
    canceled?: string;
    error?: string;
    redirect?: string;
    logged_out?: string;
  }>;
}) {
  const { updated, canceled, error, redirect, logged_out } = await searchParams;
  const topics = await getAllTopics();
  const session = await verifyOwnerSession();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-ink-primary mb-2">إدارة الحساب والوصول</h1>
        <p className="text-sm text-ink-secondary">
          تحكم في بيانات وصولك للعضوية المميزة، واضبط تفضيلات النشرة، أو سجل دخولك كمالك للمنصة.
        </p>
      </div>

      {logged_out && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
          ✓ تم تسجيل الخروج من جلسة استوديو النشر بنجاح.
        </div>
      )}

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

      <div className="space-y-8">
        {/* Studio Owner Section */}
        {session.isOwner ? (
          <div className="p-6 bg-lavender-light rounded-2xl border-2 border-primary/20 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-primary text-white text-[11px] font-bold rounded-full">
                    جلسة المالك نشطة
                  </span>
                  <span className="text-xs font-mono text-ink-secondary">
                    {session.email || 'owner@wise-hopper.io'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-ink-primary mt-1">
                  استوديو النشر التحريري
                </h2>
                <p className="text-xs text-ink-secondary mt-1">
                  أنت مسجل الدخول حالياً بصلاحية المالك. يمكنك الوصول لكافة أقسام التحرير والنشرة والفوترة.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/studio"
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  دخول الاستوديو ←
                </Link>
                <form action="/api/studio/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    تسجيل الخروج
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <AdminLoginCard
            initialError={error}
            redirectTarget={redirect || '/studio'}
            isCollapsedDefault={!error}
          />
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
                    className="px-4 py-2 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
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
                    className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
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
            <div className="p-6 bg-white rounded-2xl border border-lavender-border">
              <h3 className="font-bold text-sm text-ink-primary mb-2">جلسة الدخول الحالية</h3>
              {session.isOwner ? (
                <div className="space-y-3">
                  <p className="text-xs text-ink-secondary">
                    صلاحية الجلسة: <span className="font-bold text-primary">مالك المنصة (Studio Owner)</span>
                  </p>
                  <Link
                    href="/studio"
                    className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    الانتقال للاستوديو ←
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-ink-secondary">
                    مسجل كقارئ: <span className="font-mono text-ink-primary">reader@example.com</span>
                  </p>
                  <p className="text-[11px] text-ink-muted">
                    أنت لست مسجلاً كمالك استوديو في هذه الجلسة.
                  </p>
                </div>
              )}
            </div>

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
          </div>
        </div>
      </div>
    </div>
  );
}
