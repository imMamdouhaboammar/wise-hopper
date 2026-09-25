'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Image as ImageIcon,
  Upload,
  AlertCircle,
  CheckCircle2,
  Tag,
  Globe,
  Share2,
  X,
} from 'lucide-react';
import { STUDIO_STRINGS } from '@/lib/studio/strings';
import { SEED_TOPICS } from '@/lib/data/article-service';

export interface MetadataState {
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  coverImageAlt: string;
  topicId: string;
  tags: string[];
  visibility: 'FREE' | 'PREMIUM';
  seoTitle: string;
  seoDescription: string;
}

interface MetadataSidebarProps {
  metadata: MetadataState;
  onChange: (updater: (prev: MetadataState) => MetadataState) => void;
  articleId?: string;
  isSlugUnique?: boolean;
  onCheckSlug?: (slug: string) => Promise<boolean>;
}

export function MetadataSidebar({
  metadata,
  onChange,
  onCheckSlug,
}: MetadataSidebarProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'seo'>('general');
  const [tagInput, setTagInput] = useState('');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'duplicate'>('idle');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Debounced live slug availability check
  useEffect(() => {
    if (!metadata.slug || !onCheckSlug) {
      setSlugStatus('idle');
      return;
    }

    setSlugStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const isAvailable = await onCheckSlug(metadata.slug);
        setSlugStatus(isAvailable ? 'available' : 'duplicate');
      } catch {
        setSlugStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [metadata.slug, onCheckSlug]);

  const handleCoverUpload = async (file: File) => {
    setIsUploadingCover(true);
    setCoverUploadError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/studio/media', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || STUDIO_STRINGS.uploadErrorFailed);
      }

      const data = await res.json();
      if (!data.success || !data.url) {
        throw new Error(data.error || STUDIO_STRINGS.uploadErrorFailed);
      }

      onChange((prev) => ({ ...prev, coverImageUrl: data.url }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : STUDIO_STRINGS.uploadErrorFailed;
      setCoverUploadError(msg);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = tagInput.trim().replace(/^,|,$/g, '');
      if (trimmed && !metadata.tags.includes(trimmed)) {
        onChange((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const isCoverAltMissing = Boolean(metadata.coverImageUrl) && !metadata.coverImageAlt.trim();

  return (
    <aside className="w-full bg-white rounded-3xl border border-lavender-border shadow-xs overflow-hidden flex flex-col" dir="rtl">
      {/* Header Tabs */}
      <div className="flex items-center border-b border-lavender-border bg-slate-50/50 p-1.5 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex-1 py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'general'
              ? 'bg-white text-primary shadow-xs'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{STUDIO_STRINGS.metadataTitle}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`flex-1 py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition-colors ${
            activeTab === 'seo'
              ? 'bg-white text-primary shadow-xs'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{STUDIO_STRINGS.seoSettings}</span>
        </button>
      </div>

      <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-220px)]">
        {activeTab === 'general' ? (
          <>
            {/* Slug & Permalink */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-ink-primary">
                  {STUDIO_STRINGS.slugLabel}
                </label>
                {slugStatus === 'checking' && (
                  <span className="text-[10px] text-ink-muted font-medium">جارٍ التحقق…</span>
                )}
                {slugStatus === 'available' && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    متاح
                  </span>
                )}
                {slugStatus === 'duplicate' && (
                  <span className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    مستخدم مسبقاً
                  </span>
                )}
              </div>
              <input
                type="text"
                value={metadata.slug}
                onChange={(e) => onChange((prev) => ({ ...prev, slug: e.target.value }))}
                dir="ltr"
                placeholder={STUDIO_STRINGS.slugPlaceholder}
                className={`w-full px-3 py-2 rounded-xl text-xs font-mono text-ink-primary border transition-colors ${
                  slugStatus === 'duplicate'
                    ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-200'
                    : 'border-lavender-border focus:ring-primary/20'
                } focus:outline-hidden focus:ring-2`}
              />
              <p className="mt-1 text-[11px] text-ink-muted truncate" dir="ltr">
                https://wise-hopper.io/articles/{metadata.slug || '...'}
              </p>
            </div>

            {/* Excerpt with Character Counter */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-ink-primary">
                  {STUDIO_STRINGS.excerptLabel}
                </label>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    metadata.excerpt.length > 160
                      ? 'text-amber-600'
                      : metadata.excerpt.length < 50
                      ? 'text-ink-muted'
                      : 'text-emerald-600'
                  }`}
                >
                  {metadata.excerpt.length} / 160 حرف
                </span>
              </div>
              <textarea
                rows={3}
                value={metadata.excerpt}
                onChange={(e) => onChange((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder={STUDIO_STRINGS.excerptPlaceholder}
                className="w-full px-3 py-2 rounded-xl border border-lavender-border text-xs text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 leading-relaxed"
              />
              <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    metadata.excerpt.length > 160
                      ? 'bg-amber-500'
                      : metadata.excerpt.length < 50
                      ? 'bg-slate-300'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (metadata.excerpt.length / 160) * 100)}%` }}
                />
              </div>
            </div>

            {/* Cover Image & Alt Text */}
            <div className="space-y-3 pt-3 border-t border-lavender-border">
              <label className="text-xs font-bold text-ink-primary block">
                {STUDIO_STRINGS.coverImageLabel}
              </label>

              {metadata.coverImageUrl ? (
                <div className="space-y-2">
                  <div className="relative group rounded-xl overflow-hidden bg-slate-50 border border-lavender-border aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={metadata.coverImageUrl}
                      alt={metadata.coverImageAlt || 'غلاف المقال'}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => onChange((prev) => ({ ...prev, coverImageUrl: '' }))}
                      className="absolute top-2 left-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="إزالة الغلاف"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={metadata.coverImageUrl}
                    onChange={(e) => onChange((prev) => ({ ...prev, coverImageUrl: e.target.value }))}
                    dir="ltr"
                    placeholder="https://..."
                    className="w-full px-3 py-1 text-[11px] font-mono rounded-lg border border-lavender-border text-ink-secondary bg-slate-50"
                  />
                </div>
              ) : (
                <div className="border border-dashed border-lavender-border rounded-xl p-4 text-center bg-lavender-light/30 space-y-2">
                  <ImageIcon className="w-6 h-6 text-primary/40 mx-auto" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingCover}
                    className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 mx-auto"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingCover ? STUDIO_STRINGS.figureUploading : 'رفع صورة غلاف'}</span>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverUpload(file);
                }}
              />

              {coverUploadError && (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{coverUploadError}</span>
                </p>
              )}

              {/* Cover Alt Text (Mandatory if cover is set) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-ink-secondary">
                    {STUDIO_STRINGS.coverImageAltLabel}
                  </label>
                  {isCoverAltMissing && (
                    <span className="text-rose-600 text-[10px] font-extrabold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      مطلوب
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={metadata.coverImageAlt}
                  onChange={(e) => onChange((prev) => ({ ...prev, coverImageAlt: e.target.value }))}
                  placeholder={STUDIO_STRINGS.figureAltPlaceholder}
                  className={`w-full px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    isCoverAltMissing
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-200'
                      : 'border-lavender-border focus:ring-primary/20'
                  } focus:outline-hidden focus:ring-2`}
                />
              </div>
            </div>

            {/* Topic & Visibility */}
            <div className="space-y-3 pt-3 border-t border-lavender-border">
              <div>
                <label className="text-xs font-bold text-ink-primary block mb-1">
                  {STUDIO_STRINGS.topicLabel}
                </label>
                <select
                  value={metadata.topicId}
                  onChange={(e) => onChange((prev) => ({ ...prev, topicId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-lavender-border text-xs font-semibold text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  <option value="">بدون تصنيف محدد</option>
                  {SEED_TOPICS.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink-primary block mb-1">
                  {STUDIO_STRINGS.visibilityLabel}
                </label>
                <select
                  value={metadata.visibility}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'FREE' || val === 'PREMIUM') {
                      onChange((prev) => ({ ...prev, visibility: val }));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-lavender-border text-xs font-semibold text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  <option value="FREE">{STUDIO_STRINGS.visibilityFree}</option>
                  <option value="PREMIUM">{STUDIO_STRINGS.visibilityPremium}</option>
                </select>
              </div>
            </div>

            {/* Tags Input */}
            <div className="space-y-2 pt-3 border-t border-lavender-border">
              <label className="text-xs font-bold text-ink-primary flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span>{STUDIO_STRINGS.tagsLabel}</span>
              </label>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-lavender text-primary font-bold text-[11px]"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={STUDIO_STRINGS.addTagPlaceholder}
                className="w-full px-3 py-1.5 rounded-xl border border-lavender-border text-xs text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </>
        ) : (
          /* SEO & Social Cards Tab */
          <div className="space-y-5">
            {/* SEO Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-ink-primary">
                  {STUDIO_STRINGS.seoTitleLabel}
                </label>
                <span className="text-[10px] font-mono text-ink-muted">
                  {metadata.seoTitle.length} / 60 حرف
                </span>
              </div>
              <input
                type="text"
                value={metadata.seoTitle}
                onChange={(e) => onChange((prev) => ({ ...prev, seoTitle: e.target.value }))}
                placeholder="عنوان يظهر في محركات البحث…"
                className="w-full px-3 py-2 rounded-xl border border-lavender-border text-xs text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* SEO Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-ink-primary">
                  {STUDIO_STRINGS.seoDescLabel}
                </label>
                <span className="text-[10px] font-mono text-ink-muted">
                  {metadata.seoDescription.length} / 160 حرف
                </span>
              </div>
              <textarea
                rows={3}
                value={metadata.seoDescription}
                onChange={(e) => onChange((prev) => ({ ...prev, seoDescription: e.target.value }))}
                placeholder="وصف ترويجي يظهر أسفل الرابط في جوجل…"
                className="w-full px-3 py-2 rounded-xl border border-lavender-border text-xs text-ink-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 leading-relaxed"
              />
            </div>

            {/* Google Search Result Preview */}
            <div className="space-y-2 pt-3 border-t border-lavender-border">
              <span className="text-xs font-bold text-ink-secondary block">
                {STUDIO_STRINGS.seoSearchPreview}
              </span>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-lavender-border text-right space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-sans" dir="ltr">
                  <span className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold">
                    W
                  </span>
                  <span>https://wise-hopper.io › articles › {metadata.slug || 'slug'}</span>
                </div>
                <h4 className="text-sm font-bold text-blue-800 hover:underline cursor-pointer truncate">
                  {metadata.seoTitle || 'عنوان المقال في محركات البحث'}
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {metadata.seoDescription || metadata.excerpt || 'وصف المقال الترويجي في نتائج البحث…'}
                </p>
              </div>
            </div>

            {/* Social Share (OpenGraph) Preview Card */}
            <div className="space-y-2 pt-3 border-t border-lavender-border">
              <span className="text-xs font-bold text-ink-secondary flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" />
                <span>{STUDIO_STRINGS.seoOgPreview}</span>
              </span>
              <div className="rounded-2xl border border-lavender-border overflow-hidden bg-slate-50 text-right">
                {metadata.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={metadata.coverImageUrl}
                    alt="معاينة المشاركة الاجتماعية"
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="w-full aspect-video bg-lavender-light flex items-center justify-center text-primary/40">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <span className="text-[10px] font-mono text-ink-muted block uppercase" dir="ltr">
                    wise-hopper.io
                  </span>
                  <h5 className="text-xs font-bold text-ink-primary truncate">
                    {metadata.seoTitle || 'عنوان المقال'}
                  </h5>
                  <p className="text-[11px] text-ink-secondary line-clamp-2 leading-relaxed">
                    {metadata.seoDescription || metadata.excerpt || 'مقتطف تعريفي موجز بالمقال…'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
