import Link from 'next/link';

export function PaywallCard() {
  return (
    <div className="my-12 p-8 sm:p-10 bg-linear-to-b from-lavender-light to-white rounded-3xl border-2 border-primary/20 shadow-xl text-center relative overflow-hidden">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mb-4">
        <span>🔒</span>
        <span>محتوى حصري لأعضاء العضوية المميزة</span>
      </div>

      <h3 className="text-2xl sm:text-3xl font-bold text-ink-primary mb-4">
        تابع قراءة هذا التحليل المعماري الكامل
      </h3>

      <p className="text-base text-ink-secondary max-w-xl mx-auto mb-8 leading-relaxed">
        تحصل باشتراكك على الوصول الكامل لكافة الأدلة الهندسية التحريرية، والرسوم البيانية التفاعلية،
        وإمكانية تحميل مشتقات الماركداون والنص النقي للأرشفة الذاتية.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
        <div className="p-5 rounded-2xl bg-white border border-lavender-border shadow-xs hover:border-primary transition-colors text-right">
          <span className="text-xs font-semibold text-ink-secondary block mb-1">الاشتراك الشهري</span>
          <div className="text-2xl font-bold text-ink-primary mb-2">
            10$ <span className="text-xs font-normal text-ink-secondary">/ شهرياً</span>
          </div>
          <p className="text-xs text-ink-muted">مرونة كاملة مع إمكانية الإلغاء في أي وقت.</p>
        </div>

        <div className="p-5 rounded-2xl bg-lavender/50 border-2 border-primary shadow-xs text-right relative">
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-full">
            وفر 17%
          </span>
          <span className="text-xs font-semibold text-primary block mb-1">الاشتراك السنوي (الأفضل)</span>
          <div className="text-2xl font-bold text-ink-primary mb-2">
            100$ <span className="text-xs font-normal text-ink-secondary">/ سنوياً</span>
          </div>
          <p className="text-xs text-ink-secondary">وصول غير محدود لمدة عام كامل مع التحديثات.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/membership"
          className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-md transition-all"
        >
          اشترك الآن وابدأ القراءة
        </Link>
        <Link
          href="/account"
          className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-lavender text-ink-primary text-sm font-semibold rounded-xl border border-lavender-border transition-colors"
        >
          أنا مشترك بالفعل (تسجيل الدخول)
        </Link>
      </div>
    </div>
  );
}
