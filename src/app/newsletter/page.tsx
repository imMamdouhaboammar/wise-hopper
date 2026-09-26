import Link from 'next/link';
import {
  Mail,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Inbox,
  BookOpen,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { getAllTopics } from '@/lib/data/article-service';

export const metadata = {
  title: 'النشرة البريدية | حلقة التفكير الهادئ',
  description: 'نشرة دورية متخصصة ترسل مقالات ودراسات معمقة في هندسة البرمجيات والتصميم العربي.',
};

export default async function NewsletterPage(props: {
  searchParams?: Promise<{
    pending_confirmation?: string;
    confirmed?: string;
    unsubscribed?: string;
    error?: string;
  }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isPending = searchParams.pending_confirmation === 'true';
  const isConfirmed = searchParams.confirmed === 'true';
  const isUnsubscribed = searchParams.unsubscribed === 'true';
  const error = searchParams.error;

  const topics = await getAllTopics();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-16">
      <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lavender text-primary text-xs font-semibold rounded-full mb-3.5">
          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
          <span>النشرة البريدية المتخصصة</span>
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink-primary mb-4 tracking-tight">
          حلقة التفكير الهادئ
        </h1>
        <p className="text-base text-ink-secondary leading-relaxed">
          أشاركك مرتين شهرياً خلاصات التجارب المعمارية في بناء النظم الموزعة وتصميم التجارب العربية الأصيلة.
          محتوى تحليلي خالٍ من الإعلانات تماماً.
        </p>
      </div>

      {/* Notification Banners */}
      <div className="max-w-4xl mx-auto">
        {isPending && (
          <div className="mb-8 p-5 bg-lavender-light border border-primary/20 rounded-2xl flex items-start gap-3 text-ink-primary shadow-xs animate-in fade-in">
            <Inbox className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-primary mb-1">تفقد بريدك الإلكتروني لتأكيد الاشتراك</h3>
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed">
                أرسلنا لك رسالة تحتوي على رابط لتفعيل اشتراكك في النشرة (صالح لمدة 24 ساعة). يرجى فتح الرسالة والنقر على "تأكيد الاشتراك".
              </p>
            </div>
          </div>
        )}

        {isConfirmed && (
          <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-950 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-emerald-800 mb-1">تم تأكيد اشتراكك بنجاح! ✨</h3>
              <p className="text-xs sm:text-sm text-emerald-700 leading-relaxed">
                أهلاً بك في حلقة التفكير الهادئ. ستصلك أعداد النشرة دورياً، وتجد دائماً أحدث الإصدارات في الأرشيف أدناه.
              </p>
            </div>
          </div>
        )}

        {isUnsubscribed && (
          <div className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-slate-800 shadow-xs animate-in fade-in">
            <Sparkles className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">تم إلغاء اشتراكك بنجاح</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                لن تستلم أي رسائل بريدية إضافية من وايز هوبر. نأسف لرؤيتك تغادر، وبإمكانك العودة والاشتراك مجدداً في أي وقت.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-950 shadow-xs animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-rose-800 mb-1">تعذر إتمام العملية</h3>
              <p className="text-xs sm:text-sm text-rose-700 leading-relaxed">
                {error === 'invalid_or_expired_token'
                  ? 'رابط التأكيد منتهي الصلاحية أو غير صالح. يرجى إعادة إدخال بريدك الإلكتروني أدناه.'
                  : 'حدث خطأ في معالجة طلبك. يرجى إعادة المحاولة.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Card */}
      <div className="max-w-4xl mx-auto bg-white border border-lavender-border/70 rounded-3xl p-6 sm:p-10 lg:p-12 mb-20 shadow-soft-sm">
        <div className="w-12 h-12 rounded-2xl bg-lavender/70 text-primary flex items-center justify-center mx-auto mb-4 shadow-soft-xs">
          <Inbox className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-ink-primary mb-2 text-center tracking-tight">
          انضم إلى المشتركين مجاناً
        </h2>
        <p className="text-sm text-ink-secondary text-center max-w-md mx-auto mb-8 leading-relaxed">
          اختر الموضوعات التي تهمك لتخصيص ما يصل إلى صندوق بريدك بدقة:
        </p>

        <form action="/api/newsletter/subscribe" method="POST" className="max-w-xl mx-auto space-y-6">
          <div className="space-y-3">
            <span className="text-xs sm:text-sm font-bold text-ink-primary block">تفضيلات المواضيع:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topics.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center gap-3 p-3 bg-background/50 rounded-xl border border-lavender-border/70 cursor-pointer hover:border-primary/40 hover:bg-lavender/40 transition-all text-sm shadow-soft-xs group"
                >
                  <input
                    type="checkbox"
                    name="topics"
                    value={t.slug}
                    defaultChecked
                    className="accent-primary w-4 h-4 rounded-sm cursor-pointer"
                  />
                  <span className="text-ink-primary font-medium group-hover:text-primary transition-colors">
                    {t.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="email"
              name="email"
              required
              placeholder="أدخل عنوان بريدك الإلكتروني..."
              className="flex-1 px-4 py-3 bg-background/50 focus:bg-white rounded-xl border border-lavender-border/70 text-sm text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20 shadow-2xs transition-all"
            />
            <button
              type="submit"
              className="px-7 py-3 bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-sm font-semibold rounded-xl shadow-soft-xs hover:shadow-soft-sm transition-all shrink-0 cursor-pointer active:scale-[0.98]"
            >
              تأكيد الاشتراك
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-ink-muted">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>تأكيد مزدوج للأمان. يمكنك إلغاء الاشتراك بنقرة واحدة في أي وقت.</span>
          </div>
        </form>
      </div>

      {/* Public Newsletter Archive */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2.5 mb-8">
          <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
          <h2 className="text-xl sm:text-2xl font-bold text-ink-primary tracking-tight">أرشيف الأعداد السابقة</h2>
        </div>

        <div className="space-y-6">
          <div className="p-6 sm:p-8 bg-white rounded-2xl sm:rounded-3xl border border-lavender-border/70 hover:shadow-soft-md hover:border-primary/30 transition-all shadow-soft-xs">
            <div className="flex items-center justify-between text-xs text-ink-muted mb-3">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                <span>العدد رقم 12 • 2026-09-15</span>
              </span>
              <span className="px-3 py-0.5 bg-emerald-50 text-emerald-700 font-medium rounded-full border border-emerald-100">
                مفتوح للجميع
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-ink-primary mb-2.5 hover:text-primary transition-colors leading-snug">
              <Link href="/articles/arabic-web-typography-manifesto">
                لماذا نحتاج إلى معمارية نشر حتمية موحدة؟
              </Link>
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed mb-4">
              مناقشة لمشاكل انحراف المحتوى وكيفية استغلال مكتبات AST لضمان تطابق المقروء في كل الوسائط الرقمية.
            </p>
            <Link
              href="/articles/arabic-web-typography-manifesto"
              className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>قراءة العدد في الأرشيف</span>
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="p-6 sm:p-8 bg-white rounded-2xl sm:rounded-3xl border border-lavender-border/70 hover:shadow-soft-md hover:border-primary/30 transition-all shadow-soft-xs">
            <div className="flex items-center justify-between text-xs text-ink-muted mb-3">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                <span>العدد رقم 11 • 2026-09-01</span>
              </span>
              <span className="px-3 py-0.5 bg-emerald-50 text-emerald-700 font-medium rounded-full border border-emerald-100">
                مفتوح للجميع
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-ink-primary mb-2.5 hover:text-primary transition-colors leading-snug">
              <Link href="/articles">
                التصميم التحريري مقابل تصميم تطبيقات SaaS التقليدية
              </Link>
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed mb-4">
              مقارنة بين فلسفة إبراز النص والقراءة المركزة المتصلة مقابل لوحات التحكم المزدحمة بالضجيج.
            </p>
            <Link
              href="/articles"
              className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>قراءة العدد في الأرشيف</span>
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
