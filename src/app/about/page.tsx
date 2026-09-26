import { getAuthor } from '@/lib/data/article-service';
import { User, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'عن الكاتب والمنصة',
  description: 'فلسفة وايز هوبر في النشر الرقمي العربي المستقل وهندسة النظم.',
};

export default async function AboutPage() {
  const author = await getAuthor();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lavender text-primary text-xs font-semibold rounded-full mb-6">
          <User className="w-3.5 h-3.5" aria-hidden="true" />
          <span>عن الكاتب والمنصة</span>
        </span>

        {author.avatar_url && (
          <div className="relative inline-block mb-6">
            <img
              src={author.avatar_url}
              alt={author.name}
              className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-white shadow-xl ring-4 ring-lavender"
            />
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold text-ink-primary mb-4 tracking-tight">
          {author.name}
        </h1>
        <p className="text-lg text-ink-secondary leading-relaxed max-w-xl mx-auto">
          {author.bio}
        </p>
      </div>

      <div className="editorial-prose">
        <h2>بيان النشر الرقمي العربي المستقل</h2>
        <p>
          تأسست منصة <strong>وايز هوبر</strong> استجابة لحاجة ملحة: تقديم محتوى تقني عربي أصيل ومعمق،
          مكتوب بلغة رصينة وموجه للمهندسين والمصممين وصناع المنتجات الرقمية، بعيداً عن السطحية والترجمات الآلية السريعة.
        </p>

        <h2>مبادئنا الهندسية والتحريرية</h2>
        <ul>
          <li>
            <strong>الكتابة مرة واحدة، والنشر الحتمي:</strong> كل مقال ينطلق من وثيقة MDX واحدة، وتتولد منها مشتقات
            HTML، وMarkdown، وPlain Text تلقائياً وبشكل متطابق دون أدنى انحراف للمحتوى (Zero Content Drift).
          </li>
          <li>
            <strong>احترام الاتجاه والخط العربي:</strong> استخدام الخصائص المنطقية (CSS Logical Properties) وخط
            IBM Plex Sans Arabic مع ضبط دقيق للمقروئية ومسافات الأسطر المناسبة لطبيعة الحرف العربي.
          </li>
          <li>
            <strong>الاستقلالية والاحترام للخصوصية:</strong> نموذج العمل يقوم على اشتراكات القراء الداعمين دون إعلانات
            أو متتبعات خبيثة.
          </li>
        </ul>

        <h2>روابط وتواصل</h2>
        <p>
          يمكنك متابعتي والمشاركة في النقاش وتبادل الأفكار عبر المنصات التالية:
        </p>
        <div className="flex flex-wrap items-center gap-3 not-prose mt-5">
          {Object.entries(author.social_links).map(([network, url]) => (
            <a
              key={network}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-lavender text-primary font-semibold text-xs rounded-xl border border-lavender-border shadow-2xs hover:shadow-xs transition-all"
            >
              <span>{network.toUpperCase()}</span>
              <ExternalLink className="w-3.5 h-3.5 text-primary/70" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
