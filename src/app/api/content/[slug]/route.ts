import { NextRequest, NextResponse } from 'next/server';
import { getArticleBySlug } from '@/lib/data/article-service';
import { evaluateContentAccess } from '@/lib/auth/entitlements';
import { verifyReaderEntitlement } from '@/lib/auth/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const format = request.nextUrl.searchParams.get('format') || 'md';

  const article = await getArticleBySlug(slug);
  if (!article) {
    return new NextResponse('Article not found', { status: 404 });
  }

  const session = await verifyReaderEntitlement(request);

  const access = evaluateContentAccess({
    visibility: article.visibility,
    isAuthenticated: session.isAuthenticated,
    hasEntitlement: session.hasEntitlement,
    fullHtml: article.revision.rich_html,
    fullMarkdown: article.revision.markdown_derivative,
    fullPlainText: article.revision.plaintext_derivative,
  });

  const headers = new Headers();
  headers.set('X-Robots-Tag', 'noindex, follow');

  if (article.visibility === 'PREMIUM') {
    headers.set('Cache-Control', 'private, no-cache, no-store');
  } else {
    headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  }

  if (format === 'txt') {
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    return new NextResponse(access.plainText, { status: 200, headers });
  }

  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  return new NextResponse(access.markdown, { status: 200, headers });
}
