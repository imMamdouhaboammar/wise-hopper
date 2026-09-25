export const metadata = {
  title: 'العضوية المميزة | وايز هوبر',
  description: 'انضم إلى دائرة القراء الداعمين واحصل على وصول غير محدود لكافة المقالات والأدلة الحصرية.',
};

export default function MembershipPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="px-3 py-1 bg-lavender text-primary text-xs font-semibold rounded-full mb-4 inline-block">
          العضوية والاشتراكات
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-primary mb-6">
          استثمر في المعرفة الهندسية المستقلة
        </h1>
        <p className="text-base sm:text-lg text-ink-secondary leading-relaxed">
          اشتراكك المباشر هو ما يجعل هذه المنصة خالية من الإعلانات ومن الرعايات الموجهة،
          ويتيح لي قضاء عشرات الساعات في كتابة وتدقيق كل مقال ودليل هندسي.
        </p>
      </div>

      {/* Pricing Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
        {/* Monthly Plan */}
        <div className="p-8 bg-white rounded-3xl border border-lavender-border shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-ink-secondary uppercase tracking-wider block mb-2">
              الخطة الشهرية
            </span>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-ink-primary">10$</span>
              <span className="text-sm text-ink-secondary">/ شهرياً</span>
            </div>
            <p className="text-sm text-ink-secondary mb-6">
              خيار مرن يتيح لك الوصول الفوري لكافة المقالات، مع إمكانية الإلغاء في أي لحظة.
            </p>

            <ul className="space-y-3 text-sm text-ink-primary mb-8 border-t border-lavender-border pt-6">
              <li className="flex items-center gap-3">
                <span className="text-primary font-bold">✓</span> الوصول الكامل لجميع المقالات الحصرية
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary font-bold">✓</span> تحميل مشتقات الماركداون والنص النقي
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary font-bold">✓</span> رسائل النشرة التحليلية الخاصة بالمشتركين
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary font-bold">✓</span> دعم مباشر للكاتب والمحتوى التقني العربي
              </li>
            </ul>
          </div>

          <form action="/api/billing/checkout" method="POST">
            <input type="hidden" name="plan" value="monthly" />
            <button
              type="submit"
              className="w-full py-3.5 bg-lavender hover:bg-lavender-dark text-primary font-bold text-sm rounded-xl transition-colors"
            >
              الاشتراك الشهري
            </button>
          </form>
        </div>

        {/* Annual Plan (Featured) */}
        <div className="p-8 bg-linear-to-b from-lavender-light to-white rounded-3xl border-2 border-primary shadow-lg flex flex-col justify-between relative">
          <span className="absolute -top-3 left-8 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full shadow-sm">
            الخيار الأكثر توفيراً (وفر 17%)
          </span>

          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider block mb-2">
              الخطة السنوية
            </span>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-ink-primary">100$</span>
              <span className="text-sm text-ink-secondary">/ سنوياً</span>
            </div>
            <p className="text-sm text-ink-secondary mb-6">
              وصول غير محدود لمدة عام كامل بسعر 10 أشهر فقط، مع أولوية الرد على الأسئلة الهندسية.
            </p>

            <ul className="space-y-3 text-sm text-ink-primary mb-8 border-t border-lavender-border pt-6">
              <li className="flex items-center gap-3">
                <span className="text-primary font-bold">✓</span> كل مزايا الخطة الشهرية
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary font-bold">✓</span> شهران مجاناً سنوياً (وفر 17%)
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary font-bold">✓</span> اقتراح موضوعات معمارية لمناقشتها في المقالات القادمة
              </li>
              <li className="flex items-center gap-3">
                <span className="text-primary font-bold">✓</span> دعوة لجلسة حوارية ربع سنوية مغلقة
              </li>
            </ul>
          </div>

          <form action="/api/billing/checkout" method="POST">
            <input type="hidden" name="plan" value="annual" />
            <button
              type="submit"
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-xl shadow-md transition-colors"
            >
              الاشتراك السنوي الموفر
            </button>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-ink-primary mb-8 text-center">الأسئلة الشائعة</h2>
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-2xl border border-lavender-border">
            <h3 className="font-bold text-sm text-ink-primary mb-2">ما هي وسائل الدفع المدعومة؟</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              ندعم الدفع المشفر عبر البطاقات الائتمانية والخصم المباشر (Visa، Mastercard)،
              وApple Pay عبر مزودي الدفع المعتمدين (Lemon Squeezy، Paymob، وStripe).
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-lavender-border">
            <h3 className="font-bold text-sm text-ink-primary mb-2">كيف يمكنني إلغاء اشتراكي؟</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              يمكنك إلغاء الاشتراك بنقرة واحدة من صفحة حسابك في أي وقت. سيبقى وصولك للمحتوى فعالاً
              حتى نهاية فترة الفاتورة الحالية دون تجديد تلقائي.
            </p>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-lavender-border">
            <h3 className="font-bold text-sm text-ink-primary mb-2">هل تتوفر عضويات مجانية للطلاب والباحثين؟</h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              نعم، أمنح اشتراكات مجانية كاملة للطلاب والباحثين غير القادرين على الدفع.
              راسلني مباشرة عبر البريد الإلكتروني لشرح اهتمامك وسأفعل حسابك دون أي حرج.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
