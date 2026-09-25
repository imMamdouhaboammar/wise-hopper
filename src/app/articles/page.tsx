import Link from 'next/link';
import { getPublishedArticles, getAllTopics } from '@/lib/data/article-service';

export const metadata = {
  title: 'المقالات والأرشيف الكامل',
  description: 'تصفح جميع المقالات والدراسات التحريرية المنشورة في هندسة النظم والتصميم العربي.',
};

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; topic?: string }>;
}) {
  const { query, topic } = await searchParams;
  const [articles, topics] = await Promise.all([
    getPublishedArticles(query, topic),
    getAllTopics(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-ink-primary mb-4">أرشيف المقالات</h1>
        <p className="text-base text-ink-secondary">
          جميع ما تم نشره متاح للقراءة المريحة على الويب، ومتاح كنسخ ماركداون ونص عادي للتحليل والأرشفة.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 bg-lavender-light/60 p-6 rounded-2xl border border-lavender-border">
        {/* Search Input Form */}
        <form method="GET" action="/articles" className="w-full md:w-96 flex gap-2">
          <input
            type="text"
            name="query"
            defaultValue={query || ''}
            placeholder="ابحث في المقالات (يدعم التجريد والهمزات)..."
            className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-sm bg-white text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          />
          {topic && <input type="hidden" name="topic" value={topic} />}
          <button
            type="submit"
            className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
          >
            بحث
          </button>
        </form>

        {/* Topic Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/articles"
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !topic
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white text-ink-secondary hover:text-primary border border-lavender-border'
            }`}
          >
            الكل
          </Link>
          {topics.map((t) => {
            const isActive = topic === t.slug;
            return (
              <Link
                key={t.id}
                href={`/articles?topic=${t.slug}${query ? `&query=${encodeURIComponent(query)}` : ''}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-white text-ink-secondary hover:text-primary border border-lavender-border'
                }`}
              >
                {t.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Articles Listing */}
      {articles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-lavender-border">
          <p className="text-lg text-ink-secondary mb-4">لم يتم العثور على مقالات تطابق هذا البحث.</p>
          <Link href="/articles" className="text-sm font-semibold text-primary hover:underline">
            إعادة تعيين الفلاتر
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-lavender-border p-6 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-ink-secondary">
                    {article.reading_time_minutes} دقائق قراءة
                  </span>
                  {article.visibility === 'PREMIUM' ? (
                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                      حصري للمشتركين
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-lavender text-ink-secondary text-xs font-semibold rounded-full">
                      مقال مفتوح
                    </span>
                  )}
                </div>

                <h2 className="text-xl font-bold text-ink-primary hover:text-primary transition-colors leading-snug mb-3">
                  <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                </h2>

                <p className="text-sm text-ink-secondary leading-relaxed mb-6">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-lavender-border flex items-center justify-between text-xs">
                <span className="text-ink-muted">{article.published_at?.slice(0, 10)}</span>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/content/${article.slug}.md`}
                    className="text-ink-secondary hover:text-primary font-mono"
                    title="تحميل كماركداون"
                  >
                    .md
                  </Link>
                  <Link
                    href={`/content/${article.slug}.txt`}
                    className="text-ink-secondary hover:text-primary font-mono"
                    title="تحميل كنص عادي"
                  >
                    .txt
                  </Link>
                  <Link
                    href={`/articles/${article.slug}`}
                    className="font-semibold text-primary hover:underline"
                  >
                    اقرأ ←
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
