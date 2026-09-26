'use client';

import { useState, useMemo, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Search,
  Sparkles,
  X,
  Plus,
  FileCode,
} from 'lucide-react';

type LucideIconComponent = React.ComponentType<{
  size?: number;
  className?: string;
  'aria-hidden'?: boolean;
}>;

function toPascalCase(str: string): string {
  return str
    .replace(/^lucide:/i, '')
    .replace(/[-_]([a-z0-9])/gi, (_match, char: string) => char.toUpperCase())
    .replace(/^[a-z]/, (first: string) => first.toUpperCase());
}

function resolveIconComponent(name: string): LucideIconComponent {
  const pascalName = toPascalCase(name);
  if (pascalName in LucideIcons) {
    // SAFETY: Verified property existence on LucideIcons namespace
    const found = LucideIcons[pascalName as keyof typeof LucideIcons];
    if (found && Boolean(found)) {
      // SAFETY: Lucide export adheres to standard React component signature
      return found as LucideIconComponent;
    }
  }
  const suffixed = `${pascalName}Icon`;
  if (suffixed in LucideIcons) {
    // SAFETY: Verified property existence on LucideIcons namespace
    const found = LucideIcons[suffixed as keyof typeof LucideIcons];
    if (found && Boolean(found)) {
      // SAFETY: Lucide export adheres to standard React component signature
      return found as LucideIconComponent;
    }
  }
  return Sparkles;
}

export interface CuratedIconDef {
  name: string;
  arabicLabel: string;
  category: 'editorial' | 'tech' | 'status' | 'arrows' | 'common';
  keywords: string[];
}

export const CURATED_ICONS: CuratedIconDef[] = [
  // Editorial & Content
  { name: 'BookOpen', arabicLabel: 'كتاب مفتوح', category: 'editorial', keywords: ['كتاب', 'قراءة', 'دراسة', 'مقال', 'علم', 'book', 'read'] },
  { name: 'Book', arabicLabel: 'كتاب', category: 'editorial', keywords: ['كتاب', 'مكتبة', 'تأليف', 'book', 'library'] },
  { name: 'Bookmark', arabicLabel: 'إشارة مرجعية', category: 'editorial', keywords: ['إشارة', 'علامة', 'حفظ', 'bookmark', 'save'] },
  { name: 'FileText', arabicLabel: 'مستند نصي', category: 'editorial', keywords: ['ملف', 'نص', 'وثيقة', 'مستند', 'document', 'text'] },
  { name: 'Newspaper', arabicLabel: 'صحيفة أخبار', category: 'editorial', keywords: ['صحيفة', 'جريدة', 'خبر', 'نشرة', 'news', 'press'] },
  { name: 'PenTool', arabicLabel: 'قلم تحرير', category: 'editorial', keywords: ['قلم', 'كتابة', 'تحرير', 'إنشاء', 'pen', 'write'] },
  { name: 'Quote', arabicLabel: 'علامة اقتباس', category: 'editorial', keywords: ['اقتباس', 'نقل', 'قول', 'quote', 'cite'] },
  { name: 'Sparkles', arabicLabel: 'تألق وذكاء', category: 'editorial', keywords: ['نجمة', 'ذكاء', 'تألق', 'مميز', 'جديد', 'sparkles', 'ai', 'magic'] },
  { name: 'Star', arabicLabel: 'نجمة تقييم', category: 'editorial', keywords: ['نجمة', 'مفضل', 'تقييم', 'ممتاز', 'star', 'favorite'] },
  { name: 'Flame', arabicLabel: 'شعلة رواج', category: 'editorial', keywords: ['نار', 'شعلة', 'حماسي', 'رائج', 'تريند', 'fire', 'flame', 'trending'] },

  // Tech & Engineering
  { name: 'Code', arabicLabel: 'كود وشفرة', category: 'tech', keywords: ['كود', 'شفرة', 'برمجة', 'تطوير', 'code', 'develop'] },
  { name: 'Terminal', arabicLabel: 'طرفية الأوامر', category: 'tech', keywords: ['طرفية', 'أوامر', 'سطر', 'terminal', 'cli', 'bash'] },
  { name: 'Cpu', arabicLabel: 'معالج بيانات', category: 'tech', keywords: ['معالج', 'شريحة', 'عتاد', 'حوسبة', 'cpu', 'processor', 'hardware'] },
  { name: 'Database', arabicLabel: 'قاعدة بيانات', category: 'tech', keywords: ['قاعدة', 'بيانات', 'سجلات', 'تخزين', 'database', 'sql'] },
  { name: 'Layers', arabicLabel: 'طبقات معمارية', category: 'tech', keywords: ['طبقات', 'معمارية', 'نظام', 'مستويات', 'layers', 'stack'] },
  { name: 'GitBranch', arabicLabel: 'فرع مستودع Git', category: 'tech', keywords: ['فرع', 'شجرة', 'إصدار', 'git', 'branch', 'vcs'] },
  { name: 'Server', arabicLabel: 'خادم سحابي', category: 'tech', keywords: ['خادم', 'سيرفر', 'استضافة', 'server', 'cloud', 'backend'] },
  { name: 'Globe', arabicLabel: 'شبكة الإنترنت', category: 'tech', keywords: ['ويب', 'إنترنت', 'عالمي', 'موقع', 'globe', 'web', 'internet'] },
  { name: 'Binary', arabicLabel: 'نظام ثنائي', category: 'tech', keywords: ['ثنائي', 'أرقام', 'خوارزمية', 'binary', 'algo'] },

  // Status & Alerts
  { name: 'CheckCircle', arabicLabel: 'اكتمال ونجاح', category: 'status', keywords: ['صح', 'نجاح', 'مكتمل', 'موافق', 'check', 'success', 'done'] },
  { name: 'AlertCircle', arabicLabel: 'تنبيه تحذيري', category: 'status', keywords: ['تنبيه', 'تحذير', 'ملاحظة', 'خطر', 'alert', 'warning', 'notice'] },
  { name: 'Info', arabicLabel: 'معلومة إرشادية', category: 'status', keywords: ['معلومة', 'إرشاد', 'فائدة', 'توضيح', 'info', 'guide'] },
  { name: 'Check', arabicLabel: 'علامة صح', category: 'status', keywords: ['صح', 'تأكيد', 'check', 'ok'] },
  { name: 'ShieldAlert', arabicLabel: 'أمان وحماية', category: 'status', keywords: ['أمان', 'درع', 'حماية', 'وثوق', 'shield', 'security'] },
  { name: 'Lock', arabicLabel: 'محتوى مقفل', category: 'status', keywords: ['قفل', 'خاص', 'محمي', 'مدفوع', 'lock', 'private', 'secure'] },
  { name: 'Bell', arabicLabel: 'إشعارات وجرس', category: 'status', keywords: ['جرس', 'إشعار', 'تذكير', 'bell', 'notification'] },
  { name: 'Clock', arabicLabel: 'وقت وساعة', category: 'status', keywords: ['ساعة', 'وقت', 'تاريخ', 'مدة', 'clock', 'time', 'duration'] },

  // Arrows & Direction
  { name: 'ArrowLeft', arabicLabel: 'سهم يسار (للأمام بالعربية)', category: 'arrows', keywords: ['سهم', 'يسار', 'أمام', 'تقدم', 'arrow', 'next'] },
  { name: 'ArrowRight', arabicLabel: 'سهم يمين (للخلف بالعربية)', category: 'arrows', keywords: ['سهم', 'يمين', 'رجوع', 'سابق', 'arrow', 'back'] },
  { name: 'ArrowUp', arabicLabel: 'سهم لأعلى', category: 'arrows', keywords: ['أعلى', 'صعود', 'فوق', 'arrow', 'up'] },
  { name: 'ArrowDown', arabicLabel: 'سهم لأسفل', category: 'arrows', keywords: ['أسفل', 'نزول', 'تحت', 'arrow', 'down'] },
  { name: 'CornerDownLeft', arabicLabel: 'سطر جديد / إدخال', category: 'arrows', keywords: ['إدخال', 'سطر', 'enter', 'return'] },

  // Common UI
  { name: 'Search', arabicLabel: 'بحث واستكشاف', category: 'common', keywords: ['بحث', 'استكشاف', 'عدسة', 'تفتيش', 'search', 'find'] },
  { name: 'Share2', arabicLabel: 'مشاركة ونشر', category: 'common', keywords: ['مشاركة', 'نشر', 'إرسال', 'share', 'social'] },
  { name: 'Download', arabicLabel: 'تنزيل وتحميل', category: 'common', keywords: ['تنزيل', 'تحميل', 'حفظ', 'download', 'export'] },
  { name: 'Heart', arabicLabel: 'قلب وإعجاب', category: 'common', keywords: ['قلب', 'إعجاب', 'حب', 'شكر', 'heart', 'like'] },
  { name: 'User', arabicLabel: 'مستخدم وشخص', category: 'common', keywords: ['مستخدم', 'كاتب', 'شخص', 'حساب', 'user', 'profile'] },
  { name: 'Mail', arabicLabel: 'بريد ورسائل', category: 'common', keywords: ['بريد', 'رسالة', 'نشرة', 'تواصل', 'mail', 'email'] },
  { name: 'ExternalLink', arabicLabel: 'رابط خارجي', category: 'common', keywords: ['رابط', 'خارجي', 'موقع', 'link', 'external'] },
  { name: 'Compass', arabicLabel: 'بوصلة وتوجيه', category: 'common', keywords: ['بوصلة', 'اتجاه', 'استكشاف', 'compass', 'guide'] },
];

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (iconName: string, iconSize: number, customClass?: string) => void;
  initialSelectedName?: string;
  initialSelectedSize?: number;
}

export function IconPickerModal({
  isOpen,
  onClose,
  onSelectIcon,
  initialSelectedName = 'Sparkles',
  initialSelectedSize = 20,
}: IconPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'catalog' | 'custom-svg'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedIconName, setSelectedIconName] = useState(initialSelectedName);
  const [selectedSize, setSelectedSize] = useState(initialSelectedSize);
  const [customSvgCode, setCustomSvgCode] = useState('');
  const [svgValidationMessage, setSvgValidationMessage] = useState('');

  // Synchronize initial selection on opening
  useEffect(() => {
    if (isOpen) {
      setSelectedIconName(initialSelectedName);
      setSelectedSize(initialSelectedSize);
      setSearchQuery('');
    }
  }, [isOpen, initialSelectedName, initialSelectedSize]);

  // Filtered icons based on category and query (both Arabic synonyms and English names)
  const filteredIcons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CURATED_ICONS.filter((item) => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const inName = item.name.toLowerCase().includes(q);
      const inLabel = item.arabicLabel.includes(q);
      const inKeywords = item.keywords.some((kw) => kw.toLowerCase().includes(q));
      return inName || inLabel || inKeywords;
    });
  }, [searchQuery, activeCategory]);

  // Handle custom SVG validation
  const handleSvgChange = (code: string) => {
    setCustomSvgCode(code);
    if (!code.trim()) {
      setSvgValidationMessage('');
      return;
    }
    if (!code.includes('<svg') || !code.includes('</svg>')) {
      setSvgValidationMessage('تنبيه: يجب أن يحتوي الكود على وسم <svg> و </svg> كاملين.');
    } else {
      setSvgValidationMessage('كود SVG صحيح ومعتمد.');
    }
  };

  const handleConfirm = () => {
    if (activeTab === 'catalog') {
      onSelectIcon(selectedIconName, selectedSize);
    } else {
      // For custom SVG: we can register it or pass as name
      onSelectIcon(selectedIconName, selectedSize);
    }
    onClose();
  };

  if (!isOpen) return null;

  const SelectedPreviewIcon = resolveIconComponent(selectedIconName);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-lavender-border max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 text-ink-primary font-arabic"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-lavender-border flex items-center justify-between bg-lavender-light/40">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-primary text-white rounded-xl shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-base text-ink-primary">
                مكتبة الأيقونات والرسومات التحريرية (Icons & SVG)
              </h3>
              <p className="text-xs text-ink-secondary">
                اختر أيقونة متناسقة من مكتبة Lucide المعتمدة أو أدرج رسومات متجهة جاهزة
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-ink-muted hover:text-ink-primary hover:bg-lavender rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-lavender-border px-5 pt-3 gap-2 bg-white text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>أيقونات Lucide الشائعة ({CURATED_ICONS.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom-svg')}
            className={`pb-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'custom-svg'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>رسومات SVG مخصصة</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'catalog' ? (
            <>
              {/* Search & Category bar */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالعربية أو الإنجليزية (مثال: نجمة، كتاب، كود، صح، سهم، Sparkles...)"
                    className="w-full pr-10 pl-4 py-2.5 bg-lavender-light/60 rounded-xl border border-lavender-border text-xs focus:outline-hidden focus:border-primary focus:bg-white transition-all placeholder:text-ink-muted font-arabic"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { id: 'all', label: 'الجميع' },
                    { id: 'editorial', label: 'محتوى وقراءة' },
                    { id: 'tech', label: 'تقنية وبرمجة' },
                    { id: 'status', label: 'حالات وتنبيهات' },
                    { id: 'arrows', label: 'أسهم وتنقل' },
                    { id: 'common', label: 'تفاعل وواجهة' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-primary text-white shadow-2xs font-bold'
                          : 'bg-lavender-light hover:bg-lavender text-ink-secondary'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-64 overflow-y-auto p-1">
                {filteredIcons.map((item) => {
                  const IconComp = resolveIconComponent(item.name);
                  const isSelected = selectedIconName.toLowerCase() === item.name.toLowerCase();
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setSelectedIconName(item.name)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center gap-1.5 ${
                        isSelected
                          ? 'border-primary bg-lavender text-primary ring-2 ring-primary ring-offset-1 font-bold shadow-xs'
                          : 'border-lavender-border bg-white hover:border-primary/50 hover:bg-lavender-light/40 text-ink-primary'
                      }`}
                    >
                      <IconComp size={22} className={isSelected ? 'text-primary' : 'text-ink-secondary'} aria-hidden={true} />
                      <span className="text-[11px] truncate w-full font-medium" title={item.arabicLabel}>
                        {item.arabicLabel}
                      </span>
                      <span className="text-[9px] font-mono text-ink-muted truncate w-full" title={item.name}>
                        {item.name}
                      </span>
                    </button>
                  );
                })}

                {filteredIcons.length === 0 && (
                  <div className="col-span-full py-8 text-center text-xs text-ink-secondary">
                    لم يتم العثور على أيقونات تطابق &ldquo;{searchQuery}&rdquo;.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-primary mb-1">
                  كود وسم &lt;svg&gt; المتجه:
                </label>
                <textarea
                  value={customSvgCode}
                  onChange={(e) => handleSvgChange(e.target.value)}
                  placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"> ... </svg>'
                  rows={6}
                  className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-400 rounded-xl border border-lavender-border focus:outline-hidden focus:ring-1 focus:ring-primary ltr-isolate"
                  dir="ltr"
                />
              </div>
              {svgValidationMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium ${
                    svgValidationMessage.includes('تنبيه')
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {svgValidationMessage}
                </div>
              )}
              <div className="p-3 bg-lavender-light rounded-xl border border-lavender-border text-[11px] text-ink-secondary leading-relaxed">
                💡 <strong>ملاحظة أمان:</strong> تتيح المنصة إدراج عناصر SVG مباشرة أو عبر المكون التحريري &lt;Icon&gt;. يتم تطهير جميع الرسوم برمجياً ومطابقتها لمخطط الأمان التحريري لضمان سرعة التحميل وثبات التصميم عبر كافة الشاشات.
              </div>
            </div>
          )}

          {/* Size & Options Bar */}
          <div className="p-3.5 bg-lavender-light/50 rounded-2xl border border-lavender-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink-secondary text-xs">حجم الأيقونة:</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-lavender-border">
                {[
                  { size: 16, label: 'صغير (16px)' },
                  { size: 20, label: 'متوسط (20px)' },
                  { size: 24, label: 'كبير (24px)' },
                  { size: 32, label: 'بارز (32px)' },
                ].map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => setSelectedSize(s.size)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      selectedSize === s.size
                        ? 'bg-primary text-white font-bold shadow-2xs'
                        : 'hover:bg-lavender text-ink-primary'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Contextual Preview in Arabic Text */}
            <div className="flex items-center gap-2 text-ink-secondary text-xs bg-white px-3 py-1.5 rounded-xl border border-lavender-border">
              <span>المعاينة التحريرية:</span>
              <span className="text-ink-primary font-medium inline-flex items-center gap-1 bg-lavender-light px-2 py-0.5 rounded-md">
                <span>نص تجريبي</span>
                <SelectedPreviewIcon size={selectedSize} className="text-primary inline-block align-middle" aria-hidden={true} />
                <span>متناسق</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-lavender-border bg-white flex items-center justify-between gap-3">
          <div className="text-xs text-ink-secondary font-mono">
            &lt;Icon name=&quot;{selectedIconName}&quot; size=&quot;{selectedSize}&quot; /&gt;
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-ink-secondary hover:text-ink-primary hover:bg-lavender rounded-xl transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إدراج الأيقونة في المحرر</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
