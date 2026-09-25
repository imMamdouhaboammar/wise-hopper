import Link from 'next/link';
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
        <span className="px-3 py-1 bg-lavender text-primary text-xs font-semibold rounded-full mb-4 inline-block">
          النشرة البريدية المتخصصة
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-ink-primary mb-4">حلقة التفكير الهادئ</h1>
        <p className="text-base sm:text-lg text-ink-secondary leading-relaxed">
          أشاركك مرتين شهرياً خلاصات التجارب الهندسية في بناء النظم الموزعة وتصميم التجارب العربية الأصيلة.
          محتوى خالٍ من الإعلانات تماماً.
        </p>
      </div>

      {/* Subscription Card */}
      <div className="bg-lavender-light border border-lavender-border rounded-3xl p-8 sm:p-12 mb-20">
        <h2 className="text-2xl font-bold text-ink-primary mb-4 text-center">انضم مجاناً</h2>
        <p className="text-sm text-ink-secondary text-center max-w-md mx-auto mb-8">
          اختر المواضيع التي تهمك لتخصيص ما يصل إلى صندوق بريدك:
        </p>

        <form action="/api/newsletter/subscribe" method="POST" className="max-w-lg mx-auto space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-ink-primary block">تفضيلات المواضيع:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {topics.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-lavender-border cursor-pointer hover:border-primary/50 transition-colors text-sm"
                >
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
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="email"
              name="email"
              required
              placeholder="أدخل عنوان بريدك الإلكتروني..."
              className="flex-1 px-4 py-3 bg-white rounded-xl border border-lavender-border text-sm text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-sm transition-colors shrink-0"
            >
              تأكيد الاشتراك
            </button>
          </div>

          <p className="text-xs text-ink-muted text-center">
            تأكيد مزدوج لحماية بريدك. ستصلك رسالة تحتوي على رابط تفعيل بنقرة واحدة.
          </p>
        </form>
      </div>

      {/* Public Newsletter Archive */}
      <div>
        <h2 className="text-2xl font-bold text-ink-primary mb-6">أرشيف الأعداد السابقة</h2>
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-2xl border border-lavender-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
              <span>العدد رقم 12 • 2026-09-15</span>
              <span className="text-primary font-medium">مفتوح للجميع</span>
            </div>
            <h3 className="text-lg font-bold text-ink-primary mb-2">
              لماذا نحتاج إلى معمارية نشر حتمية موحدة؟
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed mb-4">
              مناقشة لمشاكل انحراف المحتوى وكيفية استغلال مكتبات AST لضمان تطابق المقروء في كل الوسائط.
            </p>
            <Link href="/articles/arabic-web-typography-manifesto" className="text-xs font-semibold text-primary hover:underline">
              قراءة العدد في الأرشيف ←
            </Link>
          </div>

          <div className="p-6 bg-white rounded-2xl border border-lavender-border hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between text-xs text-ink-muted mb-2">
              <span>العدد رقم 11 • 2026-09-01</span>
              <span className="text-primary font-medium">مفتوح للجميع</span>
            </div>
            <h3 className="text-lg font-bold text-ink-primary mb-2">
              التصميم التحريري مقابل تصميم تطبيقات SaaS التقليدية
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed mb-4">
              مقارنة بين فلسفة إبراز النص والقراءة الطويلة مقابل لوحات التحكم المزدحمة.
            </p>
            <Link href="/articles" className="text-xs font-semibold text-primary hover:underline">
              قراءة العدد في الأرشيف ←
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
