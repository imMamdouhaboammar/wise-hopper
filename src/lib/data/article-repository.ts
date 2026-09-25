import type { Article, ArticleRevision, ArticleStatus, ArticleVisibility, Topic, Author } from '../supabase/types';

export class VersionConflictError extends Error {
  readonly currentVersion: number;
  readonly expectedVersion: number;

  constructor(expectedVersion: number, currentVersion: number) {
    super(`تعارض في إصدار المقال: الإصدار المطلوب هو ${expectedVersion} بينما الإصدار الحالي في الخادم هو ${currentVersion}`);
    this.name = 'VersionConflictError';
    this.expectedVersion = expectedVersion;
    this.currentVersion = currentVersion;
  }
}

export interface ArticleCounts {
  drafts: number;
  scheduled: number;
  published: number;
  premium: number;
  archived: number;
}

export interface ArticleFilterOptions {
  status?: ArticleStatus | 'ALL';
  visibility?: ArticleVisibility | 'ALL';
  topicId?: string;
  query?: string;
  sortBy?: 'updated_at' | 'published_at';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface SaveDraftInput {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  draftMdxSource: string;
  visibility?: ArticleVisibility;
  topicId?: string | null;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  readingTimeMinutes?: number;
  expectedVersion?: number;
}

export interface PublishInput {
  id: string;
  expectedVersion: number;
  title?: string;
  slug?: string;
  excerpt?: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  visibility?: ArticleVisibility;
  topicId?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  readingTimeMinutes?: number;
  mdxSource: string;
  richHtml: string;
  markdownDerivative: string;
  plaintextDerivative: string;
  publishedAt?: string;
}

export interface ScheduleInput {
  id: string;
  expectedVersion: number;
  scheduledAt: string;
}

export interface ArticleWithRevision extends Article {
  revision: ArticleRevision;
  topic?: Topic | null;
  author?: Author | null;
}

export interface ArticleRepository {
  // Public reader methods (published revisions ONLY)
  getPublishedArticles(options?: { topicSlug?: string; limit?: number; offset?: number }): Promise<ArticleWithRevision[]>;
  getPublishedArticleBySlug(slug: string): Promise<ArticleWithRevision | null>;
  searchPublishedArticles(query: string, limit?: number, offset?: number): Promise<ArticleWithRevision[]>;

  // Studio methods (drafts, revisions, management)
  getArticleById(id: string): Promise<ArticleWithRevision | null>;
  getArticleCounts(): Promise<ArticleCounts>;
  getRecentStudioArticles(limit?: number): Promise<Article[]>;
  listStudioArticles(options: ArticleFilterOptions): Promise<{ articles: (Article & { topic?: Topic | null })[]; total: number }>;
  saveDraft(input: SaveDraftInput): Promise<Article>;
  isSlugAvailable(slug: string, excludeArticleId?: string): Promise<boolean>;
  publishArticle(input: PublishInput): Promise<ArticleWithRevision>;
  scheduleArticle(input: ScheduleInput): Promise<Article>;
  unpublishArticle(id: string, expectedVersion: number): Promise<Article>;
  archiveArticle(id: string): Promise<Article>;
  unarchiveArticle(id: string): Promise<Article>;
  bulkArchive(ids: string[]): Promise<number>;
  duplicateArticle(id: string): Promise<Article>;
  getRevisions(articleId: string): Promise<ArticleRevision[]>;
  getRevision(articleId: string, revisionNumber: number): Promise<ArticleRevision | null>;
  getScheduledDueArticles(): Promise<Article[]>;
}
