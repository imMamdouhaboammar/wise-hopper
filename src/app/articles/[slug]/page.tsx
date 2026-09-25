import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getArticleBySlug, getAuthor } from '@/lib/data/article-service';
import { generateArticleSchema } from '@/lib/seo/seo-engine';
import { evaluateContentAccess } from '@/lib/auth/entitlements';
import { verifyReaderEntitlement } from '@/lib/auth/session';
import { ReadingProgress } from '@/components/reading/reading-progress';
import { TableOfContents } from '@/components/reading/table-of-contents';
import { PaywallCard } from '@/components/reading/paywall-card';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: article.seo_title || article.title,
    description: article.seo_description || article.excerpt,
    alternates: {
      canonical: `/articles/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.published_at || undefined,
      images: article.cover_image_url ? [{ url: article.cover_image_url }] : [],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [article, author] = await Promise.all([getArticleBySlug(slug), getAuthor()]);

  if (!article) {
    notFound();
  }

  const session = await verifyReaderEntitlement();

  const access = evaluateContentAccess({
    visibility: article.visibility,
    isAuthenticated: session.isAuthenticated,
    hasEntitlement: session.hasEntitlement,
    fullHtml: article.revision.rich_html,
    fullMarkdown: article.revision.markdown_derivative,
    fullPlainText: article.revision.plaintext_derivative,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const canonicalUrl = `${siteUrl}/articles/${slug}`;

  const articleSchema = generateArticleSchema(
    {
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      publishedAt: article.published_at,
      updatedAt: article.updated_at,
      coverImageUrl: article.cover_image_url,
      visibility: article.visibility,
    },
    {
      name: author.name,
      bio: author.bio,
      avatarUrl: author.avatar_url,
      url: `${siteUrl}/about`,
    },
    canonicalUrl
  );

  return (
    <article className="py-12">
      <ReadingProgress />

      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="max-w-4xl mx-auto px-6">
        {/* Article Header */}
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="text-xs text-ink-secondary">
              قراءة تستغرق {article.reading_time_minutes} دقائق
            </span>
            <span className="text-ink-border">•</span>
            <time className="text-xs text-ink-secondary" dateTime={article.published_at || ''}>
              {article.published_at?.slice(0, 10)}
            </time>
            {article.visibility === 'PREMIUM' && (
              <>
                <span className="text-ink-border">•</span>
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                  حصري للمشتركين
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-primary leading-tight mb-8">
            {article.title}
          </h1>

          <p className="text-lg sm:text-xl text-ink-secondary leading-relaxed max-w-2xl mx-auto mb-10">
            {article.excerpt}
          </p>

          {/* Author Badge */}
          <div className="flex items-center justify-center gap-4 py-4 border-y border-lavender-border max-w-md mx-auto">
            {author.avatar_url && (
              <img
                src={author.avatar_url}
                alt={author.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-lavender"
              />
            )}
            <div className="text-right">
              <span className="font-bold text-sm text-ink-primary block">{author.name}</span>
              <span className="text-xs text-ink-secondary">مهندس برمجيات وكاتب تقني</span>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        {article.cover_image_url && (
          <div className="mb-12 rounded-3xl overflow-hidden aspect-16/9 shadow-lg">
            <img
              src={article.cover_image_url}
              alt={article.cover_image_alt || article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content & Table of Contents Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Prose Content */}
          <div className="lg:col-span-8">
            <div
              className="editorial-prose"
              dangerouslySetInnerHTML={{ __html: access.html }}
            />

            {/* Paywall Gate Container if unauthorized for premium */}
            {!access.canAccessFull && <PaywallCard />}

            {/* Stable Derivative Downloads */}
            <div className="mt-16 p-6 bg-lavender-light rounded-2xl border border-lavender-border">
              <h4 className="font-bold text-sm text-ink-primary mb-2">مشتقات المحتوى الحتمية</h4>
              <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
                تتيح المنصة قراءة وتنزيل الوثيقة ذاتها كملف ماركداون قياسي أو ملف نصي خالٍ من التنسيق لأغراض الأرشفة الشخصية والتحليل الآلي:
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/content/${article.slug}.md`}
                  className="px-4 py-2 bg-white hover:bg-lavender text-primary font-mono text-xs font-semibold rounded-lg border border-lavender-border transition-colors"
                >
                  تحميل /content/{article.slug}.md
                </Link>
                <Link
                  href={`/content/${article.slug}.txt`}
                  className="px-4 py-2 bg-white hover:bg-lavender text-primary font-mono text-xs font-semibold rounded-lg border border-lavender-border transition-colors"
                >
                  تحميل /content/{article.slug}.txt
                </Link>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar: Table of Contents */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <TableOfContents />

              <div className="p-5 bg-white rounded-2xl border border-lavender-border text-center">
                <span className="text-xs text-ink-secondary block mb-2">تصلك دراسات مماثلة كل أسبوعين</span>
                <Link
                  href="/newsletter"
                  className="block w-full py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors"
                >
                  انضم إلى حلقة التفكير الهادئ
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
