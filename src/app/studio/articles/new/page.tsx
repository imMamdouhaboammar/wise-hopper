import { redirect } from 'next/navigation';
import { MdxStudioEditor } from '@/components/studio/mdx-studio-editor';
import { verifyOwnerSession } from '@/lib/auth/session';

export default async function NewArticlePage() {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    redirect('/account?error=unauthorized_studio');
  }
  return (
    <div className="space-y-6">
      <MdxStudioEditor
        initialTitle="عنوان المقال الجديد"
        initialSlug="new-essay"
        initialExcerpt="مقتطف تحليلي موجز بالمقال ومحتواه التحريري."
        initialVisibility="FREE"
      />
    </div>
  );
}
