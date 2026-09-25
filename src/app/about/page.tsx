import { getAuthor } from '@/lib/data/article-service';

export const metadata = {
  title: 'عن الكاتب والمنصة',
  description: 'فلسفة وايز هوبر في النشر الرقمي العربي المستقل وهندسة النظم.',
};

export default async function AboutPage() {
  const author = await getAuthor();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        {author.avatar_url && (
          <img
            src={author.avatar_url}
            alt={author.name}
            className="w-24 h-24 rounded-full mx-auto mb-6 object-cover border-4 border-lavender shadow-md"
          />
        )}
        <h1 className="text-3xl sm:text-4xl font-bold text-ink-primary mb-4">{author.name}</h1>
        <p className="text-lg text-ink-secondary leading-relaxed">{author.bio}</p>
      </div>

      <div className="editorial-prose">
        <h2>بيان النشر الرقمي العربي المستقل</h2>
        <p>
          تأسست منصة <strong>وايز هوبر</strong> استجابة لحاجة ملحة: تقديم محتوى تقني عربي أصيل ومعمق،
          مكتوب بلغة رصينة وموجه للمهندسين والمصممين وصناع المنتجات الرقمية، بعيداً عن السطحية والترجمات الآلية السريعة.
        </p>

        <h2>مبادئنا الهندسية</h2>
        <ul>
          <li>
            <strong>الكتابة مرة واحدة، والنشر الحتمي:</strong> كل مقال ينطلق من وثيقة MDX واحدة، وتتولد منها مشتقات
            HTML، وMarkdown، وPlain Text تلقائياً وبشكل متطابق دون أدنى انحراف للمحتوى.
          </li>
          <li>
            <strong>احترام الاتجاه والخط العربي:</strong> استخدام الخصائص المنطقية (CSS Logical Properties) وخط
            IBM Plex Sans Arabic مع ضبط دقيق للمقروئية ومسافات الأسطر.
          </li>
          <li>
            <strong>الاستقلالية والاحترام للخصوصية:</strong> نموذج العمل يقوم على اشتراكات القراء الداعمين دون إعلانات
            أو متتبعات خبيثة.
          </li>
        </ul>

        <h2>روابط وتواصل</h2>
        <p>
          يمكنك متابعتي والمشاركة في النقاش عبر المنصات التالية:
        </p>
        <div className="flex items-center gap-4 not-prose mt-4">
          {Object.entries(author.social_links).map(([network, url]) => (
            <a
              key={network}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-lavender text-primary font-semibold text-xs rounded-xl hover:bg-lavender-dark transition-colors"
            >
              {network.toUpperCase()}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
