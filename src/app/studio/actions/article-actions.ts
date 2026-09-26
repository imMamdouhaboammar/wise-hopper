'use server';

import { verifyOwnerSession } from '@/lib/auth/session';
import {
  getArticleRepository,
  type SaveDraftInput,
  type PublishInput,
  type ScheduleInput,
  VersionConflictError,
  type ArticleWithRevision,
} from '@/lib/data';
import type { Article, ArticleRevision } from '@/lib/supabase/types';

export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  isConflict?: boolean;
  serverVersion?: number;
  expectedVersion?: number;
}

/**
 * Server action to save or update an article draft with optimistic concurrency locking.
 * Invariant: Must call verifyOwnerSession() first line.
 */
export async function saveArticleDraftAction(
  input: SaveDraftInput
): Promise<ActionResponse<Article>> {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    return { success: false, error: 'غير مصرح: تتطلب هذه العملية جلسة مالك الاستوديو' };
  }

  try {
    const repo = getArticleRepository();
    const article = await repo.saveDraft(input);
    return { success: true, data: article };
  } catch (err: unknown) {
    if (err instanceof VersionConflictError) {
      return {
        success: false,
        isConflict: true,
        serverVersion: err.currentVersion,
        expectedVersion: err.expectedVersion,
        error: err.message,
      };
    }
    const message = err instanceof Error ? err.message : 'فشل في حفظ المسودة';
    return { success: false, error: message };
  }
}

/**
 * Server action to verify if a slug is available for an article.
 * Invariant: Must call verifyOwnerSession() first line.
 */
export async function checkSlugAvailableAction(
  slug: string,
  excludeArticleId?: string
): Promise<boolean> {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    return false;
  }

  try {
    const repo = getArticleRepository();
    return await repo.isSlugAvailable(slug, excludeArticleId);
  } catch {
    return false;
  }
}

/**
 * Server action to fetch revision history for an article.
 * Invariant: Must call verifyOwnerSession() first line.
 */
export async function getArticleRevisionsAction(
  articleId: string
): Promise<ActionResponse<ArticleRevision[]>> {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    const repo = getArticleRepository();
    const revisions = await repo.getRevisions(articleId);
    return { success: true, data: revisions };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل في جلب المراجعات';
    return { success: false, error: message };
  }
}

/**
 * Server action to fetch a single historical revision for an article.
 * Invariant: Must call verifyOwnerSession() first line.
 */
export async function getArticleRevisionAction(
  articleId: string,
  revisionNumber: number
): Promise<ActionResponse<ArticleRevision | null>> {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    const repo = getArticleRepository();
    const revision = await repo.getRevision(articleId, revisionNumber);
    return { success: true, data: revision };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل في جلب المراجعة';
    return { success: false, error: message };
  }
}

/**
 * Server action to publish an article atomically with optimistic concurrency locking.
 * Invariant: Must call verifyOwnerSession() first line.
 */
export async function publishArticleAction(
  input: PublishInput
): Promise<ActionResponse<ArticleWithRevision>> {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    const repo = getArticleRepository();
    const article = await repo.publishArticle(input);
    return { success: true, data: article };
  } catch (err: unknown) {
    if (err instanceof VersionConflictError) {
      return {
        success: false,
        isConflict: true,
        serverVersion: err.currentVersion,
        expectedVersion: err.expectedVersion,
        error: err.message,
      };
    }
    const message = err instanceof Error ? err.message : 'فشل في نشر المقال';
    return { success: false, error: message };
  }
}

/**
 * Server action to schedule an article for future publication.
 * Invariant: Must call verifyOwnerSession() first line.
 */
export async function scheduleArticleAction(
  input: ScheduleInput
): Promise<ActionResponse<Article>> {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    const repo = getArticleRepository();
    const article = await repo.scheduleArticle(input);
    return { success: true, data: article };
  } catch (err: unknown) {
    if (err instanceof VersionConflictError) {
      return {
        success: false,
        isConflict: true,
        serverVersion: err.currentVersion,
        expectedVersion: err.expectedVersion,
        error: err.message,
      };
    }
    const message = err instanceof Error ? err.message : 'فشل في جدولة المقال';
    return { success: false, error: message };
  }
}

/**
 * Server action to unpublish an article back to draft.
 * Invariant: Must call verifyOwnerSession() first line.
 */
export async function unpublishArticleAction(
  id: string,
  expectedVersion: number
): Promise<ActionResponse<Article>> {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    const repo = getArticleRepository();
    const article = await repo.unpublishArticle(id, expectedVersion);
    return { success: true, data: article };
  } catch (err: unknown) {
    if (err instanceof VersionConflictError) {
      return {
        success: false,
        isConflict: true,
        serverVersion: err.currentVersion,
        expectedVersion: err.expectedVersion,
        error: err.message,
      };
    }
    const message = err instanceof Error ? err.message : 'فشل في إلغاء نشر المقال';
    return { success: false, error: message };
  }
}

/**
 * Server action to archive an article.
 * Invariant: Must call verifyOwnerSession() first line.
 */
export async function archiveArticleAction(id: string): Promise<ActionResponse<Article>> {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    const repo = getArticleRepository();
    const article = await repo.archiveArticle(id);
    return { success: true, data: article };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل في أرشفة المقال';
    return { success: false, error: message };
  }
}

/**
 * Server action to unarchive an article.
 * Invariant: Must call verifyOwnerSession() first line.
 */
export async function unarchiveArticleAction(id: string): Promise<ActionResponse<Article>> {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    const repo = getArticleRepository();
    const article = await repo.unarchiveArticle(id);
    return { success: true, data: article };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل في إلغاء أرشفة المقال';
    return { success: false, error: message };
  }
}

/**
 * Server action to duplicate an article as a new draft.
 * Invariant: Must call verifyOwnerSession() first line.
 */
export async function duplicateArticleAction(id: string): Promise<ActionResponse<Article>> {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    const repo = getArticleRepository();
    const article = await repo.duplicateArticle(id);
    return { success: true, data: article };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل في نسخ المقال';
    return { success: false, error: message };
  }
}

/**
 * Server action to bulk archive multiple articles.
 * Invariant: Must call verifyOwnerSession() first line.
 */
export async function bulkArchiveArticlesAction(
  ids: string[]
): Promise<ActionResponse<{ count: number }>> {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    return { success: false, error: 'غير مصرح' };
  }

  try {
    const repo = getArticleRepository();
    const count = await repo.bulkArchive(ids);
    return { success: true, data: { count } };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'فشل في أرشفة المقالات المحددة';
    return { success: false, error: message };
  }
}
