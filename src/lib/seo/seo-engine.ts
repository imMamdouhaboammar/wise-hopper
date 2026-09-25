/**
 * Technical SEO, JSON-LD Schema Generators, and Editorial Audit Engine
 */

export interface AuthorSeoData {
  name: string;
  bio?: string | null;
  avatarUrl?: string | null;
  url?: string;
}

export interface ArticleSeoData {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt?: string | null;
  updatedAt?: string | null;
  coverImageUrl?: string | null;
  visibility: 'FREE' | 'PREMIUM';
}

export interface SeoAuditWarning {
  id: string;
  level: 'warning' | 'error' | 'info';
  message: string;
}

export interface SeoAuditResult {
  isClean: boolean;
  warnings: SeoAuditWarning[];
  stats: {
    wordCount: number;
    readingTimeMinutes: number;
  };
}

export function generateWebSiteSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name: 'وايز هوبر | النشر الرقمي العربي',
    inLanguage: 'ar',
    description: 'منصة نشر عربية مستقلة للمقالات التحريرية المتعمقة والنشرات البريدية الاحترافية.',
  };
}

export function generatePersonSchema(author: AuthorSeoData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    jobTitle: author.bio || 'كاتب تقني',
    image: author.avatarUrl || undefined,
    url: author.url || undefined,
  };
}

export interface BlogPostingJsonLd {
  '@context': 'https://schema.org';
  '@type': 'BlogPosting';
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
  headline: string;
  description: string;
  image: string[];
  datePublished: string;
  dateModified: string;
  inLanguage: string;
  author: {
    '@type': 'Person';
    name: string;
    url?: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  isAccessibleForFree: boolean;
  hasPart?: {
    '@type': 'WebPageElement';
    isAccessibleForFree: boolean;
    cssSelector: string;
  };
}

export function generateArticleSchema(
  article: ArticleSeoData,
  author: AuthorSeoData,
  canonicalUrl: string
): BlogPostingJsonLd {
  const isPaywalled = article.visibility === 'PREMIUM';

  const schema: BlogPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    headline: article.title,
    description: article.excerpt,
    image: article.coverImageUrl ? [article.coverImageUrl] : [],
    datePublished: article.publishedAt || new Date().toISOString(),
    dateModified: article.updatedAt || article.publishedAt || new Date().toISOString(),
    inLanguage: 'ar',
    author: {
      '@type': 'Person',
      name: author.name,
      url: author.url,
    },
    publisher: {
      '@type': 'Organization',
      name: 'وايز هوبر',
      logo: {
        '@type': 'ImageObject',
        url: `${canonicalUrl}/favicon.ico`,
      },
    },
    isAccessibleForFree: !isPaywalled,
  };

  if (isPaywalled) {
    schema.hasPart = {
      '@type': 'WebPageElement',
      isAccessibleForFree: false,
      cssSelector: '.premium-content-barrier',
    };
  }

  return schema;
}

export function auditSeoMetadata(input: {
  title: string;
  description: string;
  contentMdx: string;
}): SeoAuditResult {
  const warnings: SeoAuditWarning[] = [];

  // Title checks
  const trimmedTitle = input.title.trim();
  if (trimmedTitle.length < 15) {
    warnings.push({
      id: 'title_length',
      level: 'warning',
      message: 'العنوان قصير جداً. يُفضل أن يكون بين 30 و 70 حرفاً لتحقيق أفضل ظهور في نتائج البحث.',
    });
  } else if (trimmedTitle.length > 80) {
    warnings.push({
      id: 'title_length',
      level: 'warning',
      message: 'العنوان طويل جداً وقد يتم اقتصاصه في نتائج البحث.',
    });
  }

  // Description checks
  const trimmedDesc = input.description.trim();
  if (!trimmedDesc) {
    warnings.push({
      id: 'description_missing',
      level: 'error',
      message: 'الوصف التعريفي (Meta Description) مفقود.',
    });
  } else if (trimmedDesc.length < 50 || trimmedDesc.length > 180) {
    warnings.push({
      id: 'description_length',
      level: 'warning',
      message: 'الوصف التعريفي يُفضل أن يتراوح بين 110 و 160 حرفاً.',
    });
  }

  // Images alt check
  const imageRegex = /!\[\s*\]\([^)]+\)/g;
  if (imageRegex.test(input.contentMdx)) {
    warnings.push({
      id: 'image_missing_alt',
      level: 'error',
      message: 'توجد صورة أو أكثر بدون نص بديل (Alt Text) وصفي.',
    });
  }

  // Word count & Reading time calculation
  const words = input.contentMdx
    .replace(/[#*`>[\]()!_-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  const wordCount = words.length;
  // Average Arabic reading speed ~ 180 words per minute
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));

  return {
    isClean: warnings.length === 0,
    warnings,
    stats: {
      wordCount,
      readingTimeMinutes,
    },
  };
}
