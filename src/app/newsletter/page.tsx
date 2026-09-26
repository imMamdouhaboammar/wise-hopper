import Link from 'next/link';
import {
  Mail,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  Sparkles,
  Inbox,
  BookOpen,
} from 'lucide-react';
import { getAllTopics } from '@/lib/data/article-service';

export const metadata = {
  title: 'النشرة البريدية | حلقة التفكير الهادئ',
  description: 'نشرة دورية متخصصة ترسل مقالات ودراسات معمقة في هندسة البرمجيات والتصميم العربي.',
};

export default async function NewsletterPage() {
  const topics = await getAllTopics();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lavender text-primary text-xs font-semibold rounded-full mb-4">
          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
          <span>النشرة البريدية المتخصصة</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-ink-primary mb-4 tracking-tight">
          حلقة التفكير الهادئ
        </h1>
        <p className="text-base sm:text-lg text-ink-secondary leading-relaxed">
          أشاركك مرتين شهرياً خلاصات التجارب المعمارية في بناء النظم الموزعة وتصميم التجارب العربية الأصيلة.
          محتوى تحليلي خالٍ من الإعلانات تماماً.
        </p>
      </div>

      {/* Subscription Card */}
      <div className="bg-linear-to-bl from-lavender-light via-white to-lavender-light/50 border border-lavender-border rounded-3xl p-8 sm:p-12 mb-20 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-lavender text-primary flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-6 h-6" aria-hidden="true" />
        </div>
        <h2 className="text-2xl font-bold text-ink-primary mb-2 text-center tracking-tight">
          انضم إلى المشتركين مجاناً
        </h2>
        <p className="text-sm text-ink-secondary text-center max-w-md mx-auto mb-8 leading-relaxed">
          اختر الموضوعات التي تهمك لتخصيص ما يصل إلى صندوق بريدك بدقة:
        </p>

        <form action="/api/newsletter/subscribe" method="POST" className="max-w-lg mx-auto space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-ink-primary block">تفضيلات المواضيع:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topics.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-lavender-border cursor-pointer hover:border-primary/50 hover:bg-lavender-light/40 transition-all text-sm shadow-2xs group"
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
              className="flex-1 px-4 py-3.5 bg-white rounded-xl border border-lavender-border text-sm text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20 shadow-2xs"
            />
            <button
              type="submit"
              className="px-8 py-3.5 bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-md transition-all shrink-0 cursor-pointer active:scale-[0.98]"
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
      <div>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
          <h2 className="text-2xl font-bold text-ink-primary tracking-tight">أرشيف الأعداد السابقة</h2>
        </div>

        <div className="space-y-4">
          <div className="p-6 bg-white rounded-2xl border border-lavender-border hover:shadow-md hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between text-xs text-ink-muted mb-3">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-ink-muted" />
                <span>العدد رقم 12 • 2026-09-15</span>
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-100">
                مفتوح للجميع
              </span>
            </div>
            <h3 className="text-lg font-bold text-ink-primary mb-2 hover:text-primary transition-colors">
              <Link href="/articles/arabic-web-typography-manifesto">
                لماذا نحتاج إلى معمارية نشر حتمية موحدة؟
              </Link>
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed mb-4">
              مناقشة لمشاكل انحراف المحتوى وكيفية استغلال مكتبات AST لضمان تطابق المقروء في كل الوسائط الرقمية.
            </p>
            <Link
              href="/articles/arabic-web-typography-manifesto"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>قراءة العدد في الأرشيف</span>
              <ArrowLeft className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-lavender-border hover:shadow-md hover:border-primary/30 transition-all">
            <div className="flex items-center justify-between text-xs text-ink-muted mb-3">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-ink-muted" />
                <span>العدد رقم 11 • 2026-09-01</span>
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded-full border border-emerald-100">
                مفتوح للجميع
              </span>
            </div>
            <h3 className="text-lg font-bold text-ink-primary mb-2 hover:text-primary transition-colors">
              <Link href="/articles">
                التصميم التحريري مقابل تصميم تطبيقات SaaS التقليدية
              </Link>
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed mb-4">
              مقارنة بين فلسفة إبراز النص والقراءة المركزة المتصلة مقابل لوحات التحكم المزدحمة بالضجيج.
            </p>
            <Link
              href="/articles"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              <span>قراءة العدد في الأرشيف</span>
              <ArrowLeft className="w-3 h-3" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
