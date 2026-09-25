'use client';

import { useState } from 'react';
import { History, X, RotateCcw, Clock, FileText, CheckCircle2 } from 'lucide-react';
import type { ArticleRevision } from '@/lib/supabase/types';
import { STUDIO_STRINGS } from '@/lib/studio/strings';

interface RevisionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  revisions: ArticleRevision[];
  currentMdx?: string;
  onRestoreRevision: (mdxSource: string) => void;
}

export function RevisionsDrawer({
  isOpen,
  onClose,
  revisions,
  currentMdx: _currentMdx,
  onRestoreRevision,
}: RevisionsDrawerProps) {
  const [selectedRevisionNumber, setSelectedRevisionNumber] = useState<number | null>(
    revisions.length > 0 ? (revisions[0]?.revision_number ?? null) : null
  );

  if (!isOpen) return null;

  const selectedRevision = revisions.find((r) => r.revision_number === selectedRevisionNumber);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full border border-lavender-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-lavender-border bg-slate-50/50">
          <div className="flex items-center gap-2 text-primary font-bold text-base">
            <History className="w-5 h-5" />
            <h3>{STUDIO_STRINGS.revisionsTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-ink-muted hover:text-ink-primary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 overflow-hidden">
          {/* Revisions List Column */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-l border-lavender-border p-4 space-y-2 overflow-y-auto max-h-[60vh]">
            <div className="p-3 bg-lavender-light rounded-xl border border-primary/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-ink-primary">{STUDIO_STRINGS.currentDraft}</span>
                <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-white rounded-full border border-primary/20">
                  النشطة
                </span>
              </div>
              <p className="text-[11px] text-ink-secondary">المسودة المفتوحة حالياً في المحرر</p>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-ink-secondary px-1 block mb-2">
                المراجعات المعتمدة المنشورة:
              </span>
              {revisions.length === 0 ? (
                <div className="text-center p-6 text-xs text-ink-muted">
                  لا توجد مراجعات تاريخية منشورة بعد لهذا المقال.
                </div>
              ) : (
                <div className="space-y-2">
                  {revisions.map((rev) => {
                    const isSelected = rev.revision_number === selectedRevisionNumber;
                    const dateFormatted = new Date(rev.created_at).toLocaleString('ar-SA', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    });

                    return (
                      <button
                        key={rev.id}
                        type="button"
                        onClick={() => setSelectedRevisionNumber(rev.revision_number)}
                        className={`w-full text-right p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-lavender text-primary border-primary shadow-2xs font-semibold'
                            : 'bg-white hover:bg-slate-50 border-lavender-border text-ink-primary'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">
                            {STUDIO_STRINGS.revisionNumber(rev.revision_number)}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-ink-secondary">
                          <Clock className="w-3 h-3" />
                          <span>{dateFormatted}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Revision Preview Column */}
          <div className="md:col-span-7 p-5 flex flex-col overflow-y-auto max-h-[60vh] space-y-4">
            {selectedRevision ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-lavender-border">
                  <div>
                    <h4 className="font-bold text-sm text-ink-primary">
                      {STUDIO_STRINGS.revisionNumber(selectedRevision.revision_number)}
                    </h4>
                    <span className="text-[11px] text-ink-secondary font-mono">
                      {selectedRevision.created_at}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onRestoreRevision(selectedRevision.mdx_source);
                      onClose();
                    }}
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{STUDIO_STRINGS.restoreToDraft}</span>
                  </button>
                </div>

                <div className="space-y-2 flex-1">
                  <span className="text-xs font-bold text-ink-secondary flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>كود MDX للمراجعة:</span>
                  </span>
                  <pre
                    className="p-4 rounded-xl bg-slate-50 border border-lavender-border text-xs font-mono text-ink-primary whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed"
                    dir="ltr"
                  >
                    {selectedRevision.mdx_source}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-ink-muted text-xs">
                اختر مراجعة من القائمة الجانبية لعرض محتواها ومقارنتها.
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-lavender-border bg-slate-50/50 flex justify-end">
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
