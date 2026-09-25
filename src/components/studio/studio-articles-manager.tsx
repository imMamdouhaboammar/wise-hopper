'use client';

import { useState, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Search,
  Plus,
  Copy,
  Archive,
  ArchiveRestore,
  ExternalLink,
  FileText,
  Code2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import type { Article, Topic } from '@/lib/supabase/types';
import type { ArticleCounts } from '@/lib/data';
import { STUDIO_STRINGS } from '@/lib/studio/strings';
import {
  duplicateArticleAction,
  archiveArticleAction,
  unarchiveArticleAction,
  bulkArchiveArticlesAction,
} from '@/app/studio/actions/article-actions';

interface StudioArticlesManagerProps {
  articles: (Article & { topic?: Topic | null })[];
  total: number;
  counts: ArticleCounts;
  topics: Topic[];
  currentTab: string;
  currentVisibility: string;
  currentTopicId?: string;
  currentQuery: string;
  currentSortBy: string;
  currentSortOrder: string;
  currentPage: number;
  pageSize: number;
}

export function StudioArticlesManager({
  articles,
  total,
  counts,
  topics,
  currentTab,
  currentVisibility,
  currentTopicId,
  currentQuery,
  currentSortBy,
  currentSortOrder,
  currentPage,
  pageSize,
}: StudioArticlesManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Helper to push updated search parameters to the URL
  const updateUrl = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === 'all' || value === 'ALL') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl({ q: searchQuery.trim() || null, page: '1' });
  };

  const handleTabChange = (tab: string) => {
    setSelectedIds([]);
    updateUrl({ tab, page: '1' });
  };

  const handleVisibilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl({ visibility: e.target.value, page: '1' });
  };

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl({ topic: e.target.value, page: '1' });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'updated_desc') {
      updateUrl({ sortBy: 'updated_at', sortOrder: 'desc', page: '1' });
    } else if (val === 'updated_asc') {
      updateUrl({ sortBy: 'updated_at', sortOrder: 'asc', page: '1' });
    } else if (val === 'published_desc') {
      updateUrl({ sortBy: 'published_at', sortOrder: 'desc', page: '1' });
    } else if (val === 'published_asc') {
      updateUrl({ sortBy: 'published_at', sortOrder: 'asc', page: '1' });
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateUrl({ page: String(newPage) });
    }
  };

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === articles.length && articles.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map((a) => a.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Row action handlers
  const handleDuplicate = async (id: string) => {
    setActiveActionId(id);
    setErrorMessage(null);
    try {
      const res = await duplicateArticleAction(id);
      if (res.success && res.data) {
        setActionMessage('تم إنشاء نسخة مسودة جديدة بنجاح');
        router.push(`/studio/articles/${res.data.id}/edit`);
      } else {
        setErrorMessage(res.error || 'فشل في نسخ المقال');
      }
    } catch {
      setErrorMessage('حدث خطأ غير متوقع أثناء نسخ المقال');
    } finally {
      setActiveActionId(null);
    }
  };

  const handleArchiveToggle = async (article: Article) => {
    setActiveActionId(article.id);
    setErrorMessage(null);
    try {
      if (article.status === 'ARCHIVED') {
        const res = await unarchiveArticleAction(article.id);
        if (res.success) {
          setActionMessage('تم إلغاء أرشفة المقال وإعادته إلى المسودات');
          router.refresh();
        } else {
          setErrorMessage(res.error || 'فشل في إلغاء الأرشفة');
        }
      } else {
        const res = await archiveArticleAction(article.id);
        if (res.success) {
          setActionMessage('تمت أرشفة المقال بنجاح');
          router.refresh();
        } else {
          setErrorMessage(res.error || 'فشل في أرشفة المقال');
        }
      }
    } catch {
      setErrorMessage('حدث خطأ أثناء تعديل حالة الأرشفة');
    } finally {
      setActiveActionId(null);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0) return;
    setActiveActionId('bulk');
    setErrorMessage(null);
    try {
      const res = await bulkArchiveArticlesAction(selectedIds);
      if (res.success && res.data) {
        setActionMessage(`تمت أرشفة ${res.data.count} مقال بنجاح`);
        setSelectedIds([]);
        router.refresh();
      } else {
        setErrorMessage(res.error || 'فشل في أرشفة المقالات المحددة');
      }
    } catch {
      setErrorMessage('حدث خطأ غير متوقع أثناء الأرشفة الجماعية');
    } finally {
      setActiveActionId(null);
    }
  };

  const allSelected = articles.length > 0 && selectedIds.length === articles.length;

  return (
    <div className="space-y-6">
      {/* Header and New Article CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary">إدارة المقالات والمسودات</h1>
          <p className="text-xs text-ink-secondary mt-1">
            تحكم في دورة حياة المقال من المسودة حتى النشر الذري وتتبع المراجعات.
          </p>
        </div>

        <Link
          href="/studio/articles/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{STUDIO_STRINGS.newArticle}</span>
        </Link>
      </div>

      {/* Action Messages */}
      {actionMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{actionMessage}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center justify-between">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-900 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Status Tabs Navigation */}
      <div className="flex border-b border-lavender-border text-xs font-semibold text-ink-secondary gap-2 sm:gap-6 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => handleTabChange('all')}
          className={`pb-3 px-1 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            currentTab === 'all'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'hover:text-ink-primary'
          }`}
        >
          <span>{STUDIO_STRINGS.all}</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 rounded-full text-ink-muted">
            {counts.published + counts.drafts + counts.scheduled + counts.archived}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('published')}
          className={`pb-3 px-1 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            currentTab === 'published'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'hover:text-ink-primary'
          }`}
        >
          <span>{STUDIO_STRINGS.statusPublished}</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-emerald-50 text-emerald-700 rounded-full">
            {counts.published}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('drafts')}
          className={`pb-3 px-1 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            currentTab === 'drafts'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'hover:text-ink-primary'
          }`}
        >
          <span>{STUDIO_STRINGS.statusDraft}</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-amber-50 text-amber-700 rounded-full">
            {counts.drafts}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('scheduled')}
          className={`pb-3 px-1 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            currentTab === 'scheduled'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'hover:text-ink-primary'
          }`}
        >
          <span>{STUDIO_STRINGS.statusScheduled}</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-blue-50 text-blue-700 rounded-full">
            {counts.scheduled}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('archived')}
          className={`pb-3 px-1 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
            currentTab === 'archived'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'hover:text-ink-primary'
          }`}
        >
          <span>{STUDIO_STRINGS.statusArchived}</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-full">
            {counts.archived}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-lavender-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        {/* Arabic Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={STUDIO_STRINGS.search}
            className="w-full pr-10 pl-4 py-2 bg-lavender-light/40 border border-lavender-border rounded-xl text-xs text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </form>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Visibility Filter */}
          <select
            value={currentVisibility}
            onChange={handleVisibilityChange}
            aria-label="نوع النفاذ"
            className="px-3 py-2 bg-white border border-lavender-border rounded-xl text-xs font-semibold text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          >
            <option value="ALL">كل أنواع النفاذ</option>
            <option value="FREE">مجاني فقط</option>
            <option value="PREMIUM">للمشتركين فقط</option>
          </select>

          {/* Topic Filter */}
          <select
            value={currentTopicId || 'ALL'}
            onChange={handleTopicChange}
            aria-label="التصنيف"
            className="px-3 py-2 bg-white border border-lavender-border rounded-xl text-xs font-semibold text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 max-w-[160px] truncate"
          >
            <option value="ALL">جميع التصنيفات</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>

          {/* Sorting Dropdown */}
          <select
            value={`${currentSortBy}_${currentSortOrder}`}
            onChange={handleSortChange}
            aria-label="ترتيب النتائج"
            className="px-3 py-2 bg-white border border-lavender-border rounded-xl text-xs font-semibold text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          >
            <option value="updated_at_desc">أحدث تعديل</option>
            <option value="updated_at_asc">أقدم تعديل</option>
            <option value="published_at_desc">تاريخ النشر (الأحدث)</option>
            <option value="published_at_asc">تاريخ النشر (الأقدم)</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Sticky Bar */}
      {selectedIds.length > 0 && (
        <div className="p-4 bg-lavender-light border border-primary/20 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-primary">
              تم تحديد {selectedIds.length} من أصل {articles.length} مقال
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkArchive}
              disabled={activeActionId === 'bulk'}
              className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {activeActionId === 'bulk' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Archive className="w-3.5 h-3.5" />
              )}
              <span>أرشفة المحددة</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 bg-white text-ink-secondary hover:text-ink-primary border border-lavender-border text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              إلغاء التحديد
            </button>
          </div>
        </div>
      )}

      {/* Articles Table Container */}
      <div className="bg-white rounded-2xl border border-lavender-border overflow-hidden shadow-2xs">
        {articles.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-lavender-light flex items-center justify-center mx-auto text-primary">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-ink-primary">لم يتم العثور على أي مقالات</h3>
            <p className="text-xs text-ink-secondary max-w-sm mx-auto">
              جرب تغيير معايير التصفية أو البحث للعثور على ما تبحث عنه.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                updateUrl({ q: null, tab: 'all', visibility: 'ALL', topic: 'ALL', page: '1' });
              }}
              className="px-4 py-2 bg-lavender text-primary hover:bg-lavender-dark text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              إعادة ضبط التصفية
            </button>
          </div>
        ) : (
          <div className="divide-y divide-lavender-border">
            {/* Table Header Row */}
            <div className="p-4 bg-lavender-light/30 flex items-center justify-between text-xs font-bold text-ink-secondary">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-ink-secondary hover:text-primary transition-colors cursor-pointer"
                  title={allSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
                <span>المقال والمعلومات</span>
              </div>
              <span>الإجراءات والمشتقات</span>
            </div>

            {/* Rows */}
            {articles.map((article) => {
              const isSelected = selectedIds.includes(article.id);
              const isPublished = article.status === 'PUBLISHED';
              const isScheduled = article.status === 'SCHEDULED';
              const isDraft = article.status === 'DRAFT';
              const isArchived = article.status === 'ARCHIVED';
              const isActionLoading = activeActionId === article.id;

              return (
                <div
                  key={article.id}
                  className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isSelected ? 'bg-primary/5' : 'hover:bg-lavender-light/20'
                  }`}
                >
                  {/* Left Column: Checkbox, Metadata, Title */}
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectRow(article.id)}
                      className="mt-1 text-ink-secondary hover:text-primary transition-colors cursor-pointer shrink-0"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-primary" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isScheduled
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : isDraft
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {isPublished
                            ? STUDIO_STRINGS.statusPublished
                            : isScheduled
                            ? STUDIO_STRINGS.statusScheduled
                            : isDraft
                            ? STUDIO_STRINGS.statusDraft
                            : STUDIO_STRINGS.statusArchived}
                        </span>

                        {/* Visibility Badge */}
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            article.visibility === 'PREMIUM'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-slate-100 text-ink-secondary border border-slate-200'
                          }`}
                        >
                          {article.visibility === 'PREMIUM'
                            ? STUDIO_STRINGS.statusPremium
                            : STUDIO_STRINGS.statusFree}
                        </span>

                        {/* Topic Tag if present */}
                        {article.topic && (
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-lavender text-primary rounded-full">
                            {article.topic.name}
                          </span>
                        )}

                        <span className="text-[11px] text-ink-muted">
                          {isPublished && article.published_at
                            ? `نُشر: ${article.published_at.slice(0, 10)}`
                            : isScheduled && article.scheduled_at
                            ? `مجدول: ${article.scheduled_at.slice(0, 10)}`
                            : `تعديل: ${article.updated_at.slice(0, 10)}`}
                        </span>

                        <span className="text-[11px] text-ink-muted">
                          • {article.reading_time_minutes} د قراءة
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-ink-primary">
                        <Link
                          href={`/studio/articles/${article.id}/edit`}
                          className="hover:text-primary transition-colors"
                        >
                          {article.title}
                        </Link>
                      </h2>

                      <p className="text-xs text-ink-secondary line-clamp-1 max-w-2xl">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Row Action Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 self-end md:self-auto">
                    {/* Edit Button */}
                    <Link
                      href={`/studio/articles/${article.id}/edit`}
                      className="px-3 py-1.5 bg-lavender text-primary hover:bg-lavender-dark text-xs font-semibold rounded-lg transition-colors"
                    >
                      تعديل
                    </Link>

                    {/* Duplicate Action */}
                    <button
                      type="button"
                      onClick={() => handleDuplicate(article.id)}
                      disabled={isActionLoading}
                      title="نسخ كمقال جديد"
                      className="p-1.5 bg-white text-ink-secondary hover:text-ink-primary hover:bg-lavender border border-lavender-border text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isActionLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Archive / Unarchive Action */}
                    <button
                      type="button"
                      onClick={() => handleArchiveToggle(article)}
                      disabled={isActionLoading}
                      title={isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}
                      className="p-1.5 bg-white text-ink-secondary hover:text-ink-primary hover:bg-lavender border border-lavender-border text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isArchived ? (
                        <ArchiveRestore className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Archive className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>

                    {/* Public and Derivative Links (Published articles only) */}
                    {isPublished && (
                      <>
                        <Link
                          href={`/articles/${article.slug}`}
                          target="_blank"
                          title="معاينة المقال المنشور"
                          className="p-1.5 bg-white text-ink-secondary hover:text-primary hover:bg-lavender border border-lavender-border text-xs rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/content/${article.slug}.md`}
                          target="_blank"
                          title="مشتق Markdown النقي"
                          className="px-2 py-1 bg-white text-ink-secondary hover:text-primary border border-lavender-border font-mono text-[10px] rounded-lg transition-colors"
                        >
                          .md
                        </Link>
                        <Link
                          href={`/content/${article.slug}.txt`}
                          target="_blank"
                          title="مشتق Plaintext النصي"
                          className="px-2 py-1 bg-white text-ink-secondary hover:text-primary border border-lavender-border font-mono text-[10px] rounded-lg transition-colors"
                        >
                          .txt
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {articles.length > 0 && (
          <div className="p-4 bg-lavender-light/20 border-t border-lavender-border flex items-center justify-between text-xs text-ink-secondary">
            <span>
              صفحة {currentPage} من {totalPages} (إجمالي {total} مقال)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isPending}
                className="px-3 py-1.5 bg-white border border-lavender-border rounded-lg text-ink-primary font-semibold flex items-center gap-1 hover:bg-lavender transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>السابق</span>
              </button>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isPending}
                className="px-3 py-1.5 bg-white border border-lavender-border rounded-lg text-ink-primary font-semibold flex items-center gap-1 hover:bg-lavender transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>التالي</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
