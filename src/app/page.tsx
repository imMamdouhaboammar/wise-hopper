import Link from 'next/link';
import { getPublishedArticles, getAllTopics } from '@/lib/data/article-service';
import { generateWebSiteSchema } from '@/lib/seo/seo-engine';

export default async function HomePage() {
  const [articles, topics] = await Promise.all([
    getPublishedArticles(),
    getAllTopics(),
  ]);

  const featuredArticle = articles[0];
  const recentArticles = articles.slice(1);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const websiteSchema = generateWebSiteSchema(siteUrl);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      {/* Hero Featured Article */}
      {featuredArticle && (
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-lavender-light p-8 sm:p-12 rounded-3xl border border-lavender-border">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-white text-primary text-xs font-semibold rounded-full border border-lavender-border shadow-xs">
                  مقال مميز
                </span>
                <span className="text-xs text-ink-secondary">
                  قراءة تستغرق {featuredArticle.reading_time_minutes} دقائق
                </span>
                {featuredArticle.visibility === 'PREMIUM' && (
                  <span className="px-2.5 py-0.5 bg-primary text-white text-xs font-semibold rounded-full">
                    حصري للمشتركين
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-primary leading-tight mb-6">
                <Link
                  href={`/articles/${featuredArticle.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {featuredArticle.title}
                </Link>
              </h1>

              <p className="text-base sm:text-lg text-ink-secondary leading-relaxed mb-8">
                {featuredArticle.excerpt}
              </p>

              <div className="flex items-center gap-4">
                <Link
                  href={`/articles/${featuredArticle.slug}`}
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
                >
                  متابعة القراءة الكاملة
                </Link>
                <Link
                  href={`/content/${featuredArticle.slug}.md`}
                  className="inline-flex items-center justify-center px-4 py-3 bg-white hover:bg-lavender text-ink-secondary hover:text-primary text-xs font-mono font-medium rounded-xl border border-lavender-border transition-all"
                >
                  صيغة .md
                </Link>
              </div>
            </div>

            {featuredArticle.cover_image_url && (
              <div className="lg:col-span-5 relative aspect-4/3 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={featuredArticle.cover_image_url}
                  alt={featuredArticle.cover_image_alt || featuredArticle.title}
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Topic Filter Pills */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-ink-primary">تصفح حسب الموضوع</h2>
          <Link href="/articles" className="text-sm font-medium text-primary hover:underline">
            عرض كل المواضيع ←
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/articles?topic=${topic.slug}`}
              className="px-5 py-2.5 bg-white hover:bg-lavender text-sm font-medium text-ink-primary hover:text-primary rounded-xl border border-lavender-border transition-colors"
            >
              {topic.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Writing Grid */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-ink-primary">أحدث ما كُتب</h2>
          <Link href="/articles" className="text-sm font-medium text-primary hover:underline">
            الأرشيف الكامل ←
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {recentArticles.map((article) => (
            <article
              key={article.id}
              className="group bg-white rounded-2xl border border-lavender-border p-6 hover:shadow-lg hover:border-primary/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
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

                <h3 className="text-xl font-bold text-ink-primary group-hover:text-primary transition-colors leading-snug mb-3">
                  <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                </h3>

                <p className="text-sm text-ink-secondary leading-relaxed line-clamp-3 mb-6">
                  {article.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-lavender-border text-xs text-ink-muted">
                <span>تاريخ النشر: {article.published_at?.slice(0, 10)}</span>
                <span className="text-primary font-semibold group-hover:underline">اقرأ المقال ←</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Integrated Newsletter Subscription Section */}
      <section className="bg-primary text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full mb-4 inline-block">
            نشرة بريدية احترافية
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">انضم إلى حلقة التفكير الهادئ</h2>
          <p className="text-base text-lavender-light mb-8 leading-relaxed">
            أرسل تحليلات متعمقة غير مكررة حول هندسة النظم وتجربة المستخدم والنشر الرقمي مرتين شهرياً، مباشرة إلى بريدك دون إعلانات أو ضجيج.
          </p>

          <form action="/api/newsletter/subscribe" method="POST" className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              name="email"
              required
              placeholder="أدخل بريدك الإلكتروني..."
              className="flex-1 px-4 py-3 rounded-xl bg-white text-ink-primary placeholder:text-ink-muted text-sm focus:outline-hidden focus:ring-2 focus:ring-lavender"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-ink-primary hover:bg-black text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
            >
              انضم مجاناً
            </button>
          </form>
          <p className="text-xs text-lavender/80 mt-4">
            تأكيد مزدوج للأمان (Double Opt-In). يمكنك إلغاء الاشتراك بنقرة واحدة في أي وقت.
          </p>
        </div>
      </section>
    </div>
  );
}
