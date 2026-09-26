import { NextRequest, NextResponse } from 'next/server';
import { uploadArticleMediaAction } from '@/app/studio/actions/media-actions';
import { verifyOwnerSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const session = await verifyOwnerSession(request);
  if (!session.isOwner) {
    return NextResponse.json({ error: 'Unauthorized: Owner session required' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const articleId = request.nextUrl.searchParams.get('articleId') || undefined;
    const result = await uploadArticleMediaAction(formData, articleId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Media upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
