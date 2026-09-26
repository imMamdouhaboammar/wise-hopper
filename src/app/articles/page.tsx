import Link from 'next/link';
import {
  Search,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Filter,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
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

  const hasActiveFilters = Boolean(query || topic);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 sm:py-16">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lavender/70 text-primary text-xs font-semibold rounded-full mb-3">
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>الأرشيف التحريري</span>
        </span>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-ink-primary mb-3 tracking-tight">
          أرشيف المقالات والدراسات
        </h1>
        <p className="text-base text-ink-secondary leading-relaxed">
          جميع ما تم نشره متاح للقراءة المريحة على الويب، ومتاح كنسخ ماركداون ونص نقي للأرشفة الشخصية والتحليل التقني.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-12 bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-lavender-border/70 shadow-soft-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-5">
          {/* Search Input Form */}
          <form method="GET" action="/articles" className="relative flex-1 max-w-md">
            <div className="relative">
              <Search
                className="w-4 h-4 text-ink-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                name="query"
                defaultValue={query || ''}
                placeholder="ابحث في العناوين والمحتوى..."
                className="w-full pr-10 pl-20 py-2.5 sm:py-3 rounded-xl border border-lavender-border/70 text-sm bg-background/50 focus:bg-white text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20 shadow-2xs transition-all"
              />
              {topic && <input type="hidden" name="topic" value={topic} />}
              <button
                type="submit"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1.5 bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-soft-xs"
              >
                بحث
              </button>
            </div>
          </form>

          {/* Topic Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-ink-muted ml-1.5">
              <Filter className="w-3.5 h-3.5" aria-hidden="true" />
              <span>الموضوع:</span>
            </div>
            <Link
              href="/articles"
              className={`px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-medium transition-all ${
                !topic
                  ? 'bg-primary text-white shadow-soft-xs'
                  : 'bg-white text-ink-secondary hover:text-ink-primary hover:bg-lavender/60 border border-lavender-border/70'
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
                  className={`px-3.5 py-1.5 sm:py-2 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-soft-xs'
                      : 'bg-white text-ink-secondary hover:text-ink-primary hover:bg-lavender/60 border border-lavender-border/70'
                  }`}
                >
                  {t.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Active Filter Status Indicator */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-lavender-border/50 flex items-center justify-between text-xs">
            <span className="text-ink-secondary">
              تم العثور على <strong className="text-ink-primary">{articles.length}</strong> مقال
              {topic && ` في تصنيف "${topics.find((t) => t.slug === topic)?.name || topic}"`}
              {query && ` لكلمة البحث "${query}"`}
            </span>
            <Link
              href="/articles"
              className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>إعادة تعيين الفلاتر</span>
            </Link>
          </div>
        )}
      </div>

      {/* Articles Listing in 3-Column Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-20 px-6 bg-white rounded-3xl border border-dashed border-lavender-border/80 shadow-soft-xs">
          <div className="w-12 h-12 rounded-2xl bg-lavender flex items-center justify-center mx-auto mb-4 text-primary">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-ink-primary mb-2">لم يتم العثور على مقالات مطابقة</h3>
          <p className="text-sm text-ink-secondary max-w-md mx-auto mb-6 leading-relaxed">
            جرّب تغيير كلمات البحث أو استعراض موضوع آخر من القائمة أعلاه.
          </p>
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-soft-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>عرض جميع المقالات</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {articles.map((article) => (
            <article
              key={article.id}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-lavender-border/70 p-6 sm:p-8 hover:shadow-soft-md hover:border-primary/30 transition-all duration-300 flex flex-col justify-between shadow-soft-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary">
                    <Clock className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                    <span>{article.reading_time_minutes} دقائق قراءة</span>
                  </span>
                  {article.visibility === 'PREMIUM' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                      <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                      <span>حصري للمشتركين</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-lavender/60 text-ink-secondary text-xs font-medium rounded-full">
                      مقال مفتوح
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-ink-primary group-hover:text-primary transition-colors leading-snug mb-3">
                  <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                </h2>

                <p className="text-sm text-ink-secondary leading-relaxed line-clamp-3 mb-6">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-lavender-border/60 flex items-center justify-between text-xs text-ink-muted">
                <span>{article.published_at?.slice(0, 10)}</span>
                <div className="flex items-center gap-2.5">
                  <Link
                    href={`/content/${article.slug}.md`}
                    className="font-mono text-ink-secondary hover:text-primary px-1.5 py-0.5 rounded-md hover:bg-lavender/60 transition-colors"
                    title="تحميل كماركداون"
                  >
                    .md
                  </Link>
                  <Link
                    href={`/content/${article.slug}.txt`}
                    className="font-mono text-ink-secondary hover:text-primary px-1.5 py-0.5 rounded-md hover:bg-lavender/60 transition-colors"
                    title="تحميل كنص عادي"
                  >
                    .txt
                  </Link>
                  <Link
                    href={`/articles/${article.slug}`}
                    className="font-semibold text-primary group-hover:underline inline-flex items-center gap-1 mr-1"
                  >
                    <span>اقرأ</span>
                    <ArrowLeft className="w-3 h-3" aria-hidden="true" />
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
