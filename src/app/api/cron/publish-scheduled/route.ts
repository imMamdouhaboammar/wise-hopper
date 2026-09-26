import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { timingSafeEqualString } from '@/lib/auth/session';
import { getArticleRepository } from '@/lib/data';
import {
  compileRichHtml,
  compileNormalizedMarkdown,
  compilePlainText,
} from '@/lib/content/compiler';

export async function GET(request: NextRequest) {
  return handleCronPublish(request);
}

export async function POST(request: NextRequest) {
  return handleCronPublish(request);
}

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Graceful no-op when executing in unit tests outside active Next.js request context
  }
}

async function handleCronPublish(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET || process.env.STUDIO_SECRET_KEY;
  if (!cronSecret || cronSecret.length < 16) {
    return NextResponse.json(
      { error: 'Server misconfiguration: CRON_SECRET is not configured' },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const querySecret = request.nextUrl.searchParams.get('secret') || '';
  const provided = bearerToken || querySecret;

  if (!provided || !timingSafeEqualString(provided, cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
  }

  try {
    const repo = getArticleRepository();
    const dueArticles = await repo.getScheduledDueArticles();

    if (dueArticles.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled articles due for publication',
        publishedCount: 0,
        publishedSlugs: [],
      });
    }

    const publishedSlugs: string[] = [];

    for (const article of dueArticles) {
      const mdxSource = article.draft_mdx_source || `# ${article.title}\n\n${article.excerpt}`;
      const [richHtml, markdownDerivative, plaintextDerivative] = await Promise.all([
        compileRichHtml(mdxSource),
        compileNormalizedMarkdown(mdxSource),
        compilePlainText(mdxSource, {
          title: article.title,
          authorName: 'ممدوح أبو عمار',
          publishedAt: new Date().toISOString(),
          excerpt: article.excerpt,
        }),
      ]);

      await repo.publishArticle({
        id: article.id,
        expectedVersion: article.version,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        coverImageUrl: article.cover_image_url,
        coverImageAlt: article.cover_image_alt,
        visibility: article.visibility,
        topicId: article.topic_id,
        seoTitle: article.seo_title,
        seoDescription: article.seo_description,
        readingTimeMinutes: article.reading_time_minutes,
        mdxSource,
        richHtml,
        markdownDerivative,
        plaintextDerivative,
        publishedAt: new Date().toISOString(),
      });

      publishedSlugs.push(article.slug);
      safeRevalidatePath(`/articles/${article.slug}`);
    }

    safeRevalidatePath('/articles');
    safeRevalidatePath('/sitemap.xml');
    safeRevalidatePath('/rss.xml');
    safeRevalidatePath('/atom.xml');
    safeRevalidatePath('/llms.txt');

    return NextResponse.json({
      success: true,
      publishedCount: publishedSlugs.length,
      publishedSlugs,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Cron publish processing failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
