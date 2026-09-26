'use client';

import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AdminLoginCardProps {
  initialError?: string;
  redirectTarget?: string;
  isCollapsedDefault?: boolean;
}

export function AdminLoginCard({
  initialError,
  redirectTarget = '/studio',
  isCollapsedDefault = false,
}: AdminLoginCardProps) {
  const [isOpen, setIsOpen] = useState(!isCollapsedDefault || Boolean(initialError));
  const [secretKey, setSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    if (initialError === 'invalid_credentials') {
      return 'المفتاح السري المدخل غير صحيح. يرجى التحقق وإعادة المحاولة.';
    }
    if (initialError === 'server_misconfigured') {
      return 'تنبيه النظام: لم يتم ضبط STUDIO_SECRET_KEY في متغيرات البيئة أو أن طوله أقل من 32 حرفاً.';
    }
    return null;
  });
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const cleanKey = secretKey.trim();

    if (!cleanKey) {
      setErrorMessage('يرجى إدخال مفتاح الاستوديو السري.');
      return;
    }

    if (cleanKey.length < 32) {
      setErrorMessage('مفتاح الاستوديو السري يجب ألا يقل عن 32 حرفاً.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/studio/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: cleanKey, redirect: redirectTarget }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMessage(data.message || 'فشل التحقق: المفتاح السري غير صحيح.');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      const destination = data.redirect || redirectTarget || '/studio';
      window.location.href = destination;
    } catch {
      setErrorMessage('تعذر الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-lavender-border/70 shadow-soft-xs overflow-hidden transition-all">
      {/* Header bar / Toggle */}
      <div
        className="p-5 sm:p-6 bg-lavender-light/40 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-ink-primary">
                تسجيل دخول مالك المنصة
              </span>
              <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-md">
                Admin Studio Gate
              </span>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              الوصول إلى استوديو النشر والتحرير وإدارة المقالات والنشرة البريدية
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-ink-secondary hover:text-ink-primary p-1.5 rounded-lg transition-colors cursor-pointer"
          aria-label={isOpen ? 'طي' : 'توسيع'}
        >
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="p-6 sm:p-8 space-y-6">
          {initialError === 'unauthorized_studio' && !errorMessage && !isSuccess && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs sm:text-sm flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">يلزم تسجيل الدخول</span>
                المسار المطلوب يتطلب صلاحيات مالك المنصة. أدخل مفتاح الاستوديو للمتابعة.
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">
                تم التحقق بنجاح! جاري تحويلك إلى لوحة التحكم التحريرية...
              </span>
            </div>
          )}

          <form
            action="/api/studio/auth/login"
            method="POST"
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <input type="hidden" name="redirect" value={redirectTarget} />

            <div>
              <label
                htmlFor="studio_secret_key"
                className="block text-xs sm:text-sm font-semibold text-ink-primary mb-2"
              >
                مفتاح الاستوديو السري (STUDIO_SECRET_KEY)
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-ink-secondary">
                  <KeyRound className="w-4 h-4" />
                </div>

                <input
                  id="studio_secret_key"
                  name="secretKey"
                  type={showPassword ? 'text' : 'password'}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  dir="ltr"
                  disabled={isLoading || isSuccess}
                  placeholder="openssl rand -hex 32..."
                  className="w-full ps-10 pe-11 py-3 bg-lavender-light/30 border border-lavender-border/70 rounded-xl text-sm font-mono text-ink-primary focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                  required
                  minLength={32}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  className="absolute inset-y-0 end-0 flex items-center pe-3 text-ink-secondary hover:text-ink-primary transition-colors cursor-pointer"
                  aria-label={showPassword ? 'إخفاء المفتاح' : 'إظهار المفتاح'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-xs text-ink-muted mt-1.5 block">
                يجب ألا يقل طول المفتاح عن 32 حرفاً لتلبية متطلبات الأمان التشفيري.
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="w-full sm:w-auto px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-soft-xs hover:shadow-soft-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <span>جاري التحقق...</span>
                ) : (
                  <>
                    <span>دخول استوديو النشر</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>مصادقة مشفرة في زمن ثابت (Constant-Time)</span>
              </div>
            </div>
          </form>

          {/* Quick guide box */}
          <div className="pt-4 border-t border-lavender-border/70 text-xs text-ink-secondary leading-relaxed bg-lavender-light/40 p-4 rounded-xl">
            <span className="font-bold text-ink-primary block mb-1">
              💡 أين تجد هذا المفتاح؟
            </span>
            مفتاح الاستوديو مُعرّف داخل ملف البيئة الخاص بك{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-lavender-border font-mono text-ink-primary">
              .env.local
            </code>{' '}
            تحت المتغير{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-lavender-border font-mono text-primary font-bold">
              STUDIO_SECRET_KEY
            </code>
            . يمكنك توليد قيمة جديدة في أي وقت بتنفيذ الأمر:{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-lavender-border font-mono text-ink-primary">
              openssl rand -hex 32
            </code>
            .
          </div>
        </div>
      )}
    </div>
  );
}
