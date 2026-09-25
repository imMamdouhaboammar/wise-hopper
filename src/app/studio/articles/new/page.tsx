import { MdxStudioEditor } from '@/components/studio/mdx-studio-editor';

export default function NewArticlePage() {
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
