import { NextResponse } from 'next/server';
import { getPublishedArticles } from '@/lib/data/article-service';

export async function GET() {
  const articles = await getPublishedArticles();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const items = articles
    .map(
      (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${siteUrl}/articles/${a.slug}</link>
      <guid isPermaLink="true">${siteUrl}/articles/${a.slug}</guid>
      <description><![CDATA[${a.excerpt}]]></description>
      <pubDate>${new Date(a.published_at || a.created_at).toUTCString()}</pubDate>
      <category><![CDATA[${a.visibility === 'PREMIUM' ? 'حصري للمشتركين' : 'مقال مفتوح'}]]></category>
    </item>`
    )
    .join('');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>وايز هوبر | النشر الرقمي العربي المستقل</title>
    <link>${siteUrl}</link>
    <description>منصة تحريرية متخصصة في هندسة النظم وتصميم التجارب العربية.</description>
    <language>ar</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(rss.trim(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=14400',
    },
  });
}
