import { redirect } from 'next/navigation';
import {
  CreditCard,
  Gift,
  ShieldCheck,
  Globe,
  Wallet,
  Sparkles,
  Layers,
} from 'lucide-react';
import { verifyOwnerSession } from '@/lib/auth/session';

export const metadata = {
  title: 'إدارة العضويات وبوابات الدفع | استوديو وايز هوبر',
};

export default async function StudioBillingPage() {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    redirect('/account?error=unauthorized_studio');
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lavender-light border border-lavender-border rounded-full text-xs font-semibold text-primary mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>إدارة التدفقات المالية والعضويات</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink-primary tracking-tight">
            إدارة العضويات وبوابات الدفع
          </h1>
          <p className="text-xs md:text-sm text-ink-secondary mt-1 max-w-xl">
            إعداد خطط الاشتراك، منح العضويات الإهدائية المجانية، ومراقبة حالة الربط مع محولات الدفع.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            حالة الفوترة: نشطة ومحمية
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Complimentary Membership Grant Tool */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-lavender-border shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-lavender-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lavender-light text-primary flex items-center justify-center font-bold">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-ink-primary">منح عضوية إهدائية مجانية</h2>
                <p className="text-xs text-ink-secondary">وصول غير محدود بدون قيود مالية</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-lavender text-primary text-[11px] font-bold rounded-lg font-mono">
              VIP Pass
            </span>
          </div>

          <p className="text-xs text-ink-secondary leading-relaxed">
            امنح وصولاً غير محدود لأحد الطلاب أو الباحثين أو الزملاء التحريريين دون الحاجة لإدخال بيانات بنكية.
          </p>

          <form action="/api/billing/grant-complimentary" method="POST" className="space-y-4">
            <div>
              <label className="text-xs font-bold text-ink-primary block mb-1.5">
                البريد الإلكتروني للمستفيد
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="colleague@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-sm text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink-primary block mb-1.5">المدة الإهدائية</label>
              <select
                name="durationMonths"
                aria-label="المدة الإهدائية"
                className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-xs font-semibold text-ink-primary bg-white focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              >
                <option value="6">6 أشهر (نصف سنوي)</option>
                <option value="12">سنة كاملة (12 شهراً)</option>
                <option value="999">عضوية دائمة مدى الحياة (Lifetime)</option>
              </select>
            </div>

            <div className="p-3 bg-lavender-light/40 border border-lavender-border/80 rounded-xl text-[11px] text-ink-secondary flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>سيتم إرسال بريد ترحيبي للمستفيد يحتوي على رابط الدخول الفوري.</span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Gift className="w-4 h-4" />
              <span>تفعيل العضوية الإهدائية فوراً</span>
            </button>
          </form>
        </div>

        {/* Payment Gateways Config Status */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-lavender-border shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-lavender-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lavender-light text-primary flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-ink-primary">حالة محولات الدفع</h2>
                <p className="text-xs text-ink-secondary">تكامل البوابات والربط الشبكي</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200">
              Adapters Ready
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Simulated Provider */}
            <div className="p-4 bg-lavender-light/50 rounded-2xl border border-primary/20 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="font-bold text-ink-primary">Simulated Local Provider</span>
                </div>
                <span className="text-[11px] text-ink-secondary block">
                  محاكي التوقيعات الرقمية وفترات التجديد محلياً
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                نشط للاختبار
              </span>
            </div>

            {/* Lemon Squeezy */}
            <div className="p-4 bg-white rounded-2xl border border-lavender-border hover:bg-slate-50/50 transition-colors flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-ink-muted" />
                  <span className="font-bold text-ink-primary">Lemon Squeezy (MoR)</span>
                </div>
                <span className="text-[11px] text-ink-secondary block">
                  ضرائب عالمية، بطاقات ائتمانية، و Apple Pay
                </span>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-ink-secondary font-medium rounded-full text-[10px]">
                جاهز للإنتاج
              </span>
            </div>

            {/* Paymob */}
            <div className="p-4 bg-white rounded-2xl border border-lavender-border hover:bg-slate-50/50 transition-colors flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-ink-muted" />
                  <span className="font-bold text-ink-primary">Paymob (MENA / Egypt)</span>
                </div>
                <span className="text-[11px] text-ink-secondary block">
                  محافظ إلكترونية وبطاقات محلية (ميزة، فودافون كاش)
                </span>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 text-ink-secondary font-medium rounded-full text-[10px]">
                جاهز للإنتاج
              </span>
            </div>

            {/* Stripe */}
            <div className="p-4 bg-white rounded-2xl border border-lavender-border hover:bg-slate-50/50 transition-colors flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-ink-muted" />
                  <span className="font-bold text-ink-primary">Stripe Custom Portal</span>
                </div>
                <span className="text-[11px] text-ink-secondary block">
                  معالجة البطاقات العالمية وبوابة العملاء الذاتية
                </span>
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

