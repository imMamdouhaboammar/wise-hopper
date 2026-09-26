import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Clock,
  Calendar,
  ShieldCheck,
  ArrowRight,
  FileCode,
  FileText,
  Mail,
  BookOpen,
} from 'lucide-react';
import { getArticleRepository } from '@/lib/data';
import { getArticleBySlug, getAuthor } from '@/lib/data/article-service';
import { generateArticleSchema } from '@/lib/seo/seo-engine';
import { evaluateContentAccess } from '@/lib/auth/entitlements';
import { verifyReaderEntitlement } from '@/lib/auth/session';
import { ReadingProgress } from '@/components/reading/reading-progress';
import { TableOfContents } from '@/components/reading/table-of-contents';
import { PaywallCard } from '@/components/reading/paywall-card';

async function resolveArticle(slug: string) {
  const repo = getArticleRepository();
  const fromRepo = await repo.getPublishedArticleBySlug(slug);
  if (fromRepo) return fromRepo;
  return getArticleBySlug(slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await resolveArticle(slug);
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
  const [article, author] = await Promise.all([resolveArticle(slug), getAuthor()]);

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
    <article className="py-10">
      <ReadingProgress />

      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="max-w-4xl mx-auto px-6">
        {/* Breadcrumb / Back Link */}
        <div className="mb-8">
          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-primary transition-colors py-1 px-2.5 rounded-lg hover:bg-lavender-light"
          >
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            <span>العودة إلى أرشيف المقالات</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary bg-lavender-light px-3 py-1 rounded-full border border-lavender-border/80">
              <Clock className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
              <span>{article.reading_time_minutes} دقائق قراءة</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-ink-secondary bg-lavender-light px-3 py-1 rounded-full border border-lavender-border/80">
              <Calendar className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
              <time dateTime={article.published_at || ''}>
                {article.published_at?.slice(0, 10)}
              </time>
            </span>
            {article.visibility === 'PREMIUM' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                <span>حصري للمشتركين</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-primary leading-tight mb-6 tracking-tight">
            {article.title}
          </h1>

          <p className="text-lg sm:text-xl text-ink-secondary leading-relaxed max-w-2xl mx-auto mb-8">
            {article.excerpt}
          </p>

          {/* Author Badge */}
          <div className="flex items-center justify-center gap-4 py-4 border-y border-lavender-border max-w-md mx-auto">
            {author.avatar_url && (
              <img
                src={author.avatar_url}
                alt={author.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-lavender shadow-2xs"
              />
            )}
            <div className="text-right">
              <Link
                href="/about"
                className="font-bold text-sm text-ink-primary hover:text-primary transition-colors block"
              >
                {author.name}
              </Link>
              <span className="text-xs text-ink-secondary">مهندس برمجيات وكاتب تقني مستقل</span>
            </div>
          </div>
        </header>

        {/* Featured Cover Image */}
        {article.cover_image_url && (
          <div className="mb-14 rounded-3xl overflow-hidden aspect-16/9 shadow-lg border border-lavender-border">
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
            <div className="mt-16 p-6 sm:p-7 bg-linear-to-bl from-lavender-light via-white to-lavender-light/50 rounded-3xl border border-lavender-border shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
                <h4 className="font-bold text-sm text-ink-primary">
                  مشتقات المحتوى الحتمية (Deterministic Derivatives)
                </h4>
              </div>
              <p className="text-xs text-ink-secondary mb-5 leading-relaxed">
                تتيح المنصة قراءة وتنزيل الوثيقة ذاتها كملف ماركداون قياسي أو ملف نص نقي خالٍ من التنسيق لأغراض الأرشفة الشخصية والتحليل الآلي وتغذية نماذج الذكاء الاصطناعي بنقاء:
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/content/${article.slug}.md`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-lavender text-primary font-mono text-xs font-semibold rounded-xl border border-lavender-border shadow-2xs hover:shadow-xs transition-all"
                >
                  <FileCode className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>تحميل /content/{article.slug}.md</span>
                </Link>
                <Link
                  href={`/content/${article.slug}.txt`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-lavender text-primary font-mono text-xs font-semibold rounded-xl border border-lavender-border shadow-2xs hover:shadow-xs transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                  <span>تحميل /content/{article.slug}.txt</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar: Table of Contents */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <TableOfContents />

              <div className="p-6 bg-white rounded-2xl border border-lavender-border shadow-2xs text-center">
                <div className="w-10 h-10 rounded-xl bg-lavender text-primary flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <h4 className="font-bold text-sm text-ink-primary mb-1">حلقة التفكير الهادئ</h4>
                <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
                  تصلك دراسات معمارية مماثلة كل أسبوعين مباشرة إلى بريدك.
                </p>
                <Link
                  href="/newsletter"
                  className="block w-full py-2.5 bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  اشترك في النشرة مجاناً
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
