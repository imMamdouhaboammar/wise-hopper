'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowDown,
  Info,
} from 'lucide-react';

export function FunnelSimulator() {
  // Input parameters
  const [visitors, setVisitors] = useState<number>(2000);
  const [mediaSpend, setMediaSpend] = useState<number>(72000);
  const [installRate, setInstallRate] = useState<number>(30); // 30%
  const [signupRate, setSignupRate] = useState<number>(60); // 60%
  const [bookingRate, setBookingRate] = useState<number>(30); // 30%
  const [completionRate, setCompletionRate] = useState<number>(66.7); // 66.7%

  // Calculations
  const stats = useMemo(() => {
    const installs = Math.round(visitors * (installRate / 100));
    const signups = Math.round(installs * (signupRate / 100));
    const bookings = Math.round(signups * (bookingRate / 100));
    const completed = Math.max(1, Math.round(bookings * (completionRate / 100)));

    const cpi = installs > 0 ? Math.round(mediaSpend / installs) : 0;
    const cac = completed > 0 ? Math.round(mediaSpend / completed) : 0;
    const overallConversion = visitors > 0 ? ((completed / visitors) * 100).toFixed(2) : '0';

    return {
      installs,
      signups,
      bookings,
      completed,
      cpi,
      cac,
      overallConversion,
    };
  }, [visitors, mediaSpend, installRate, signupRate, bookingRate, completionRate]);

  // Scenario presets
  const applyPreset = (preset: 'baseline' | 'ux-boost' | 'vanity-trap') => {
    if (preset === 'baseline') {
      setVisitors(2000);
      setMediaSpend(72000);
      setInstallRate(30);
      setSignupRate(60);
      setBookingRate(30);
      setCompletionRate(66.7);
    } else if (preset === 'ux-boost') {
      setVisitors(2000);
      setMediaSpend(72000);
      setInstallRate(30);
      setSignupRate(65);
      setBookingRate(50); // Improved UX/Messaging
      setCompletionRate(75);
    } else if (preset === 'vanity-trap') {
      setVisitors(3500);
      setMediaSpend(72000);
      setInstallRate(55); // Lots of cheap clicks/installs
      setSignupRate(35);
      setBookingRate(12); // Low quality intent
      setCompletionRate(50);
    }
  };

  return (
    <div className="my-10 rounded-3xl border border-lavender-border bg-linear-to-b from-white via-lavender-light/40 to-white p-6 sm:p-8 shadow-sm" dir="rtl">
      {/* Title & Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-lavender-border">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-lavender text-primary text-xs font-bold rounded-full mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>محاكي قمع التحويل والاقتصاديات التفاعلي</span>
          </div>
          <h3 className="text-xl font-bold text-ink-primary">
            جرّب تغيير أرقام الحملة: كيف تؤثر كل خطوة على الـ CAC النهائي؟
          </h3>
          <p className="text-xs text-ink-secondary mt-1">
            حرّك المؤشرات أدناه وشاهد كيف تتحول التنزيلات إلى استشارات مكتملة وتكلفة فعلية.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => applyPreset('baseline')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-lavender text-ink-primary border border-lavender-border shadow-2xs transition-all"
          >
            حملة Metadoc الأصلية
          </button>
          <button
            type="button"
            onClick={() => applyPreset('ux-boost')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-2xs transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>تحسين الحجز (UX Boost)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('vanity-trap')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 shadow-2xs transition-all flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>فخ التنزيلات الوهمية</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white rounded-2xl border border-lavender-border shadow-2xs">
          <div className="flex items-center justify-between text-xs text-ink-secondary mb-1">
            <span>تكلفة التنزيل (CPI)</span>
            <Smartphone className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-ink-primary">
            {stats.cpi.toLocaleString('ar-EG')} <span className="text-xs font-normal">جنيه</span>
          </div>
          <p className="text-2xs text-ink-muted mt-1">
            من إجمالي {stats.installs.toLocaleString('ar-EG')} تحميل
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border-2 border-primary/40 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-primary" />
          <div className="flex items-center justify-between text-xs text-ink-secondary mb-1">
            <span className="font-bold text-primary">تكلفة الاستشارة (CAC الحقيقي)</span>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary">
            {stats.cac.toLocaleString('ar-EG')} <span className="text-xs font-normal">جنيه</span>
          </div>
          <p className="text-2xs text-ink-muted mt-1">
            مقابل {stats.completed.toLocaleString('ar-EG')} استشارة فعلية
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-lavender-border shadow-2xs">
          <div className="flex items-center justify-between text-xs text-ink-secondary mb-1">
            <span>معدل التحويل الكلي (E2E)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            %{stats.overallConversion}
          </div>
          <p className="text-2xs text-ink-muted mt-1">
            من الزيارة الأولى حتى إتمام الاستشارة
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-lavender-border shadow-2xs">
          <div className="flex items-center justify-between text-xs text-ink-secondary mb-1">
            <span>الميزانية الإعلانية</span>
            <Users className="w-4 h-4 text-ink-muted" />
          </div>
          <div className="text-2xl font-bold text-ink-primary">
            {mediaSpend.toLocaleString('ar-EG')} <span className="text-xs font-normal">جنيه</span>
          </div>
          <p className="text-2xs text-ink-muted mt-1">
            لجلب {visitors.toLocaleString('ar-EG')} زائر
          </p>
        </div>
      </div>

      {/* Visual Funnel Waterfall Bars */}
      <div className="mb-8 p-5 bg-white rounded-2xl border border-lavender-border">
        <h4 className="text-xs font-bold text-ink-secondary uppercase tracking-wider mb-4">
          تسلسل قمع التحويل والنسب المتبقية (Funnel Drop-off)
        </h4>

        <div className="space-y-3">
          {/* Step 1: Visitors */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-ink-primary mb-1">
              <span>1. زوار صفحة الهبوط (Landing Page)</span>
              <span>{visitors.toLocaleString('ar-EG')} (100%)</span>
            </div>
            <div className="w-full bg-lavender-light h-3.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="flex justify-center text-xs text-ink-muted -my-1">
            <ArrowDown className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-2xs mr-1">معدل التحميل: {installRate}%</span>
          </div>

          {/* Step 2: Installs */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-ink-primary mb-1">
              <span>2. تحميلات التطبيق (App Installs)</span>
              <span>{stats.installs.toLocaleString('ar-EG')} ({((stats.installs / visitors) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-lavender-light h-3.5 rounded-full overflow-hidden">
              <div
                className="bg-primary/80 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (stats.installs / visitors) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-center text-xs text-ink-muted -my-1">
            <ArrowDown className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-2xs mr-1">معدل التسجيل: {signupRate}%</span>
          </div>

          {/* Step 3: Signups */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-ink-primary mb-1">
              <span>3. الحسابات المسجلة (Sign-ups)</span>
              <span>{stats.signups.toLocaleString('ar-EG')} ({((stats.signups / visitors) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-lavender-light h-3.5 rounded-full overflow-hidden">
              <div
                className="bg-primary/70 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (stats.signups / visitors) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-center text-xs text-ink-muted -my-1">
            <ArrowDown className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-2xs mr-1">معدل الحجز: {bookingRate}% (نقطة الاختناق الشائعة)</span>
          </div>

          {/* Step 4: Bookings */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-ink-primary mb-1">
              <span>4. حجز الاستشارات (Consultations Booked)</span>
              <span>{stats.bookings.toLocaleString('ar-EG')} ({((stats.bookings / visitors) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-lavender-light h-3.5 rounded-full overflow-hidden">
              <div
                className="bg-primary/60 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (stats.bookings / visitors) * 100)}%` }}
              />
            </div>
          </div>

          <div className="flex justify-center text-xs text-ink-muted -my-1">
            <ArrowDown className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-2xs mr-1">معدل الإتمام: {completionRate}%</span>
          </div>

          {/* Step 5: Completed */}
          <div>
            <div className="flex justify-between text-xs font-bold text-emerald-800 mb-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>5. أول استشارة مكتملة (Primary Business Goal)</span>
              </span>
              <span>{stats.completed.toLocaleString('ar-EG')} ({((stats.completed / visitors) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-emerald-100 h-4 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(2, Math.min(100, (stats.completed / visitors) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sliders Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-lavender-light/30 p-5 rounded-2xl border border-lavender-border">
        {/* Visitors Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <label htmlFor="sim-visitors" className="text-ink-primary">زوار صفحة الهبوط:</label>
            <span className="text-primary font-bold">{visitors.toLocaleString('ar-EG')}</span>
          </div>
          <input
            id="sim-visitors"
            type="range"
            min={500}
            max={10000}
            step={250}
            value={visitors}
            onChange={(e) => setVisitors(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Media Spend Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <label htmlFor="sim-spend" className="text-ink-primary">الميزانية الإعلانية (جنيه):</label>
            <span className="text-primary font-bold">{mediaSpend.toLocaleString('ar-EG')}</span>
          </div>
          <input
            id="sim-spend"
            type="range"
            min={10000}
            max={200000}
            step={5000}
            value={mediaSpend}
            onChange={(e) => setMediaSpend(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Install Rate Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <label htmlFor="sim-install-rate" className="text-ink-primary">نسبة التحميل (Visitors → Installs):</label>
            <span className="text-primary font-bold">%{installRate}</span>
          </div>
          <input
            id="sim-install-rate"
            type="range"
            min={5}
            max={60}
            step={1}
            value={installRate}
            onChange={(e) => setInstallRate(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Sign-up Rate Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <label htmlFor="sim-signup-rate" className="text-ink-primary">نسبة التسجيل (Installs → Sign-ups):</label>
            <span className="text-primary font-bold">%{signupRate}</span>
          </div>
          <input
            id="sim-signup-rate"
            type="range"
            min={10}
            max={90}
            step={1}
            value={signupRate}
            onChange={(e) => setSignupRate(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Booking Rate Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <label htmlFor="sim-booking-rate" className="text-ink-primary font-bold text-primary">نسبة الحجز (Sign-ups → Booking):</label>
            <span className="text-primary font-bold">%{bookingRate}</span>
          </div>
          <input
            id="sim-booking-rate"
            type="range"
            min={5}
            max={60}
            step={1}
            value={bookingRate}
            onChange={(e) => setBookingRate(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Completion Rate Slider */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <label htmlFor="sim-comp-rate" className="text-ink-primary">نسبة الإتمام (Booking → Completed):</label>
            <span className="text-primary font-bold">%{Math.round(completionRate)}</span>
          </div>
          <input
            id="sim-comp-rate"
            type="range"
            min={30}
            max={95}
            step={1}
            value={completionRate}
            onChange={(e) => setCompletionRate(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>
      </div>

      {/* Strategic Insight Callout */}
      <div className="mt-6 flex items-start gap-3 p-4 bg-white rounded-2xl border border-lavender-border text-xs text-ink-secondary">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-ink-primary block mb-0.5">الاستنتاج الاستراتيجي للـ Copywriter:</strong>
          لاحظ أن مضاعفة نسبة الحجز (Booking Rate) من 30% إلى 50% عبر تحسين رسالة الإعلان وتوضيح أسعار الاستشارات يُخفض تكلفة اكتساب العميل (CAC) فوراً من <strong>1000 جنيه إلى 600 جنيه</strong> دون دفع مليم إضافي في الميديا!
        </div>
      </div>
    </div>
  );
}
