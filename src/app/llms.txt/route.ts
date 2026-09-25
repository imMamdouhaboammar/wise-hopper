import { NextResponse } from 'next/server';
import { getPublishedArticles, getAllTopics, getAuthor } from '@/lib/data/article-service';

export async function GET() {
  const [articles, topics, author] = await Promise.all([
    getPublishedArticles(),
    getAllTopics(),
    getAuthor(),
  ]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const topicsList = topics.map((t) => `- ${t.name}: ${t.description}`).join('\n');

  const articlesList = articles
    .map(
      (a) => `
### ${a.title}
- HTML URL: ${siteUrl}/articles/${a.slug}
- Raw Markdown URL: ${siteUrl}/content/${a.slug}.md
- Plain Text URL: ${siteUrl}/content/${a.slug}.txt
- Visibility: ${a.visibility}
- Reading Time: ${a.reading_time_minutes} minutes
- Excerpt: ${a.excerpt}
`
    )
    .join('');

  const body = `# وايز هوبر (Wise Hopper) | فهرس المحتوى للوكلاء والنماذج اللغوية (llms.txt)

> منصة نشر تحريرية شخصية عربية أولاً، متخصصة في هندسة النظم وتصميم التجارب العربية.
> الكاتب: ${author.name}
> الموقع: ${siteUrl}

## المواضيع والتصنيفات
${topicsList}

## المقالات المنشورة
${articlesList}

## ملاحظات الاستخدام والاسترجاع
- تفضل دائماً استرجاع النسخة النصية عبر /content/[slug].txt أو /content/[slug].md لتقليل استهلاك الرموز (Tokens).
- المقالات المفتوحة (FREE) متاحة بالكامل.
- المقالات الحصرية (PREMIUM) تتطلب اشتراكاً نشطاً وتوفر مقتطفاً تمهيدياً عند الطلب غير المصادق.
`;

  return new NextResponse(body.trim(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
