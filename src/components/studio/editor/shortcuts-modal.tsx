'use client';

import { STUDIO_STRINGS } from '@/lib/studio/strings';
import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_GROUPS = [
  {
    title: 'تنسيق النصوص المباشر',
    shortcuts: [
      { label: 'نص غامق', key: '⌘ / Ctrl + B' },
      { label: 'نص مائل', key: '⌘ / Ctrl + I' },
      { label: 'نص مشطوب', key: '⌘ / Ctrl + Shift + X' },
      { label: 'رمز برمجي ضمن السطر', key: '⌘ / Ctrl + E' },
      { label: 'إدراج أو تعديل رابط', key: '⌘ / Ctrl + K' },
    ],
  },
  {
    title: 'هيكلة الفقرات والعناوين',
    shortcuts: [
      { label: 'عنوان فرعي كبير (H2)', key: '⌘ / Ctrl + Alt + 2' },
      { label: 'عنوان قسم (H3)', key: '⌘ / Ctrl + Alt + 3' },
      { label: 'عنوان فرعي صغير (H4)', key: '⌘ / Ctrl + Alt + 4' },
      { label: 'تحويل إلى فقرة عادية', key: '⌘ / Ctrl + Alt + 0' },
      { label: 'اقتباس مقالي', key: '⌘ / Ctrl + Shift + B' },
      { label: 'قائمة نقطية', key: '⌘ / Ctrl + Shift + 8' },
      { label: 'قائمة رقمية', key: '⌘ / Ctrl + Shift + 7' },
      { label: 'كتلة برمجية', key: '⌘ / Ctrl + Alt + C' },
    ],
  },
  {
    title: 'الأوامر التحريرية السريعة',
    shortcuts: [
      { label: 'فتح قائمة الإدراج الذكية', key: '/' },
      { label: 'عرض اختصارات لوحة المفاتيح', key: '?' },
      { label: 'التراجع عن التغيير', key: '⌘ / Ctrl + Z' },
      { label: 'إعادة التغيير المتراجع عنه', key: '⌘ / Ctrl + Shift + Z' },
    ],
  },
];

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full border border-lavender-border shadow-2xl p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-lavender-border">
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <Keyboard className="w-5 h-5" />
            <h3>{STUDIO_STRINGS.shortcuts}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-ink-muted hover:text-ink-primary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
          {SHORTCUT_GROUPS.map((group, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h4 className="text-xs font-bold text-ink-secondary">{group.title}</h4>
              <div className="grid grid-cols-1 gap-2">
                {group.shortcuts.map((s, sIdx) => (
                  <div
                    key={sIdx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-lavender-border/60 text-xs"
                  >
                    <span className="font-semibold text-ink-primary">{s.label}</span>
                    <kbd
                      dir="ltr"
                      className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-white border border-lavender-border text-primary font-bold shadow-2xs"
                    >
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-lavender-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-lavender hover:bg-lavender-dark text-primary text-xs font-bold rounded-xl transition-colors"
          >
            {STUDIO_STRINGS.close}
          </button>
        </div>
      </div>
    </div>
  );
}
