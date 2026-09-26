export const ALLOWED_MEDIA_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

export const MAX_MEDIA_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function isAllowedMediaType(type: string): type is AllowedMediaType {
  return ALLOWED_MEDIA_TYPES.some((allowed) => allowed === type);
}
