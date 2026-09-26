import {
  Sparkles,
  Check,
  ShieldCheck,
  CreditCard,
  RefreshCcw,
  GraduationCap,
  ArrowLeft,
  Lock,
  Zap,
} from 'lucide-react';

export const metadata = {
  title: 'العضوية المميزة | وايز هوبر',
  description: 'انضم إلى دائرة القراء الداعمين واحصل على وصول غير محدود لكافة المقالات والأدلة الحصرية.',
};

export default function MembershipPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lavender text-primary text-xs font-semibold rounded-full mb-4">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>العضوية والاشتراكات المستقلة</span>
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-primary mb-6 tracking-tight">
          استثمر في المعرفة الهندسية المستقلة
        </h1>
        <p className="text-base sm:text-lg text-ink-secondary leading-relaxed">
          اشتراكك المباشر هو ما يجعل هذه المنصة خالية من الإعلانات ومن الرعايات الموجهة،
          ويتيح لي قضاء عشرات الساعات في كتابة وتدقيق كل مقال ودليل معماري.
        </p>
      </div>

      {/* Pricing Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
        {/* Monthly Plan */}
        <div className="p-8 bg-white rounded-3xl border border-lavender-border shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider">
                الخطة الشهرية
              </span>
              <span className="px-2.5 py-0.5 bg-lavender-light text-ink-secondary text-[11px] font-semibold rounded-full">
                مرونة تامة
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-ink-primary">10$</span>
              <span className="text-sm text-ink-secondary">/ شهرياً</span>
            </div>
            <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
              خيار مرن يتيح لك الوصول الفوري لكافة المقالات، مع إمكانية الإلغاء في أي لحظة بنقرة واحدة.
            </p>

            <ul className="space-y-3.5 text-sm text-ink-primary mb-8 border-t border-lavender-border pt-6">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-lavender text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>الوصول الكامل لجميع المقالات الحصرية</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-lavender text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>تحميل مشتقات الماركداون والنص النقي للأرشفة</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-lavender text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>رسائل النشرة التحليلية الخاصة بالمشتركين</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-lavender text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>دعم مباشر للكاتب والمحتوى التقني العربي الرصين</span>
              </li>
            </ul>
          </div>

          <form action="/api/billing/checkout" method="POST">
            <input type="hidden" name="plan" value="monthly" />
            <button
              type="submit"
              className="w-full py-3.5 bg-lavender hover:bg-lavender-dark text-primary font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              الاشتراك الشهري
            </button>
          </form>
        </div>

        {/* Annual Plan (Featured) */}
        <div className="p-8 bg-linear-to-b from-lavender-light via-white to-lavender-light/30 rounded-3xl border-2 border-primary shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col justify-between relative overflow-hidden">
          <span className="absolute -top-1 left-8 px-3.5 py-1 bg-primary text-white text-xs font-bold rounded-b-xl shadow-xs">
            الخيار الأكثر توفيراً (وفر 17%)
          </span>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span>الخطة السنوية</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-ink-primary">100$</span>
              <span className="text-sm text-ink-secondary">/ سنوياً</span>
            </div>
            <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
              وصول غير محدود لعام كامل بسعر 10 أشهر فقط، مع أولوية الرد المباشر على الاستفسارات المعمارية.
            </p>

            <ul className="space-y-3.5 text-sm text-ink-primary mb-8 border-t border-lavender-border pt-6">
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span className="font-semibold">كل مزايا الخطة الشهرية</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span className="font-semibold text-primary">شهران مجاناً سنوياً (وفر 17%)</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>اقتراح موضوعات معمارية لمناقشتها في المقالات القادمة</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </span>
                <span>دعوة لجلسة حوارية ربع سنوية مغلقة عبر الفيديو</span>
              </li>
            </ul>
          </div>

          <form action="/api/billing/checkout" method="POST">
            <input type="hidden" name="plan" value="annual" />
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary-hover active:bg-primary-active text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer active:scale-[0.98]"
            >
              <span>الاشتراك السنوي الموفر</span>
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      {/* Trust & Guarantee Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20 p-6 bg-lavender-light/50 rounded-2xl border border-lavender-border text-center text-xs">
        <div className="flex items-center justify-center gap-2 text-ink-secondary">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>حماية وتشفير SSL لبيانات الدفع</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-ink-secondary">
          <RefreshCcw className="w-4 h-4 text-emerald-600" />
          <span>إلغاء التجديد بنقرة واحدة في أي وقت</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-ink-secondary">
          <Lock className="w-4 h-4 text-primary" />
          <span>صفر إعلانات وصفر متتبعات تجارية</span>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-ink-primary mb-8 text-center tracking-tight">الأسئلة الشائعة</h2>
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-2xl border border-lavender-border shadow-2xs">
            <div className="flex items-center gap-2.5 mb-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-ink-primary">ما هي وسائل الدفع المدعومة؟</h3>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed pr-6.5">
              ندعم الدفع المشفر عبر البطاقات الائتمانية والخصم المباشر (Visa، Mastercard)،
              وApple Pay عبر مزودي الدفع المعتمدين (Lemon Squeezy، Paymob، وStripe).
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-lavender-border shadow-2xs">
            <div className="flex items-center gap-2.5 mb-2">
              <RefreshCcw className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-ink-primary">كيف يمكنني إلغاء اشتراكي؟</h3>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed pr-6.5">
              يمكنك إلغاء الاشتراك بنقرة واحدة من صفحة حسابك في أي وقت. سيبقى وصولك للمحتوى فعالاً
              حتى نهاية فترة الفاتورة الحالية دون تجديد تلقائي.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-lavender-border shadow-2xs">
            <div className="flex items-center gap-2.5 mb-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-ink-primary">هل تتوفر عضويات مجانية للطلاب والباحثين؟</h3>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed pr-6.5">
              نعم، أمنح اشتراكات مجانية كاملة للطلاب والباحثين غير القادرين على الدفع.
              راسلني مباشرة عبر البريد الإلكتروني لشرح اهتمامك وسأفعل حسابك بكل سرور.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
