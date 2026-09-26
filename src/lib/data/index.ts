import type { ArticleRepository } from './article-repository';
import { SeedArticleRepository } from './seed-article-repository';
import { SupabaseArticleRepository } from './supabase-article-repository';

export * from './article-repository';
export * from './seed-article-repository';
export * from './supabase-article-repository';

let cachedRepository: ArticleRepository | null = null;

export function getArticleRepository(): ArticleRepository {
  if (cachedRepository) {
    return cachedRepository;
  }

  const isTest = process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'seed';
  const hasServiceKey =
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY) &&
    process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your-service-role-key-placeholder';

  if (isTest || !hasServiceKey) {
    cachedRepository = new SeedArticleRepository();
  } else {
    cachedRepository = new SupabaseArticleRepository();
  }

  return cachedRepository;
}
