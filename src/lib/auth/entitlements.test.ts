import { describe, it, expect } from 'vitest';
import {
  evaluateContentAccess,
  extractTeaserContent,
  type ContentAccessResult,
} from './entitlements';

describe('Paywall & Zero-Leakage Security Engine (Fable TDD)', () => {
  const fullHtml = `
    <p>الفقرة الأولى من المقال التمهيدي للنشر العربي المتميز.</p>
    <p>الفقرة الثانية التي تقدم نظرة شاملة على تحديات بناء الأنظمة الموزعة.</p>
    <h2>القسم الحصري للمشتركين</h2>
    <p>هذا نص سري فائق الأهمية لا يجب أن يظهر لغير المشتركين تحت أي ظرف.</p>
  `;

  const fullMarkdown = `
الفقرة الأولى من المقال التمهيدي للنشر العربي المتميز.

الفقرة الثانية التي تقدم نظرة شاملة على تحديات بناء الأنظمة الموزعة.

## القسم الحصري للمشتركين
هذا نص سري فائق الأهمية لا يجب أن يظهر لغير المشتركين تحت أي ظرف.
  `.trim();

  const fullPlainText = `
الفقرة الأولى من المقال التمهيدي للنشر العربي المتميز.

الفقرة الثانية التي تقدم نظرة شاملة على تحديات بناء الأنظمة الموزعة.

القسم الحصري للمشتركين
هذا نص سري فائق الأهمية لا يجب أن يظهر لغير المشتركين تحت أي ظرف.
  `.trim();

  describe('Free Article Access', () => {
    it('grants full access to unauthenticated visitor when article is FREE', () => {
      const access: ContentAccessResult = evaluateContentAccess({
        visibility: 'FREE',
        isAuthenticated: false,
        hasEntitlement: false,
        fullHtml,
        fullMarkdown,
        fullPlainText,
      });

      expect(access.canAccessFull).toBe(true);
      expect(access.html).toBe(fullHtml);
      expect(access.markdown).toBe(fullMarkdown);
      expect(access.plainText).toBe(fullPlainText);
    });
  });

  describe('Premium Article Access & Paywall Protection (Zero Leakage)', () => {
    it('redacts premium body and returns only teaser when visitor is unauthorized', () => {
      const access: ContentAccessResult = evaluateContentAccess({
        visibility: 'PREMIUM',
        isAuthenticated: false,
        hasEntitlement: false,
        fullHtml,
        fullMarkdown,
        fullPlainText,
      });

      expect(access.canAccessFull).toBe(false);
      // Ensure the secret portion NEVER leaks
      expect(access.html).not.toContain('هذا نص سري');
      expect(access.markdown).not.toContain('هذا نص سري');
      expect(access.plainText).not.toContain('هذا نص سري');

      // Teaser paragraphs must be preserved
      expect(access.html).toContain('الفقرة الأولى');
      expect(access.html).toContain('الفقرة الثانية');
      expect(access.markdown).toContain('الفقرة الأولى');
      expect(access.plainText).toContain('الفقرة الأولى');
    });

    it('grants full access to authorized reader with active entitlement', () => {
      const access: ContentAccessResult = evaluateContentAccess({
        visibility: 'PREMIUM',
        isAuthenticated: true,
        hasEntitlement: true,
        fullHtml,
        fullMarkdown,
        fullPlainText,
      });

      expect(access.canAccessFull).toBe(true);
      expect(access.html).toContain('هذا نص سري');
      expect(access.markdown).toContain('هذا نص سري');
      expect(access.plainText).toContain('هذا نص سري');
    });

    it('denies full access if user is authenticated but lacks active entitlement', () => {
      const access: ContentAccessResult = evaluateContentAccess({
        visibility: 'PREMIUM',
        isAuthenticated: true,
        hasEntitlement: false,
        fullHtml,
        fullMarkdown,
        fullPlainText,
      });

      expect(access.canAccessFull).toBe(false);
      expect(access.html).not.toContain('هذا نص سري');
    });

    it('extracts teaser representations without leaking premium sections', () => {
      const teaser = extractTeaserContent(fullHtml, fullMarkdown, fullPlainText);
      expect(teaser.teaserHtml).toContain('الفقرة الأولى');
      expect(teaser.teaserHtml).not.toContain('هذا نص سري');
      expect(teaser.teaserMarkdown).toContain('الفقرة الأولى');
      expect(teaser.teaserMarkdown).not.toContain('هذا نص سري');
      expect(teaser.teaserPlainText).toContain('الفقرة الأولى');
      expect(teaser.teaserPlainText).not.toContain('هذا نص سري');
    });
  });
});
