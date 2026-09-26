import type { Article, ArticleRevision, Topic } from '../supabase/types';
import {
  type ArticleRepository,
  type ArticleWithRevision,
  type ArticleCounts,
  type ArticleFilterOptions,
  type SaveDraftInput,
  type PublishInput,
  type ScheduleInput,
  VersionConflictError,
} from './article-repository';
import { SEED_ARTICLES, SEED_AUTHOR, SEED_TOPICS } from './article-service';
import { matchArabicQuery } from '../content/arabic-normalizer';

export class SeedArticleRepository implements ArticleRepository {
  private articles: Map<string, Article> = new Map();
  private revisions: Map<string, ArticleRevision[]> = new Map();
  private topics: Map<string, Topic> = new Map();

  constructor() {
    this.resetToSeed();
  }

  resetToSeed(): void {
    this.articles.clear();
    this.revisions.clear();
    this.topics.clear();

    for (const topic of SEED_TOPICS) {
      this.topics.set(topic.id, { ...topic });
    }

    for (const item of SEED_ARTICLES) {
      const article: Article = {
        id: item.id,
        slug: item.slug,
        title: item.title,
        excerpt: item.excerpt,
        cover_image_url: item.cover_image_url,
        cover_image_alt: item.cover_image_alt,
        visibility: item.visibility,
        status: item.status,
        topic_id: item.topic_id,
        author_id: item.author_id,
        reading_time_minutes: item.reading_time_minutes,
        seo_title: item.seo_title,
        seo_description: item.seo_description,
        published_at: item.published_at,
        scheduled_at: item.scheduled_at,
        version: 1,
        draft_mdx_source: null,
        draft_updated_at: null,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };

      this.articles.set(article.id, article);
      this.revisions.set(article.id, [{ ...item.revision }]);
    }
  }

  async getPublishedArticles(options?: {
    topicSlug?: string;
    limit?: number;
    offset?: number;
  }): Promise<ArticleWithRevision[]> {
    const list = Array.from(this.articles.values())
      .filter((a) => a.status === 'PUBLISHED')
      .sort((a, b) => {
        const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
        const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
        return timeB - timeA;
      });

    const filtered = options?.topicSlug
      ? list.filter((a) => {
          const topic = a.topic_id ? this.topics.get(a.topic_id) : null;
          return topic?.slug === options.topicSlug;
        })
      : list;

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? filtered.length;
    const paged = filtered.slice(offset, offset + limit);

    return paged.map((a) => this.assembleArticleWithRevision(a));
  }

  async getPublishedArticleBySlug(slug: string): Promise<ArticleWithRevision | null> {
    const article = Array.from(this.articles.values()).find(
      (a) => a.slug === slug && a.status === 'PUBLISHED'
    );
    if (!article) return null;
    return this.assembleArticleWithRevision(article);
  }

  async searchPublishedArticles(
    query: string,
    limit = 20,
    offset = 0
  ): Promise<ArticleWithRevision[]> {
    const published = await this.getPublishedArticles();
    const matched = published.filter(
      (a) => matchArabicQuery(a.title, query) || matchArabicQuery(a.excerpt, query)
    );
    return matched.slice(offset, offset + limit);
  }

  async getArticleById(id: string): Promise<ArticleWithRevision | null> {
    const article = this.articles.get(id);
    if (!article) return null;
    return this.assembleArticleWithRevision(article);
  }

  async getArticleCounts(): Promise<ArticleCounts> {
    const all = Array.from(this.articles.values());
    return {
      drafts: all.filter((a) => a.status === 'DRAFT').length,
      scheduled: all.filter((a) => a.status === 'SCHEDULED').length,
      published: all.filter((a) => a.status === 'PUBLISHED').length,
      premium: all.filter((a) => a.visibility === 'PREMIUM').length,
      archived: all.filter((a) => a.status === 'ARCHIVED').length,
    };
  }

  async getRecentStudioArticles(limit = 5): Promise<Article[]> {
    const all = Array.from(this.articles.values());
    all.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return all.slice(0, limit);
  }

  async listStudioArticles(
    options: ArticleFilterOptions
  ): Promise<{ articles: (Article & { topic?: Topic | null })[]; total: number }> {
    let list = Array.from(this.articles.values());

    if (options.status && options.status !== 'ALL') {
      list = list.filter((a) => a.status === options.status);
    }
    if (options.visibility && options.visibility !== 'ALL') {
      list = list.filter((a) => a.visibility === options.visibility);
    }
    if (options.topicId) {
      list = list.filter((a) => a.topic_id === options.topicId);
    }
    if (options.query) {
      list = list.filter(
        (a) =>
          matchArabicQuery(a.title, options.query || '') ||
          matchArabicQuery(a.excerpt, options.query || '')
      );
    }

    const sortBy = options.sortBy ?? 'updated_at';
    const sortOrder = options.sortOrder ?? 'desc';
    list.sort((a, b) => {
      const timeA = new Date(a[sortBy] || a.updated_at).getTime();
      const timeB = new Date(b[sortBy] || b.updated_at).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 20;
    const offset = (page - 1) * pageSize;
    const paged = list.slice(offset, offset + pageSize);

    const enriched = paged.map((a) => ({
      ...a,
      topic: a.topic_id ? this.topics.get(a.topic_id) || null : null,
    }));

    return { articles: enriched, total: list.length };
  }

  async saveDraft(input: SaveDraftInput): Promise<Article> {
    const now = new Date().toISOString();

    if (input.id && this.articles.has(input.id)) {
      const existing = this.articles.get(input.id);
      if (!existing) {
        throw new Error('المقال غير موجود');
      }

      if (input.expectedVersion !== undefined && input.expectedVersion !== existing.version) {
        throw new VersionConflictError(input.expectedVersion, existing.version);
      }

      const updated: Article = {
        ...existing,
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        draft_mdx_source: input.draftMdxSource,
        draft_updated_at: now,
        updated_at: now,
        visibility: input.visibility ?? existing.visibility,
        topic_id: input.topicId !== undefined ? input.topicId : existing.topic_id,
        cover_image_url:
          input.coverImageUrl !== undefined ? input.coverImageUrl : existing.cover_image_url,
        cover_image_alt:
          input.coverImageAlt !== undefined ? input.coverImageAlt : existing.cover_image_alt,
        seo_title: input.seoTitle !== undefined ? input.seoTitle : existing.seo_title,
        seo_description:
          input.seoDescription !== undefined ? input.seoDescription : existing.seo_description,
        reading_time_minutes: input.readingTimeMinutes ?? existing.reading_time_minutes,
        version: existing.version + 1,
      };

      this.articles.set(updated.id, updated);
      return updated;
    }

    const newId = input.id || crypto.randomUUID();
    const newArticle: Article = {
      id: newId,
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      cover_image_url: input.coverImageUrl ?? null,
      cover_image_alt: input.coverImageAlt ?? null,
      visibility: input.visibility ?? 'FREE',
      status: 'DRAFT',
      topic_id: input.topicId ?? null,
      author_id: SEED_AUTHOR.id,
      reading_time_minutes: input.readingTimeMinutes ?? 5,
      seo_title: input.seoTitle ?? null,
      seo_description: input.seoDescription ?? null,
      published_at: null,
      scheduled_at: null,
      version: 1,
      draft_mdx_source: input.draftMdxSource,
      draft_updated_at: now,
      created_at: now,
      updated_at: now,
    };

    this.articles.set(newArticle.id, newArticle);
    return newArticle;
  }

  async isSlugAvailable(slug: string, excludeArticleId?: string): Promise<boolean> {
    for (const article of this.articles.values()) {
      if (article.slug === slug && article.id !== excludeArticleId) {
        return false;
      }
    }
    return true;
  }

  async publishArticle(input: PublishInput): Promise<ArticleWithRevision> {
    const existing = this.articles.get(input.id);
    if (!existing) {
      throw new Error('المقال غير موجود للنشر');
    }

    if (input.expectedVersion !== existing.version) {
      throw new VersionConflictError(input.expectedVersion, existing.version);
    }

    const currentRevisions = this.revisions.get(input.id) || [];
    const nextRevisionNumber = currentRevisions.length + 1;
    const now = new Date().toISOString();

    const revision: ArticleRevision = {
      id: crypto.randomUUID(),
      article_id: input.id,
      revision_number: nextRevisionNumber,
      mdx_source: input.mdxSource,
      rich_html: input.richHtml,
      markdown_derivative: input.markdownDerivative,
      plaintext_derivative: input.plaintextDerivative,
      created_at: now,
    };

    currentRevisions.push(revision);
    this.revisions.set(input.id, currentRevisions);

    const publishedAt = input.publishedAt || existing.published_at || now;
    const updated: Article = {
      ...existing,
      title: input.title ?? existing.title,
      slug: input.slug ?? existing.slug,
      excerpt: input.excerpt ?? existing.excerpt,
      visibility: input.visibility ?? existing.visibility,
      topic_id: input.topicId !== undefined ? input.topicId : existing.topic_id,
      cover_image_url:
        input.coverImageUrl !== undefined ? input.coverImageUrl : existing.cover_image_url,
      cover_image_alt:
        input.coverImageAlt !== undefined ? input.coverImageAlt : existing.cover_image_alt,
      seo_title: input.seoTitle !== undefined ? input.seoTitle : existing.seo_title,
      seo_description:
        input.seoDescription !== undefined ? input.seoDescription : existing.seo_description,
      reading_time_minutes: input.readingTimeMinutes ?? existing.reading_time_minutes,
      status: 'PUBLISHED',
      published_at: publishedAt,
      scheduled_at: null,
      version: existing.version + 1,
      draft_mdx_source: null,
      draft_updated_at: now,
      updated_at: now,
    };

    this.articles.set(updated.id, updated);
    return this.assembleArticleWithRevision(updated);
  }

  async scheduleArticle(input: ScheduleInput): Promise<Article> {
    const existing = this.articles.get(input.id);
    if (!existing) throw new Error('المقال غير موجود');

    if (input.expectedVersion !== existing.version) {
      throw new VersionConflictError(input.expectedVersion, existing.version);
    }

    const now = new Date().toISOString();
    const updated: Article = {
      ...existing,
      status: 'SCHEDULED',
      scheduled_at: input.scheduledAt,
      version: existing.version + 1,
      updated_at: now,
    };
    this.articles.set(updated.id, updated);
    return updated;
  }

  async unpublishArticle(id: string, expectedVersion: number): Promise<Article> {
    const existing = this.articles.get(id);
    if (!existing) throw new Error('المقال غير موجود');

    if (expectedVersion !== existing.version) {
      throw new VersionConflictError(expectedVersion, existing.version);
    }

    const now = new Date().toISOString();
    const updated: Article = {
      ...existing,
      status: 'DRAFT',
      version: existing.version + 1,
      updated_at: now,
    };
    this.articles.set(updated.id, updated);
    return updated;
  }

  async archiveArticle(id: string): Promise<Article> {
    const existing = this.articles.get(id);
    if (!existing) throw new Error('المقال غير موجود');

    const now = new Date().toISOString();
    const updated: Article = {
      ...existing,
      status: 'ARCHIVED',
      version: existing.version + 1,
      updated_at: now,
    };
    this.articles.set(updated.id, updated);
    return updated;
  }

  async unarchiveArticle(id: string): Promise<Article> {
    const existing = this.articles.get(id);
    if (!existing) throw new Error('المقال غير موجود');

    const now = new Date().toISOString();
    const updated: Article = {
      ...existing,
      status: 'DRAFT',
      version: existing.version + 1,
      updated_at: now,
    };
    this.articles.set(updated.id, updated);
    return updated;
  }

  async bulkArchive(ids: string[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      if (this.articles.has(id)) {
        await this.archiveArticle(id);
        count++;
      }
    }
    return count;
  }

  async duplicateArticle(id: string): Promise<Article> {
    const source = this.articles.get(id);
    if (!source) throw new Error('المقال المصدر غير موجود للنسخ');

    const newSlug = `${source.slug}-copy`;
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    const clone: Article = {
      ...source,
      id: newId,
      slug: newSlug,
      title: `${source.title} (نسخة)`,
      status: 'DRAFT',
      published_at: null,
      scheduled_at: null,
      version: 1,
      created_at: now,
      updated_at: now,
    };

    this.articles.set(newId, clone);

    const sourceRevs = this.revisions.get(id) || [];
    if (sourceRevs.length > 0) {
      const latest = sourceRevs[sourceRevs.length - 1];
      this.revisions.set(newId, [
        {
          ...latest,
          id: crypto.randomUUID(),
          article_id: newId,
          revision_number: 1,
          created_at: now,
        },
      ]);
    }

    return clone;
  }

  async getRevisions(articleId: string): Promise<ArticleRevision[]> {
    const revs = this.revisions.get(articleId) || [];
    return [...revs].sort((a, b) => b.revision_number - a.revision_number);
  }

  async getRevision(articleId: string, revisionNumber: number): Promise<ArticleRevision | null> {
    const revs = this.revisions.get(articleId) || [];
    return revs.find((r) => r.revision_number === revisionNumber) || null;
  }

  async getScheduledDueArticles(): Promise<Article[]> {
    const nowTime = Date.now();
    return Array.from(this.articles.values()).filter(
      (a) => a.status === 'SCHEDULED' && a.scheduled_at && new Date(a.scheduled_at).getTime() <= nowTime
    );
  }

  private assembleArticleWithRevision(article: Article): ArticleWithRevision {
    const revs = this.revisions.get(article.id) || [];
    const latestRevision = revs[revs.length - 1] || {
      id: `fallback-rev-${article.id}`,
      article_id: article.id,
      revision_number: 1,
      mdx_source: article.draft_mdx_source || '',
      rich_html: '',
      markdown_derivative: '',
      plaintext_derivative: '',
      created_at: article.updated_at,
    };

    const topic = article.topic_id ? this.topics.get(article.topic_id) || null : null;

    return {
      ...article,
      revision: latestRevision,
      topic,
      author: SEED_AUTHOR,
    };
  }
}
