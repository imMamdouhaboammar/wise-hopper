import { redirect } from 'next/navigation';
import { verifyOwnerSession } from '@/lib/auth/session';

export default async function StudioBillingPage() {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    redirect('/account?error=unauthorized_studio');
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink-primary">إدارة العضويات وبوابات الدفع</h1>
        <p className="text-xs text-ink-secondary mt-1">
          إعداد خطط الاشتراك، منح العضويات الإهدائية، ومراقبة حالة الربط مع بوابات الدفع.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Complimentary Membership Grant Tool */}
        <div className="bg-white rounded-3xl p-8 border border-lavender-border space-y-6">
          <div>
            <h2 className="text-lg font-bold text-ink-primary">منح عضوية إهدائية مجانية</h2>
            <p className="text-xs text-ink-secondary mt-1">
              امنح وصولاً غير محدود لأحد الطلاب أو الباحثين أو الزملاء دون الحاجة للدفع.
            </p>
          </div>

          <form action="/api/billing/grant-complimentary" method="POST" className="space-y-4">
            <div>
              <label className="text-xs font-bold text-ink-primary block mb-1">البريد الإلكتروني للمستفيد</label>
              <input
                type="email"
                name="email"
                required
                placeholder="colleague@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-sm text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink-primary block mb-1">المدة الإهدائية</label>
              <select
                name="durationMonths"
                className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-xs font-semibold text-ink-primary bg-white focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="6">6 أشهر</option>
                <option value="12">سنة كاملة (12 شهراً)</option>
                <option value="999">عضوية دائمة مدى الحياة</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              تفعيل العضوية الإهدائية فوراً 🎁
            </button>
          </form>
        </div>

        {/* Payment Gateways Config Status */}
        <div className="bg-white rounded-3xl p-8 border border-lavender-border space-y-6">
          <div>
            <h2 className="text-lg font-bold text-ink-primary">حالة محولات الدفع (Adapters)</h2>
            <p className="text-xs text-ink-secondary mt-1">
              المحول النشط حالياً: <span className="font-mono text-primary font-bold">Simulated Provider</span>
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-lavender-light rounded-xl border border-lavender-border flex items-center justify-between">
              <div>
                <span className="font-bold text-ink-primary block">Simulated Local Provider</span>
                <span className="text-ink-secondary">محاكي التوقيعات الرقمية وفترات التجديد محلياً</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                نشط للاختبار
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-lavender-border flex items-center justify-between">
              <div>
                <span className="font-bold text-ink-primary block">Lemon Squeezy (MoR)</span>
                <span className="text-ink-secondary">ضرائب عالمية، بطاقات، وApple Pay</span>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-ink-secondary font-medium rounded-full text-[10px]">
                جاهز للإنتاج
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-lavender-border flex items-center justify-between">
              <div>
                <span className="font-bold text-ink-primary block">Paymob (MENA / Egypt)</span>
                <span className="text-ink-secondary">محافظ إلكترونية وبطاقات محلية عبر الشرق الأوسط</span>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-ink-secondary font-medium rounded-full text-[10px]">
                جاهز للإنتاج
              </span>
            </div>

            <div className="p-4 bg-white rounded-xl border border-lavender-border flex items-center justify-between">
              <div>
                <span className="font-bold text-ink-primary block">Stripe</span>
                <span className="text-ink-secondary">معالجة البطاقات العالمية وبوابة العملاء</span>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-ink-secondary font-medium rounded-full text-[10px]">
                جاهز للإنتاج
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
