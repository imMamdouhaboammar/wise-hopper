import { describe, it, expect } from 'vitest';
import { validateMdxSource } from '@/lib/content/allowlist';
import { mdxToProseMirror, proseMirrorToMdx } from '@/lib/editor/mdx-bridge';

describe('Editor Mode Switching & MDX Validation Safety', () => {
  it('validates allowed custom components (Callout, Figure, PullQuote, Mermaid)', () => {
    const validMdx = `
# عنوان المقال

فقرة تقديمية باللغة العربية.

<Callout type="info" title="تنبيه">
ملاحظة هامة للقراء.
</Callout>

<PullQuote quote="اقتباس عميق" author="ابن خلدون" />

<Figure src="https://example.com/image.png" alt="وصف بديل" caption="شرح الصورة" />

\`\`\`mermaid
graph LR
  A --> B
\`\`\`
`;

    const validation = validateMdxSource(validMdx);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);

    const pmDoc = mdxToProseMirror(validMdx);
    expect(pmDoc.type).toBe('doc');
    expect(pmDoc.content).toBeDefined();

    const roundTripped = proseMirrorToMdx(pmDoc);
    expect(roundTripped).toContain('Callout');
    expect(roundTripped).toContain('PullQuote');
    expect(roundTripped).toContain('Figure');
  });

  it('rejects unauthorized custom components when switching to Visual mode', () => {
    const invalidMdx = `
# عنوان المقال

<MaliciousWidget payload="eval(hack)" />

نص المقال.
`;
    const validation = validateMdxSource(invalidMdx);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some((e) => e.includes('MaliciousWidget'))).toBe(true);
  });

  it('rejects forbidden HTML tags like <script> or <iframe>', () => {
    const scriptMdx = `
# مقال مع شفرة خبيثة

<script>alert('xss');</script>
`;
    const validation = validateMdxSource(scriptMdx);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some((e) => e.includes('<script>'))).toBe(true);
  });

  it('rejects forbidden inline event handlers like onload or onclick', () => {
    const onclickMdx = `
<Callout type="info" title="تنبيه" onclick="doBadThing()">
محتوى
</Callout>
`;
    const validation = validateMdxSource(onclickMdx);
    expect(validation.isValid).toBe(false);
    expect(validation.errors.some((e) => e.includes('onclick'))).toBe(true);
  });

  it('preserves Arabic vocalization (tashkeel) during conversion', () => {
    const arabicTashkeelMdx = `
# النَّحْوُ العَرَبِيُّ

كَتَبَ التِّلْمِيذُ الدَّرْسَ بِعِنَايَةٍ فَائِقَةٍ.
`;
    const pmDoc = mdxToProseMirror(arabicTashkeelMdx);
    const serialized = proseMirrorToMdx(pmDoc);
    expect(serialized).toContain('النَّحْوُ العَرَبِيُّ');
    expect(serialized).toContain('كَتَبَ التِّلْمِيذُ الدَّرْسَ بِعِنَايَةٍ فَائِقَةٍ.');
  });
});
