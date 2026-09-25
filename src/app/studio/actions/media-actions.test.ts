import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadArticleMediaAction } from './media-actions';
import { isAllowedMediaType, MAX_MEDIA_SIZE_BYTES } from '@/lib/studio/media-constants';
import * as sessionModule from '@/lib/auth/session';

describe('Media Actions & Upload Validation', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('validates allowed image formats (JPEG, PNG, WebP, AVIF) and rejects SVG', () => {
    expect(isAllowedMediaType('image/jpeg')).toBe(true);
    expect(isAllowedMediaType('image/png')).toBe(true);
    expect(isAllowedMediaType('image/webp')).toBe(true);
    expect(isAllowedMediaType('image/avif')).toBe(true);

    expect(isAllowedMediaType('image/svg+xml')).toBe(false);
    expect(isAllowedMediaType('image/gif')).toBe(false);
    expect(isAllowedMediaType('application/pdf')).toBe(false);
    expect(isAllowedMediaType('text/html')).toBe(false);
  });

  it('rejects uploads if session is not owner', async () => {
    vi.spyOn(sessionModule, 'verifyOwnerSession').mockResolvedValue({
      isOwner: false,
      userId: 'anonymous-user',
    });

    const formData = new FormData();
    const fakeFile = new File(['fake-content'], 'test.png', { type: 'image/png' });
    formData.append('file', fakeFile);

    const result = await uploadArticleMediaAction(formData, 'art-123');
    expect(result.success).toBe(false);
    expect(result.error).toContain('غير مصرح');
  });

  it('rejects uploads exceeding 5MB max size limit', async () => {
    vi.spyOn(sessionModule, 'verifyOwnerSession').mockResolvedValue({
      isOwner: true,
      userId: 'owner-id',
    });

    const formData = new FormData();
    const bigBytes = new Uint8Array(MAX_MEDIA_SIZE_BYTES + 1024);
    const fakeFile = new File([bigBytes], 'big.png', { type: 'image/png' });
    formData.append('file', fakeFile);

    const result = await uploadArticleMediaAction(formData, 'art-123');
    expect(result.success).toBe(false);
    expect(result.error).toContain('5 ميجابايت');
  });

  it('rejects forbidden file types like SVG or executable', async () => {
    vi.spyOn(sessionModule, 'verifyOwnerSession').mockResolvedValue({
      isOwner: true,
      userId: 'owner-id',
    });

    const formData = new FormData();
    const fakeFile = new File(['<svg>malicious</svg>'], 'image.svg', { type: 'image/svg+xml' });
    formData.append('file', fakeFile);

    const result = await uploadArticleMediaAction(formData, 'art-123');
    expect(result.success).toBe(false);
    expect(result.error).toContain('الصيغة غير مدعومة');
  });

  it('successfully processes valid image for authenticated owner', async () => {
    vi.spyOn(sessionModule, 'verifyOwnerSession').mockResolvedValue({
      isOwner: true,
      userId: 'owner-id',
    });

    const formData = new FormData();
    const fakeFile = new File(['dummy-bytes'], 'photo.webp', { type: 'image/webp' });
    formData.append('file', fakeFile);

    const result = await uploadArticleMediaAction(formData, 'art-123');
    expect(result.success).toBe(true);
    expect(result.url).toBeDefined();
    expect(result.url?.length).toBeGreaterThan(0);
  });
});
