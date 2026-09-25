import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getPublishedArticles } from '@/lib/data/article-service';
import { verifyOwnerSession } from '@/lib/auth/session';

export default async function StudioArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    redirect('/account?error=unauthorized_studio');
  }

  const { tab = 'all' } = await searchParams;
  const articles = await getPublishedArticles();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary">إدارة المقالات والمسودات</h1>
          <p className="text-xs text-ink-secondary mt-1">
            تحكم في دورة حياة المقال من المسودة حتى النشر الذري وتتبع المراجعات.
          </p>
        </div>

        <Link
          href="/studio/articles/new"
          className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition-colors"
        >
          + مقال جديد
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-lavender-border text-xs font-semibold text-ink-secondary gap-6">
        <Link
          href="/studio/articles?tab=all"
          className={`pb-3 ${tab === 'all' ? 'text-primary border-b-2 border-primary font-bold' : 'hover:text-ink-primary'}`}
        >
          الكل ({articles.length})
        </Link>
        <Link
          href="/studio/articles?tab=published"
          className={`pb-3 ${tab === 'published' ? 'text-primary border-b-2 border-primary font-bold' : 'hover:text-ink-primary'}`}
        >
          المنشورة ({articles.length})
        </Link>
        <Link
          href="/studio/articles?tab=drafts"
          className={`pb-3 ${tab === 'drafts' ? 'text-primary border-b-2 border-primary font-bold' : 'hover:text-ink-primary'}`}
        >
          المسودات (0)
        </Link>
        <Link
          href="/studio/articles?tab=scheduled"
          className={`pb-3 ${tab === 'scheduled' ? 'text-primary border-b-2 border-primary font-bold' : 'hover:text-ink-primary'}`}
        >
          المجدولة (0)
        </Link>
      </div>

      {/* Article Items Table */}
      <div className="bg-white rounded-2xl border border-lavender-border divide-y divide-lavender-border overflow-hidden">
        {articles.map((article) => (
          <div key={article.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-lavender-light/20 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  article.visibility === 'PREMIUM'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  {article.visibility === 'PREMIUM' ? 'مدفوع' : 'مجاني'}
                </span>
                <span className="text-xs text-ink-muted">
                  تاريخ النشر: {article.published_at?.slice(0, 10)} • {article.reading_time_minutes} دقائق قراءة
                </span>
              </div>

              <h2 className="text-base font-bold text-ink-primary">
                <Link href={`/studio/articles/${article.id}/edit`} className="hover:text-primary transition-colors">
                  {article.title}
                </Link>
              </h2>
              <p className="text-xs text-ink-secondary line-clamp-1">{article.excerpt}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/studio/articles/${article.id}/edit`}
                className="px-3 py-1.5 bg-lavender text-primary hover:bg-lavender-dark text-xs font-semibold rounded-lg transition-colors"
              >
                تعديل ومراجعة
              </Link>
              <Link
                href={`/articles/${article.slug}`}
                target="_blank"
                className="px-3 py-1.5 bg-white text-ink-secondary hover:text-primary border border-lavender-border text-xs font-semibold rounded-lg transition-colors"
              >
                عرض على الويب ↗
              </Link>
              <Link
                href={`/content/${article.slug}.md`}
                target="_blank"
                className="px-2.5 py-1.5 bg-white text-ink-secondary hover:text-primary border border-lavender-border font-mono text-[11px] rounded-lg transition-colors"
              >
                .md
              </Link>
              <Link
                href={`/content/${article.slug}.txt`}
                target="_blank"
                className="px-2.5 py-1.5 bg-white text-ink-secondary hover:text-primary border border-lavender-border font-mono text-[11px] rounded-lg transition-colors"
              >
                .txt
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
