import { notFound, redirect } from 'next/navigation';
import { MdxStudioEditor } from '@/components/studio/mdx-studio-editor';
import { getArticleRepository } from '@/lib/data';
import { verifyOwnerSession } from '@/lib/auth/session';

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    redirect('/account?error=unauthorized_studio');
  }

  const { id } = await params;
  const repo = getArticleRepository();
  const article = await repo.getArticleById(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <MdxStudioEditor
        articleId={article.id}
        initialTitle={article.title}
        initialSlug={article.slug}
        initialExcerpt={article.excerpt}
        initialMdx={article.draft_mdx_source || article.revision?.mdx_source || ''}
        initialVisibility={article.visibility}
        initialStatus={article.status}
        initialTopicId={article.topic_id || undefined}
        initialCoverImageUrl={article.cover_image_url || undefined}
        initialCoverImageAlt={article.cover_image_alt || undefined}
        initialSeoTitle={article.seo_title || undefined}
        initialSeoDescription={article.seo_description || undefined}
        initialVersion={article.version}
      />
    </div>
  );
}
