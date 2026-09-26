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
import { InteractiveArticleContent } from '@/components/reading/interactive-article-content';

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
    <article className="py-8 sm:py-12">
      <ReadingProgress />

      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Breadcrumb / Back Link */}
        <div className="mb-8">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-ink-secondary hover:text-primary transition-colors py-1.5 px-3.5 rounded-xl hover:bg-lavender/60 border border-transparent hover:border-lavender-border/60"
          >
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            <span>العودة إلى أرشيف المقالات</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-5 text-xs sm:text-sm text-ink-secondary">
            <span className="inline-flex items-center gap-1.5 bg-lavender/70 px-3 py-1 rounded-full text-primary font-medium">
              <Clock className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span>{article.reading_time_minutes} دقائق قراءة</span>
            </span>
            <span className="text-lavender-border">•</span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
              <time dateTime={article.published_at || ''}>
                {article.published_at?.slice(0, 10)}
              </time>
            </span>
            {article.visibility === 'PREMIUM' && (
              <>
                <span className="text-lavender-border">•</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full shadow-soft-xs">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>حصري للمشتركين</span>
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.65rem] font-bold text-ink-primary leading-[1.3] mb-6 tracking-tight max-w-4xl mx-auto">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-ink-secondary leading-relaxed max-w-3xl mx-auto mb-8">
            {article.excerpt}
          </p>

          {/* Author Badge */}
          <div className="flex items-center justify-center gap-4 py-4 border-y border-lavender-border/60 max-w-md mx-auto">
            {author.avatar_url && (
              <img
                src={author.avatar_url}
                alt={author.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-soft-xs ring-2 ring-lavender"
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
          <div className="mb-14 rounded-2xl sm:rounded-3xl overflow-hidden aspect-16/9 sm:aspect-21/9 shadow-soft-md border border-lavender-border/60">
            <img
              src={article.cover_image_url}
              alt={article.cover_image_alt || article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content & Table of Contents Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Main Prose Content */}
          <div className="lg:col-span-8 min-w-0">
            <InteractiveArticleContent html={access.html} slug={slug} />

            {/* Paywall Gate Container if unauthorized for premium */}
            {!access.canAccessFull && <PaywallCard />}

            {/* Stable Derivative Downloads */}
            <div className="mt-16 p-6 sm:p-8 bg-white rounded-2xl sm:rounded-3xl border border-lavender-border/70 shadow-soft-xs">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" aria-hidden="true" />
                <h4 className="font-bold text-sm text-ink-primary">
                  مشتقات المحتوى الحتمية (Deterministic Derivatives)
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-ink-secondary mb-5 leading-relaxed">
                تتيح المنصة قراءة وتنزيل الوثيقة ذاتها كملف ماركداون قياسي أو ملف نص نقي خالٍ من التنسيق لأغراض الأرشفة الشخصية والتحليل الآلي وتغذية نماذج الذكاء الاصطناعي بنقاء:
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/content/${article.slug}.md`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-lavender/50 hover:bg-lavender text-primary font-mono text-xs font-semibold rounded-xl border border-lavender-border/70 shadow-soft-xs hover:shadow-soft-sm transition-all"
                >
                  <FileCode className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>تحميل /content/{article.slug}.md</span>
                </Link>
                <Link
                  href={`/content/${article.slug}.txt`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-lavender/50 hover:bg-lavender text-primary font-mono text-xs font-semibold rounded-xl border border-lavender-border/70 shadow-soft-xs hover:shadow-soft-sm transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-ink-muted" aria-hidden="true" />
                  <span>تحميل /content/{article.slug}.txt</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Sticky Sidebar: Table of Contents & Serene Newsletter */}
          <aside className="lg:col-span-4 w-full">
            <div className="sticky top-28 space-y-6">
              <TableOfContents />

              <div className="p-6 bg-white rounded-2xl sm:rounded-3xl border border-lavender-border/70 shadow-soft-xs text-center">
                <div className="w-10 h-10 rounded-2xl bg-lavender/70 text-primary flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-5 h-5" aria-hidden="true" />
                </div>
                <h4 className="font-bold text-sm text-ink-primary mb-1">حلقة التفكير الهادئ</h4>
                <p className="text-xs text-ink-secondary mb-4 leading-relaxed">
                  تصلك دراسات معمارية مماثلة كل أسبوعين مباشرة إلى بريدك.
                </p>
                <Link
                  href="/newsletter"
                  className="block w-full py-2.5 bg-primary hover:bg-primary-hover active:bg-primary-active text-white text-xs font-bold rounded-xl shadow-soft-xs transition-colors"
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
