import Link from 'next/link';
import {
  Sparkles,
  Clock,
  ShieldCheck,
  ArrowLeft,
  FileCode,
  FileText,
  Mail,
  CheckCircle2,
  BookOpen,
  Compass,
} from 'lucide-react';
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-linear-to-bl from-lavender-light via-white to-lavender-light/50 p-8 sm:p-12 rounded-3xl border border-lavender-border shadow-xs hover:shadow-md transition-shadow duration-300">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-primary text-xs font-semibold rounded-full border border-lavender-border shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  <span>مقال مميز</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary bg-white/80 px-2.5 py-1 rounded-full border border-lavender-border/60">
                  <Clock className="w-3 h-3 text-ink-muted" aria-hidden="true" />
                  <span>{featuredArticle.reading_time_minutes} دقائق قراءة</span>
                </span>
                {featuredArticle.visibility === 'PREMIUM' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-white text-xs font-semibold rounded-full shadow-2xs">
                    <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>حصري للمشتركين</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-lavender text-primary text-xs font-semibold rounded-full">
                    <span>متاح للقراءة الحرة</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-primary leading-tight mb-6">
                <Link
                  href={`/articles/${featuredArticle.slug}`}
                  className="hover:text-primary transition-colors duration-200"
                >
                  {featuredArticle.title}
                </Link>
              </h1>

              <p className="text-base sm:text-lg text-ink-secondary leading-relaxed mb-8">
                {featuredArticle.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/articles/${featuredArticle.slug}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-sm font-semibold rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <span>متابعة القراءة الكاملة</span>
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href={`/content/${featuredArticle.slug}.md`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 bg-white hover:bg-lavender text-ink-secondary hover:text-primary text-xs font-mono font-medium rounded-xl border border-lavender-border hover:border-primary/30 transition-all shadow-2xs"
                  title="تحميل مشتق الماركداون المعياري"
                >
                  <FileCode className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                  <span>صيغة .md</span>
                </Link>
                <Link
                  href={`/content/${featuredArticle.slug}.txt`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 bg-white hover:bg-lavender text-ink-secondary hover:text-primary text-xs font-mono font-medium rounded-xl border border-lavender-border hover:border-primary/30 transition-all shadow-2xs"
                  title="تحميل مشتق النص النقي"
                >
                  <FileText className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                  <span>صيغة .txt</span>
                </Link>
              </div>
            </div>

            {featuredArticle.cover_image_url && (
              <div className="lg:col-span-5 relative aspect-4/3 rounded-2xl overflow-hidden shadow-md border border-lavender-border group">
                <img
                  src={featuredArticle.cover_image_url}
                  alt={featuredArticle.cover_image_alt || featuredArticle.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink-primary/20 via-transparent to-transparent pointer-events-none" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Topic Filter Pills */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-bold text-ink-primary">تصفح حسب الموضوع</h2>
          </div>
          <Link
            href="/articles"
            className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>عرض كل المواضيع</span>
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/articles?topic=${topic.slug}`}
              className="px-4 py-2 bg-white hover:bg-lavender text-sm font-medium text-ink-primary hover:text-primary rounded-xl border border-lavender-border hover:border-primary/30 transition-all shadow-2xs hover:shadow-xs"
            >
              {topic.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Writing Grid */}
      <section className="mb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="text-2xl font-bold text-ink-primary">أحدث ما كُتب</h2>
          </div>
          <Link
            href="/articles"
            className="text-xs sm:text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>الأرشيف الكامل</span>
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {recentArticles.map((article) => (
            <article
              key={article.id}
              className="group bg-white rounded-2xl border border-lavender-border p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-200 flex flex-col justify-between relative"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="inline-flex items-center gap-1 text-xs text-ink-secondary">
                    <Clock className="w-3 h-3 text-ink-muted" aria-hidden="true" />
                    <span>{article.reading_time_minutes} دقائق قراءة</span>
                  </span>
                  {article.visibility === 'PREMIUM' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                      <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                      <span>حصري للمشتركين</span>
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
                <div className="flex items-center gap-3">
                  <Link
                    href={`/content/${article.slug}.md`}
                    className="font-mono text-ink-secondary hover:text-primary px-1.5 py-0.5 rounded-sm hover:bg-lavender transition-colors"
                    title="تحميل كماركداون"
                  >
                    .md
                  </Link>
                  <Link
                    href={`/content/${article.slug}.txt`}
                    className="font-mono text-ink-secondary hover:text-primary px-1.5 py-0.5 rounded-sm hover:bg-lavender transition-colors"
                    title="تحميل كنص عادي"
                  >
                    .txt
                  </Link>
                  <Link
                    href={`/articles/${article.slug}`}
                    className="text-primary font-semibold group-hover:underline inline-flex items-center gap-1"
                  >
                    <span>اقرأ المقال</span>
                    <ArrowLeft className="w-3 h-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Integrated Newsletter Subscription Section */}
      <section className="bg-linear-to-br from-primary via-[#6546CE] to-[#4E34AB] text-white rounded-3xl p-8 sm:p-14 text-center relative overflow-hidden shadow-lg">
        {/* Subtle decorative circles */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 text-white text-xs font-semibold rounded-full mb-5 backdrop-blur-xs border border-white/20">
            <Mail className="w-3.5 h-3.5" aria-hidden="true" />
            <span>نشرة بريدية متخصصة ومستقلة</span>
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            انضم إلى حلقة التفكير الهادئ
          </h2>
          <p className="text-base text-lavender-light/95 mb-8 leading-relaxed max-w-xl mx-auto">
            تحليلات معمارية متعمقة في هندسة النظم وتصميم التجارب العربية مرتين شهرياً، مباشرة إلى بريدك دون إعلانات أو ضجيج.
          </p>

          <form action="/api/newsletter/subscribe" method="POST" className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              name="email"
              required
              placeholder="أدخل بريدك الإلكتروني..."
              className="flex-1 px-4 py-3.5 rounded-xl bg-white text-ink-primary placeholder:text-ink-muted text-sm focus:outline-hidden focus:ring-2 focus:ring-lavender shadow-xs"
            />
            <button
              type="submit"
              className="px-7 py-3.5 bg-ink-primary hover:bg-black active:bg-black text-white text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              انضم مجاناً
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-lavender/80 mt-6">
            <span className="inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-lavender" />
              <span>تأكيد مزدوج للأمان (Double Opt-In)</span>
            </span>
            <span className="hidden sm:inline text-white/30">•</span>
            <span>إلغاء الاشتراك بنقرة واحدة في أي وقت</span>
          </div>
        </div>
      </section>
    </div>
  );
}
