'use client';

import { AlertTriangle, RefreshCw, Check } from 'lucide-react';
import { STUDIO_STRINGS } from '@/lib/studio/strings';

interface ConflictModalProps {
  isOpen: boolean;
  serverVersion?: number;
  expectedVersion?: number;
  onKeepMine: () => void;
  onLoadTheirs: () => void;
}

export function ConflictModal({
  isOpen,
  serverVersion = 2,
  expectedVersion = 1,
  onKeepMine,
  onLoadTheirs,
}: ConflictModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl max-w-lg w-full border border-lavender-border shadow-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 text-amber-600">
          <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-ink-primary">
              {STUDIO_STRINGS.conflictTitle}
            </h3>
            <span className="text-[11px] text-ink-secondary">
              تعارض في الإصدار التحريري المتزامن
            </span>
          </div>
        </div>

        <p className="text-xs text-ink-secondary leading-relaxed">
          {STUDIO_STRINGS.conflictMessage}
        </p>

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-lavender-border text-xs space-y-1.5 font-mono">
          <div className="flex justify-between text-ink-secondary">
            <span>إصدارك المحلي:</span>
            <span className="font-bold text-ink-primary">الإصدار {expectedVersion}</span>
          </div>
          <div className="flex justify-between text-ink-secondary">
            <span>إصدار الخادم الأحدث:</span>
            <span className="font-bold text-primary">الإصدار {serverVersion}</span>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onLoadTheirs}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-ink-primary text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{STUDIO_STRINGS.loadTheirs}</span>
          </button>

          <button
            type="button"
            onClick={onKeepMine}
            className="w-full sm:w-auto px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{STUDIO_STRINGS.keepMine}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
