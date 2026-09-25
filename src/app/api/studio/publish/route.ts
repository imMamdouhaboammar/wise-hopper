import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerSession } from '@/lib/auth/session';
import { ContentPublisher } from '@/lib/publishing/publisher';
import { savePublishedArticle, getAuthor } from '@/lib/data/article-service';
import type { Article, ArticleRevision } from '@/lib/supabase/types';

const publisher = new ContentPublisher();

export async function POST(request: NextRequest) {
  const session = await verifyOwnerSession(request);
  if (!session.isOwner) {
    return NextResponse.json({ error: 'Unauthorized: Studio access requires owner session' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = body.id || crypto.randomUUID();
    const title = String(body.title || '').trim();
    const slug = String(body.slug || '').trim();
    const excerpt = String(body.excerpt || '').trim();
    const contentMdx = String(body.contentMdx || '').trim();
    const visibility: 'FREE' | 'PREMIUM' = body.visibility === 'PREMIUM' ? 'PREMIUM' : 'FREE';
    const status = body.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED';

    if (!title || !slug || !contentMdx) {
      return NextResponse.json({ error: 'Missing required fields: title, slug, contentMdx' }, { status: 400 });
    }

    const author = await getAuthor();
    const publishResult = await publisher.publishArticle(
      {
        id,
        slug,
        title,
        excerpt,
        authorName: author.name,
        visibility,
        publishedAt: new Date().toISOString(),
      },
      contentMdx
    );

    if (!publishResult.success) {
      return NextResponse.json(
        { error: 'Publishing validation failed', details: publishResult.errors },
        { status: 422 }
      );
    }

    const words = contentMdx.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 180));

    const revision: ArticleRevision = {
      id: crypto.randomUUID(),
      article_id: id,
      revision_number: publishResult.revisionNumber || 1,
      mdx_source: contentMdx,
      rich_html: publishResult.derivatives.richHtml,
      markdown_derivative: publishResult.derivatives.markdown,
      plaintext_derivative: publishResult.derivatives.plainText,
      created_at: new Date().toISOString(),
    };

    const articleData: Article & { revision: ArticleRevision } = {
      id,
      slug,
      title,
      excerpt,
      cover_image_url: null,
      cover_image_alt: null,
      visibility,
      status,
      topic_id: null,
      author_id: author.id,
      reading_time_minutes: readingTime,
      seo_title: title,
      seo_description: excerpt,
      published_at: new Date().toISOString(),
      scheduled_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      revision,
    };

    await savePublishedArticle(articleData);

    return NextResponse.json({
      success: true,
      articleId: id,
      slug,
      urls: {
        web: `/articles/${slug}`,
        markdown: `/content/${slug}.md`,
        plainText: `/content/${slug}.txt`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Publish failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
