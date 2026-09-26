import Link from 'next/link';
import {
  CreditCard,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft,
  LogOut,
  User,
  SlidersHorizontal,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { getAllTopics } from '@/lib/data/article-service';
import { verifyOwnerSession } from '@/lib/auth/session';
import { AdminLoginCard } from '@/components/studio/admin-login-card';

export const metadata = {
  title: 'حساب القارئ وإدارة الاشتراك | وايز هوبر',
  description: 'إدارة العضوية المدفوعة وتفضيلات النشرة البريدية وبوابة إدارة الاستوديو.',
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{
    updated?: string;
    canceled?: string;
    error?: string;
    redirect?: string;
    logged_out?: string;
  }>;
}) {
  const { updated, canceled, error, redirect, logged_out } = await searchParams;
  const topics = await getAllTopics();
  const session = await verifyOwnerSession();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-10" dir="rtl">
      {/* Page Title & Breadcrumb */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-lavender-light border border-lavender-border rounded-full text-xs font-semibold text-primary">
          <User className="w-3.5 h-3.5" />
          <span>مركز تحكم القارئ</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-ink-primary tracking-tight">
          إدارة الحساب والوصول
        </h1>
        <p className="text-sm md:text-base text-ink-secondary leading-relaxed max-w-2xl">
          تحكم في بيانات وصولك للعضوية المميزة، واضبط تفضيلات النشرة الدورية، أو سجل دخولك كمالك للمنصة لإدارة المحتوى.
        </p>
      </div>

      {/* Notification Banners */}
      {logged_out && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>تم تسجيل الخروج من جلسة استوديو النشر بنجاح.</span>
        </div>
      )}

      {updated && (
        <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 text-emerald-800 rounded-2xl text-xs font-medium flex items-center gap-3 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>تم تحديث تفضيلات النشرة البريدية بنجاح.</span>
        </div>
      )}

      {canceled && (
        <div className="p-4 bg-amber-50/80 border border-amber-200/80 text-amber-800 rounded-2xl text-xs font-medium flex items-center gap-3 animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>تم إلغاء التجديد التلقائي. سيبقى اشتراكك سارياً حتى نهاية الدورة الحالية.</span>
        </div>
      )}

      {/* Studio Owner Gate / Active Banner */}
      {session.isOwner ? (
        <div className="p-6 md:p-7 bg-white rounded-3xl border-2 border-primary/20 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 end-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-primary text-white text-[11px] font-bold rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  جلسة المالك نشطة
                </span>
                <span className="text-xs font-mono text-ink-muted">
                  {session.email || 'owner@wise-hopper.io'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-ink-primary">
                استوديو النشر والتحرير الذري
              </h2>
              <p className="text-xs text-ink-secondary leading-relaxed max-w-lg">
                أنت مسجل الدخول حالياً بصلاحية المالك. يمكنك كتابة المقالات، وتدقيق المشتقات، وإدارة المشتركين وبوابات الدفع.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/studio"
                className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <span>دخول الاستوديو</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <form action="/api/studio/auth/logout" method="POST">
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <AdminLoginCard
          initialError={error}
          redirectTarget={redirect || '/studio'}
          isCollapsedDefault={!error}
        />
      )}

      {/* Main Grid: Subscription & Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Subscription Status Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-lavender-border shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-lavender-light text-primary flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-ink-primary">حالة العضوية والاشتراك</h2>
                  <p className="text-xs text-ink-secondary">تفاصيل خطة الدفع الحالية وصلاحية الوصول</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                نشط
              </span>
            </div>

            {/* Plan Info Pill */}
            <div className="p-5 bg-lavender-light/40 border border-lavender-border/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs text-ink-secondary font-medium block">الخطة الحالية</span>
                <span className="font-bold text-base text-ink-primary flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>عضوية سنوية مدفوعة (وصول كامل للمشتقات)</span>
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-xs text-ink-secondary font-medium block">المبلغ الدوري</span>
                <span className="font-mono text-sm font-bold text-primary">$100.00 / سنوياً</span>
              </div>
            </div>

            {/* Meta Table */}
            <div className="space-y-3 text-xs text-ink-secondary border-b border-lavender-border pb-6">
              <div className="flex justify-between items-center py-1">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-ink-muted" />
                  <span>تاريخ التجديد القادم:</span>
                </span>
                <span className="font-mono text-ink-primary font-medium">2027-09-25</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-ink-muted" />
                  <span>بوابة الدفع المعتمدة:</span>
                </span>
                <span className="font-mono text-ink-primary font-medium">Lemon Squeezy (MoR) / Simulated</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-ink-muted" />
                  <span>نوع النفاذ:</span>
                </span>
                <span className="text-emerald-700 font-bold">وصول غير محدود لكافة المقالات وملفات AST</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/membership"
                className="px-5 py-2.5 bg-lavender text-primary hover:bg-lavender-dark text-xs font-bold rounded-xl transition-colors"
              >
                ترقية أو تغيير الخطة
              </Link>
              <form action="/api/billing/cancel" method="POST">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  إلغاء التجديد التلقائي
                </button>
              </form>
            </div>
          </div>

          {/* Newsletter Preferences Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-lavender-border shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lavender-light text-primary flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-ink-primary">تفضيلات النشرة البريدية</h2>
                <p className="text-xs text-ink-secondary">
                  حدد الموضوعات التي تهمك ليصلك عدد النشرة فور صدوره
                </p>
              </div>
            </div>

            <form action="/api/newsletter/update-topics" method="POST" className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {topics.map((t) => (
                  <label
                    key={t.id}
                    className="flex items-start gap-3 p-3.5 rounded-2xl border border-lavender-border hover:bg-lavender-light/30 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="topics"
                      value={t.slug}
                      defaultChecked
                      className="accent-primary w-4 h-4 rounded-sm mt-0.5 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-ink-primary block">{t.name}</span>
                      <span className="text-[11px] text-ink-secondary block line-clamp-1">
                        {t.description || 'تغطية تحليلية معمقة'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="pt-4 border-t border-lavender-border flex items-center justify-between">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  حفظ التفضيلات
                </button>

                <Link
                  href="/api/newsletter/unsubscribe?email=reader@example.com"
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
                >
                  إلغاء الاشتراك من النشرة
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Identity & Session info */}
          <div className="bg-white rounded-3xl p-6 border border-lavender-border shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-lavender-border">
              <User className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-xs text-ink-primary">هوية القارئ</h3>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[11px] text-ink-secondary block mb-1">البريد الإلكتروني المعتمد:</span>
                <span className="font-mono text-xs text-ink-primary font-semibold block truncate">
                  reader@wise-hopper.io
                </span>
              </div>
              <div>
                <span className="text-[11px] text-ink-secondary block mb-1">نوع المصادقة:</span>
                <span className="text-xs font-semibold text-ink-primary flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>رابط سحري آمن (Passwordless)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Reader Support Card */}
          <div className="bg-lavender-light/40 rounded-3xl p-6 border border-lavender-border shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <HelpCircle className="w-4 h-4" />
              <span>مساعدة ودعم القراء</span>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed">
              هل تواجه أي صعوبة في تنزيل مشتقات Markdown أو استعراض المقالات الحصرية؟ فريق التحرير حاضر للمساعدة.
            </p>
            <a
              href="mailto:support@wisehopper.dev"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
            >
              <span>مراسلة الدعم التحريري</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

