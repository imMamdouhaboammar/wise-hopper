import { NextResponse } from 'next/server';
import { getPublishedArticles, getAuthor } from '@/lib/data/article-service';

export async function GET() {
  const [articles, author] = await Promise.all([getPublishedArticles(), getAuthor()]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const entries = articles
    .map(
      (a) => `
  <entry>
    <title>${a.title}</title>
    <link href="${siteUrl}/articles/${a.slug}"/>
    <id>${siteUrl}/articles/${a.slug}</id>
    <updated>${new Date(a.updated_at || a.created_at).toISOString()}</updated>
    <summary>${a.excerpt}</summary>
    <author>
      <name>${author.name}</name>
    </author>
  </entry>`
    )
    .join('');

  const atom = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ar">
  <title>وايز هوبر | النشر الرقمي العربي المستقل</title>
  <link href="${siteUrl}"/>
  <link href="${siteUrl}/atom.xml" rel="self"/>
  <updated>${new Date().toISOString()}</updated>
  <id>${siteUrl}/</id>
  <author>
    <name>${author.name}</name>
  </author>
  ${entries}
</feed>`;

  return new NextResponse(atom.trim(), {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=14400',
    },
  });
}
