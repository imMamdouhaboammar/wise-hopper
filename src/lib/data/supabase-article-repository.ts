import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Article, ArticleRevision, Topic } from '../supabase/types';
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
import { createServiceRoleClient } from '../supabase/service-role';
import { SEED_AUTHOR } from './article-service';

export class SupabaseArticleRepository implements ArticleRepository {
  private client: SupabaseClient<Database>;

  constructor(client?: SupabaseClient<Database>) {
    this.client = client || createServiceRoleClient();
  }

  async getPublishedArticles(options?: {
    topicSlug?: string;
    limit?: number;
    offset?: number;
  }): Promise<ArticleWithRevision[]> {
    let query = this.client
      .from('articles')
      .select('*')
      .eq('status', 'PUBLISHED')
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });

    if (options?.limit) {
      const from = options.offset ?? 0;
      query = query.range(from, from + options.limit - 1);
    }

    const { data: articles, error } = await query;
    if (error || !articles || articles.length === 0) {
      return [];
    }

    const articleIds = articles.map((a) => a.id);
    const [revisionsMap, topicsMap] = await Promise.all([
      this.fetchRevisionsForArticles(articleIds),
      this.fetchTopicsMap(),
    ]);

    const enriched = articles.map((article) => {
      const revs = revisionsMap.get(article.id) || [];
      const latestRev = revs[0] || this.createFallbackRevision(article);
      const topic = article.topic_id ? topicsMap.get(article.topic_id) || null : null;
      return {
        ...article,
        revision: latestRev,
        topic,
        author: SEED_AUTHOR,
      };
    });

    if (options?.topicSlug) {
      return enriched.filter((a) => a.topic?.slug === options.topicSlug);
    }

    return enriched;
  }

  async getPublishedArticleBySlug(slug: string): Promise<ArticleWithRevision | null> {
    const { data: article, error } = await this.client
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'PUBLISHED')
      .maybeSingle();

    if (error || !article) {
      return null;
    }

    const [revisions, topic] = await Promise.all([
      this.getRevisions(article.id),
      article.topic_id ? this.getTopicById(article.topic_id) : Promise.resolve(null),
    ]);

    const latestRevision = revisions[0] || this.createFallbackRevision(article);

    return {
      ...article,
      revision: latestRevision,
      topic,
      author: SEED_AUTHOR,
    };
  }

  async searchPublishedArticles(
    queryText: string,
    limit = 20,
    offset = 0
  ): Promise<ArticleWithRevision[]> {
    const { data, error } = await this.client.rpc('search_articles', {
      query_text: queryText,
      p_limit: limit,
      p_offset: offset,
    });

    if (error || !data || data.length === 0) {
      return [];
    }

    const ids = data.map((d: { id: string }) => d.id);
    const { data: articles } = await this.client
      .from('articles')
      .select('*')
      .in('id', ids);

    if (!articles || articles.length === 0) {
      return [];
    }

    const revisionsMap = await this.fetchRevisionsForArticles(ids);
    const topicsMap = await this.fetchTopicsMap();

    return articles.map((article) => ({
      ...article,
      revision: revisionsMap.get(article.id)?.[0] || this.createFallbackRevision(article),
      topic: article.topic_id ? topicsMap.get(article.topic_id) || null : null,
      author: SEED_AUTHOR,
    }));
  }

  async getArticleById(id: string): Promise<ArticleWithRevision | null> {
    const { data: article, error } = await this.client
      .from('articles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !article) {
      return null;
    }

    const [revisions, topic] = await Promise.all([
      this.getRevisions(article.id),
      article.topic_id ? this.getTopicById(article.topic_id) : Promise.resolve(null),
    ]);

    return {
      ...article,
      revision: revisions[0] || this.createFallbackRevision(article),
      topic,
      author: SEED_AUTHOR,
    };
  }

  async getArticleCounts(): Promise<ArticleCounts> {
    const { data } = await this.client
      .from('articles')
      .select('status, visibility');

    const list = data || [];
    return {
      drafts: list.filter((a) => a.status === 'DRAFT').length,
      scheduled: list.filter((a) => a.status === 'SCHEDULED').length,
      published: list.filter((a) => a.status === 'PUBLISHED').length,
      premium: list.filter((a) => a.visibility === 'PREMIUM').length,
      archived: list.filter((a) => a.status === 'ARCHIVED').length,
    };
  }

  async getRecentStudioArticles(limit = 5): Promise<Article[]> {
    const { data } = await this.client
      .from('articles')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit);

    return data || [];
  }

  async listStudioArticles(
    options: ArticleFilterOptions
  ): Promise<{ articles: (Article & { topic?: Topic | null })[]; total: number }> {
    let query = this.client
      .from('articles')
      .select('*', { count: 'exact' });

    if (options.status && options.status !== 'ALL') {
      query = query.eq('status', options.status);
    }
    if (options.visibility && options.visibility !== 'ALL') {
      query = query.eq('visibility', options.visibility);
    }
    if (options.topicId) {
      query = query.eq('topic_id', options.topicId);
    }
    if (options.query) {
      query = query.or(`title.ilike.%${options.query}%,excerpt.ilike.%${options.query}%`);
    }

    const sortBy = options.sortBy ?? 'updated_at';
    const ascending = options.sortOrder === 'asc';
    query = query.order(sortBy, { ascending });

    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    query = query.range(from, from + pageSize - 1);

    const { data: articles, count, error } = await query;
    if (error || !articles) {
      return { articles: [], total: 0 };
    }

    const topicsMap = await this.fetchTopicsMap();
    const enriched = articles.map((article) => ({
      ...article,
      topic: article.topic_id ? topicsMap.get(article.topic_id) || null : null,
    }));

    return { articles: enriched, total: count || 0 };
  }

  async saveDraft(input: SaveDraftInput): Promise<Article> {
    const now = new Date().toISOString();

    if (input.id) {
      const { data: current } = await this.client
        .from('articles')
        .select('version')
        .eq('id', input.id)
        .maybeSingle();

      if (!current) {
        throw new Error('المقال غير موجود');
      }

      if (input.expectedVersion !== undefined && input.expectedVersion !== current.version) {
        throw new VersionConflictError(input.expectedVersion, current.version);
      }

      const { data: updated, error } = await this.client
        .from('articles')
        .update({
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt,
          draft_mdx_source: input.draftMdxSource,
          draft_updated_at: now,
          visibility: input.visibility,
          topic_id: input.topicId ?? null,
          cover_image_url: input.coverImageUrl ?? null,
          cover_image_alt: input.coverImageAlt ?? null,
          seo_title: input.seoTitle ?? null,
          seo_description: input.seoDescription ?? null,
          reading_time_minutes: input.readingTimeMinutes ?? 5,
          version: current.version + 1,
          updated_at: now,
        })
        .eq('id', input.id)
        .select()
        .single();

      if (error || !updated) {
        throw new Error(error?.message || 'فشل حفظ المسودة');
      }
      return updated;
    }

    const { data: created, error } = await this.client
      .from('articles')
      .insert({
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        draft_mdx_source: input.draftMdxSource,
        draft_updated_at: now,
        visibility: input.visibility ?? 'FREE',
        status: 'DRAFT',
        topic_id: input.topicId ?? null,
        cover_image_url: input.coverImageUrl ?? null,
        cover_image_alt: input.coverImageAlt ?? null,
        seo_title: input.seoTitle ?? null,
        seo_description: input.seoDescription ?? null,
        reading_time_minutes: input.readingTimeMinutes ?? 5,
        author_id: SEED_AUTHOR.id,
        published_at: null,
        scheduled_at: null,
        version: 1,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error || !created) {
      throw new Error(error?.message || 'فشل إنشاء المسودة');
    }
    return created;
  }

  async isSlugAvailable(slug: string, excludeArticleId?: string): Promise<boolean> {
    let query = this.client
      .from('articles')
      .select('id')
      .eq('slug', slug);

    if (excludeArticleId) {
      query = query.neq('id', excludeArticleId);
    }

    const { data } = await query.maybeSingle();
    return !data;
  }

  async publishArticle(input: PublishInput): Promise<ArticleWithRevision> {
    const { error } = await this.client.rpc('publish_article_revision', {
      p_article_id: input.id,
      p_expected_version: input.expectedVersion,
      p_title: input.title ?? '',
      p_slug: input.slug ?? '',
      p_excerpt: input.excerpt ?? '',
      p_visibility: input.visibility ?? 'FREE',
      p_topic_id: input.topicId ?? null,
      p_cover_image_url: input.coverImageUrl ?? null,
      p_cover_image_alt: input.coverImageAlt ?? null,
      p_seo_title: input.seoTitle ?? null,
      p_seo_description: input.seoDescription ?? null,
      p_reading_time_minutes: input.readingTimeMinutes ?? 5,
      p_mdx_source: input.mdxSource,
      p_rich_html: input.richHtml,
      p_markdown_derivative: input.markdownDerivative,
      p_plaintext_derivative: input.plaintextDerivative,
      p_published_at: input.publishedAt ?? new Date().toISOString(),
    });

    if (error) {
      if (error.message.includes('VERSION_CONFLICT')) {
        throw new VersionConflictError(input.expectedVersion, -1);
      }
      throw new Error(error.message);
    }

    const published = await this.getArticleById(input.id);
    if (!published) {
      throw new Error('فشل جلب المقال المنشور');
    }
    return published;
  }

  async scheduleArticle(input: ScheduleInput): Promise<Article> {
    const { data: current } = await this.client
      .from('articles')
      .select('version')
      .eq('id', input.id)
      .single();

    if (!current) throw new Error('المقال غير موجود');
    if (current.version !== input.expectedVersion) {
      throw new VersionConflictError(input.expectedVersion, current.version);
    }

    const { data, error } = await this.client
      .from('articles')
      .update({
        status: 'SCHEDULED',
        scheduled_at: input.scheduledAt,
        version: current.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', input.id)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'فشل جدولة المقال');
    return data;
  }

  async unpublishArticle(id: string, expectedVersion: number): Promise<Article> {
    const { data: current } = await this.client
      .from('articles')
      .select('version')
      .eq('id', id)
      .single();

    if (!current) throw new Error('المقال غير موجود');
    if (current.version !== expectedVersion) {
      throw new VersionConflictError(expectedVersion, current.version);
    }

    const { data, error } = await this.client
      .from('articles')
      .update({
        status: 'DRAFT',
        version: current.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'فشل إلغاء نشر المقال');
    return data;
  }

  async archiveArticle(id: string): Promise<Article> {
    const { data: current } = await this.client
      .from('articles')
      .select('version')
      .eq('id', id)
      .single();

    if (!current) throw new Error('المقال غير موجود');

    const { data, error } = await this.client
      .from('articles')
      .update({
        status: 'ARCHIVED',
        version: current.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'فشل أرشفة المقال');
    return data;
  }

  async unarchiveArticle(id: string): Promise<Article> {
    const { data: current } = await this.client
      .from('articles')
      .select('version')
      .eq('id', id)
      .single();

    if (!current) throw new Error('المقال غير موجود');

    const { data, error } = await this.client
      .from('articles')
      .update({
        status: 'DRAFT',
        version: current.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'فشل استرجاع المقال من الأرشيف');
    return data;
  }

  async bulkArchive(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const { data, error } = await this.client
      .from('articles')
      .update({
        status: 'ARCHIVED',
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .select('id');

    if (error || !data) return 0;
    return data.length;
  }

  async duplicateArticle(id: string): Promise<Article> {
    const source = await this.getArticleById(id);
    if (!source) throw new Error('المقال المراد نسخه غير موجود');

    const newSlug = `${source.slug}-copy`;
    const now = new Date().toISOString();

    const { data: clone, error } = await this.client
      .from('articles')
      .insert({
        title: `${source.title} (نسخة)`,
        slug: newSlug,
        excerpt: source.excerpt,
        cover_image_url: source.cover_image_url,
        cover_image_alt: source.cover_image_alt,
        visibility: source.visibility,
        status: 'DRAFT',
        topic_id: source.topic_id,
        author_id: source.author_id,
        reading_time_minutes: source.reading_time_minutes,
        seo_title: source.seo_title,
        seo_description: source.seo_description,
        version: 1,
        published_at: null,
        scheduled_at: null,
        draft_mdx_source: source.revision?.mdx_source ?? null,
        draft_updated_at: now,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (error || !clone) throw new Error(error?.message || 'فشل استنساخ المقال');
    return clone;
  }

  async getRevisions(articleId: string): Promise<ArticleRevision[]> {
    const { data, error } = await this.client
      .from('article_revisions')
      .select('*')
      .eq('article_id', articleId)
      .order('revision_number', { ascending: false });

    if (error || !data) return [];
    return data;
  }

  async getRevision(articleId: string, revisionNumber: number): Promise<ArticleRevision | null> {
    const { data, error } = await this.client
      .from('article_revisions')
      .select('*')
      .eq('article_id', articleId)
      .eq('revision_number', revisionNumber)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  }

  async getScheduledDueArticles(): Promise<Article[]> {
    const now = new Date().toISOString();
    const { data, error } = await this.client
      .from('articles')
      .select('*')
      .eq('status', 'SCHEDULED')
      .lte('scheduled_at', now);

    if (error || !data) return [];
    return data;
  }

  private async fetchRevisionsForArticles(
    articleIds: string[]
  ): Promise<Map<string, ArticleRevision[]>> {
    const map = new Map<string, ArticleRevision[]>();
    if (articleIds.length === 0) return map;

    const { data } = await this.client
      .from('article_revisions')
      .select('*')
      .in('article_id', articleIds)
      .order('revision_number', { ascending: false });

    if (!data) return map;

    for (const rev of data) {
      const list = map.get(rev.article_id) || [];
      list.push(rev);
      map.set(rev.article_id, list);
    }

    return map;
  }

  private async fetchTopicsMap(): Promise<Map<string, Topic>> {
    const map = new Map<string, Topic>();
    const { data } = await this.client.from('topics').select('*');
    if (!data) return map;

    for (const topic of data) {
      map.set(topic.id, topic);
    }
    return map;
  }

  private async getTopicById(id: string): Promise<Topic | null> {
    const { data } = await this.client.from('topics').select('*').eq('id', id).maybeSingle();
    return data || null;
  }

  private createFallbackRevision(article: Article): ArticleRevision {
    return {
      id: `fallback-rev-${article.id}`,
      article_id: article.id,
      revision_number: 1,
      mdx_source: article.draft_mdx_source || '',
      rich_html: '',
      markdown_derivative: '',
      plaintext_derivative: '',
      created_at: article.updated_at,
    };
  }
}
