import {
  compileRichHtml,
  compileNormalizedMarkdown,
  compilePlainText,
  validateMdxContent,
} from '../content/compiler';
import type { ArticleRevision } from '../supabase/types';

export interface PublishInput {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  visibility: 'FREE' | 'PREMIUM';
  publishedAt?: string;
}

export interface PublishResult {
  success: boolean;
  errors: string[];
  revisionNumber?: number;
  derivatives: {
    richHtml: string;
    markdown: string;
    plainText: string;
  };
}

export class ContentPublisher {
  // In-memory revision ledger (backed by Supabase article_revisions in production)
  private revisions: Map<string, ArticleRevision[]> = new Map();

  async publishArticle(article: PublishInput, mdxSource: string): Promise<PublishResult> {
    const validation = validateMdxContent(mdxSource);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        derivatives: { richHtml: '', markdown: '', plainText: '' },
      };
    }

    const publishedAt = article.publishedAt || new Date().toISOString();

    const [richHtml, markdown, plainText] = await Promise.all([
      compileRichHtml(mdxSource),
      compileNormalizedMarkdown(mdxSource),
      compilePlainText(mdxSource, {
        title: article.title,
        authorName: article.authorName,
        publishedAt,
        excerpt: article.excerpt,
      }),
    ]);

    const articleRevs = this.revisions.get(article.id) || [];
    const revisionNumber = articleRevs.length + 1;

    const revision: ArticleRevision = {
      id: crypto.randomUUID(),
      article_id: article.id,
      revision_number: revisionNumber,
      mdx_source: mdxSource,
      rich_html: richHtml,
      markdown_derivative: markdown,
      plaintext_derivative: plainText,
      created_at: new Date().toISOString(),
    };

    articleRevs.push(revision);
    this.revisions.set(article.id, articleRevs);

    return {
      success: true,
      errors: [],
      revisionNumber,
      derivatives: {
        richHtml,
        markdown,
        plainText,
      },
    };
  }

  getRevisions(articleId: string): ArticleRevision[] {
    return this.revisions.get(articleId) || [];
  }
}
