import Link from 'next/link';
import { Lock, ShieldCheck, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';

export function PaywallCard() {
  return (
    <div className="my-14 p-8 sm:p-12 bg-linear-to-b from-lavender-light via-white to-lavender-light/40 rounded-3xl border-2 border-primary/25 shadow-xl text-center relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-primary via-[#9B82F3] to-primary" />
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-full mb-5 border border-primary/20 shadow-2xs">
          <Lock className="w-3.5 h-3.5" aria-hidden="true" />
          <span>محتوى تحليلي حصري لأعضاء العضوية المميزة</span>
        </div>

        <h3 className="text-2xl sm:text-3xl font-bold text-ink-primary mb-4 tracking-tight">
          تابع قراءة هذا التحليل المعماري الكامل
        </h3>

        <p className="text-base text-ink-secondary max-w-xl mx-auto mb-8 leading-relaxed">
          اشترك لتصل فوراً إلى كامل التحليل المعماري، والمخططات البيانية التفاعلية، ومشتقات الماركداون والنص النقي للأرشفة الشخصية والتحليل.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
          <div className="p-5 rounded-2xl bg-white border border-lavender-border shadow-2xs hover:border-primary/40 transition-all text-right">
            <span className="text-xs font-semibold text-ink-secondary block mb-1">الاشتراك الشهري</span>
            <div className="text-2xl font-bold text-ink-primary mb-2">
              10$ <span className="text-xs font-normal text-ink-secondary">/ شهرياً</span>
            </div>
            <p className="text-xs text-ink-muted">مرونة كاملة مع إمكانية الإلغاء في أي وقت بنقرة واحدة.</p>
          </div>

          <div className="p-5 rounded-2xl bg-lavender/50 border-2 border-primary shadow-xs text-right relative">
            <span className="absolute top-3 left-3 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full shadow-2xs">
              وفر 17%
            </span>
            <span className="text-xs font-semibold text-primary block mb-1">الاشتراك السنوي (الأفضل)</span>
            <div className="text-2xl font-bold text-ink-primary mb-2">
              100$ <span className="text-xs font-normal text-ink-secondary">/ سنوياً</span>
            </div>
            <p className="text-xs text-ink-secondary">وصول غير محدود لعام كامل (شهران مجاناً).</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-6">
          <Link
            href="/membership"
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <span>اشترك الآن وابدأ القراءة</span>
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            href="/account"
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-lavender text-ink-primary text-sm font-semibold rounded-xl border border-lavender-border transition-colors shadow-2xs"
          >
            تسجيل دخول مشترك
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>بدون إعلانات</span>
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>حماية الخادم Zero-Leakage</span>
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>مشتقات AST فورية</span>
          </span>
        </div>
      </div>
    </div>
  );
}
