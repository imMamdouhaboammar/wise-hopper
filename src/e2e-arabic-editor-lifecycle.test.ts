import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import * as sessionModule from '@/lib/auth/session';
import { getArticleRepository } from '@/lib/data';
import {
  saveArticleDraftAction,
  publishArticleAction,
  getArticleRevisionsAction,
} from '@/app/studio/actions/article-actions';
import { compileRichHtml, compileNormalizedMarkdown, compilePlainText } from '@/lib/content/compiler';
import { validateMdxSource } from '@/lib/content/allowlist';
import { GET as contentRouteHandler } from '@/app/api/content/[slug]/route';

describe('E2E Full Arabic Editor Lifecycle & Derivative Compilation', () => {
  const testStudioKey = 'test-studio-secret-key-32-chars-ok';

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.STUDIO_SECRET_KEY = testStudioKey;
    vi.spyOn(sessionModule, 'verifyOwnerSession').mockResolvedValue({
      isOwner: true,
      userId: 'owner-test-id',
    });
  });

  it('completes the entire end-to-end authoring and publishing lifecycle', async () => {
    const slug = 'arabic-editorial-manifesto-' + Date.now();
    const title = 'بيان في التحرير الرقمي العربي المعاصر';
    const excerpt = 'رؤية معمارية متكاملة لإنشاء محتوى عربي أصيل وعالي الجودة.';

    // 1. Initial Draft Creation
    const draft1Res = await saveArticleDraftAction({
      title,
      slug,
      excerpt,
      draftMdxSource: '# ' + title + '\n\nمسودة أولية قيد التحرير.',
      visibility: 'FREE',
    });

    expect(draft1Res.success).toBe(true);
    expect(draft1Res.data).toBeDefined();
    const articleId = draft1Res.data!.id;
    let currentVersion = draft1Res.data!.version;

    // 2. Rich Editing with all custom components (Callout, PullQuote, Figure, Table, Mermaid)
    const richMdx = `# ${title}

اللغة العربية على الويب المعاصر تحتاج إلى معمارية نشر تحترم خصوصية الحرف وطبيعة القراءة.

<Callout type="info" title="أهمية التصميم التحريري">
التصميم التحريري ليس مجرد خط جميل، بل هو هندسة للمقروئية والتناغم البصري.
</Callout>

| العنصر الهندسي | المعيار المتبع | الغرض التحريري |
| :--- | :--- | :--- |
| الخط العربي | IBM Plex Arabic | راحة العين في القراءات الطويلة |
| ارتفاع السطر | 1.85 | منع تداخل حركات الإعراب |

<PullQuote quote="التصميم هو الذكاء عندما يصبح مرئياً." author="بول راند" />

<Figure src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c" alt="مخطوطة عربية تراثية مع تصميم رقمي حديث" caption="التناغم بين الأصالة والحداثة في الطباعة" />

\`\`\`mermaid
graph TD
  MDX[مستند MDX المرجعي] --> AST[شجرة النحو]
  AST --> HTML[HTML تفاعلي]
  AST --> MD[Markdown نقي]
  AST --> TXT[UTF-8 نص صلب]
\`\`\`

خاتمة وتأملات ختامية حول استقلالية النشر.`;

    // Validate MDX against strict allowlist before saving
    const mdxValidation = validateMdxSource(richMdx);
    expect(mdxValidation.isValid).toBe(true);
    expect(mdxValidation.errors).toHaveLength(0);

    // 3. Save enriched draft with optimistic version check
    const draft2Res = await saveArticleDraftAction({
      id: articleId,
      title,
      slug,
      excerpt,
      draftMdxSource: richMdx,
      coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
      coverImageAlt: 'غلاف المقال التحريري مع نص بديل إلزامي',
      visibility: 'FREE',
      expectedVersion: currentVersion,
    });

    expect(draft2Res.success).toBe(true);
    currentVersion = draft2Res.data!.version;

    // 4. Pre-publish compilation of 3 derivatives server-side
    const [richHtml, markdownDerivative, plaintextDerivative] = await Promise.all([
      compileRichHtml(richMdx),
      compileNormalizedMarkdown(richMdx),
      compilePlainText(richMdx, {
        title,
        authorName: 'ممدوح أبو عمار',
        publishedAt: '2026-09-25',
      }),
    ]);

    expect(richHtml).toContain('editorial-callout');
    expect(richHtml).toContain('editorial-pullquote');
    expect(richHtml).toContain('editorial-figure');
    expect(richHtml).toContain('editorial-mermaid');
    expect(markdownDerivative).toContain('> [!info]');
    expect(plaintextDerivative).toContain('بيان في التحرير الرقمي العربي المعاصر');

    // 5. Atomic Publish
    const publishRes = await publishArticleAction({
      id: articleId,
      expectedVersion: currentVersion,
      title,
      slug,
      excerpt,
      coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c',
      coverImageAlt: 'غلاف المقال التحريري مع نص بديل إلزامي',
      visibility: 'FREE',
      mdxSource: richMdx,
      richHtml,
      markdownDerivative,
      plaintextDerivative,
    });

    expect(publishRes.success).toBe(true);
    expect(publishRes.data?.status).toBe('PUBLISHED');
    currentVersion = publishRes.data!.version;

    // 6. Verify Derivatives Delivery via Content Route
    const mdReq = new NextRequest(`http://localhost:3000/api/content/${slug}?format=md`);
    const mdRes = await contentRouteHandler(mdReq, {
      params: Promise.resolve({ slug }),
    });
    expect(mdRes.status).toBe(200);
    const mdBody = await mdRes.text();
    expect(mdBody).toContain('# ' + title);
    expect(mdBody).toContain('> [!info]');

    const txtReq = new NextRequest(`http://localhost:3000/api/content/${slug}?format=txt`);
    const txtRes = await contentRouteHandler(txtReq, {
      params: Promise.resolve({ slug }),
    });
    expect(txtRes.status).toBe(200);
    const txtBody = await txtRes.text();
    expect(txtBody).toContain(title);
    expect(txtBody).toContain('ممدوح أبو عمار');
    expect(txtBody).not.toContain('<div');

    // 7. Verify Revision History
    const revsRes = await getArticleRevisionsAction(articleId);
    expect(revsRes.success).toBe(true);
    expect(revsRes.data).toHaveLength(1);
    expect(revsRes.data![0].revision_number).toBe(1);

    // 8. Subsequent draft editing does not overwrite the published revision
    const draft3Res = await saveArticleDraftAction({
      id: articleId,
      title: title + ' (مسودة تعديل لاحقة)',
      slug,
      excerpt,
      draftMdxSource: '# مسودة تعديل غير منشورة بعد',
      expectedVersion: currentVersion,
    });
    expect(draft3Res.success).toBe(true);

    const repo = getArticleRepository();
    const publishedCheck = await repo.getPublishedArticleBySlug(slug);
    expect(publishedCheck).toBeDefined();
    // Published revision remains unmutated
    expect(publishedCheck?.revision.mdx_source).toContain('<Callout');
    expect(publishedCheck?.draft_mdx_source).toBe('# مسودة تعديل غير منشورة بعد');

    // Confirm public derivative endpoint still serves published revision, not unpublished draft
    const mdReqAfterDraft = new NextRequest(`http://localhost:3000/api/content/${slug}?format=md`);
    const mdResAfterDraft = await contentRouteHandler(mdReqAfterDraft, {
      params: Promise.resolve({ slug }),
    });
    const mdBodyAfterDraft = await mdResAfterDraft.text();
    expect(mdBodyAfterDraft).toContain('> [!info]');
    expect(mdBodyAfterDraft).not.toContain('مسودة تعديل غير منشورة بعد');
  });
});
