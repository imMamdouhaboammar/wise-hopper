import { notFound, redirect } from 'next/navigation';
import { MdxStudioEditor } from '@/components/studio/mdx-studio-editor';
import { getPublishedArticles } from '@/lib/data/article-service';
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
  const articles = await getPublishedArticles();
  const article = articles.find((a) => a.id === id) || articles[0];

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
        initialMdx={article.revision.mdx_source}
        initialVisibility={article.visibility}
      />
    </div>
  );
}
