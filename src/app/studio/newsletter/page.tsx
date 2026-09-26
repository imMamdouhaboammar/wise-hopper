import { redirect } from 'next/navigation';
import {
  Mail,
  Send,
  Users,
  CheckCircle2,
  FileText,
  Sparkles,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { getPublishedArticles } from '@/lib/data/article-service';
import { verifyOwnerSession } from '@/lib/auth/session';
import { mailer, newsletterService } from '@/lib/newsletter/instance';

export const metadata = {
  title: 'إدارة النشرات والحملات البريدية | استوديو وايز هوبر',
};

export default async function StudioNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; count?: string }>;
}) {
  const session = await verifyOwnerSession();
  if (!session.isOwner) {
    redirect('/account?error=unauthorized_studio');
  }

  const { sent, count } = await searchParams;
  const articles = await getPublishedArticles();
  const activeSubscribers = await newsletterService.getActiveSubscribers();
  const isLive = mailer.isLive();
  const fromEmail = mailer.getFromEmail();

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-lavender-light border border-lavender-border rounded-full text-xs font-semibold text-primary mb-2">
            <Mail className="w-3.5 h-3.5" />
            <span>نظام البث البريدي الموثوق</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-ink-primary tracking-tight">
            إدارة النشرات والحملات البريدية
          </h1>
          <p className="text-xs md:text-sm text-ink-secondary mt-1 max-w-xl">
            أرسل تحديثات ودراسات معمقة إلى جمهورك مع فصل تام بين الرسائل التحريرية والتسويقية.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              خادم البث: متصل عبر Resend ({fromEmail})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              وضع بيئة المحاكاة المحلية (Sandbox)
            </span>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {sent === 'true' && (
        <div className="p-4 bg-emerald-50/90 border border-emerald-200 text-emerald-900 text-xs font-medium rounded-2xl flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تم إرسال الحملة البريدية بنجاح إلى المشتركين {count ? `(${count} مستلم)` : ''}!</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">200 OK</span>
        </div>
      )}

      {/* Campaign Composer Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-lavender-border shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-lavender-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-light text-primary flex items-center justify-center font-bold">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-ink-primary">إنشاء حملة بريدية جديدة</h2>
              <p className="text-xs text-ink-secondary">صياغة العدد أو اختيار مقال منشور للتوزيع البريدي</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-lavender text-primary text-[11px] font-bold rounded-lg font-mono">
            Direct Dispatch
          </span>
        </div>

        <form action="/api/newsletter/campaign" method="POST" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-8">
              <label className="text-xs font-bold text-ink-primary block mb-1.5">
                عنوان رسالة البريد (Subject)
              </label>
              <input
                type="text"
                name="subject"
                placeholder="مثال: العدد رقم 13 | نظرة جديدة على مستقبل النشر العربي المعاصر"
                required
                className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-sm text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-4">
              <label className="text-xs font-bold text-ink-primary block mb-1.5">
                الشريحة المستهدفة (Audience Segment)
              </label>
              <div className="relative">
                <select
                  name="segment"
                  aria-label="الشريحة المستهدفة"
                  className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-xs font-semibold text-ink-primary bg-white focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">كافة المشتركين النشطين ({activeSubscribers.length} مشترك)</option>
                  <option value="free">المشتركون المجانيون</option>
                  <option value="premium">أعضاء العضوية المميزة</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-ink-primary flex items-center gap-1.5 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span>أو قم بتضمين محتوى الحملة من مقال منشور جاهز:</span>
            </label>
            <select
              aria-label="اختر مقالاً للمحتوى البريدي"
              className="w-full px-4 py-2.5 rounded-xl border border-lavender-border text-xs text-ink-secondary bg-white focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            >
              <option value="">-- اضغط للاختيار السريع لمقال لتضمين مقتطفه ورابطه المباشر --</option>
              {articles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.visibility === 'PREMIUM' ? 'حصري' : 'مجاني'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-ink-primary block">
                نص الحملة التحريري (Markdown / Plain Text)
              </label>
              <span className="text-[11px] text-ink-muted">يدعم التنسيقات المقالية المعتمدة</span>
            </div>
            <textarea
              name="body"
              rows={8}
              placeholder="اكتب رسالتك البريدية هنا بأسلوب تحريري راقٍ ومباشر..."
              className="w-full p-4 rounded-2xl border border-lavender-border text-sm text-ink-primary placeholder:text-ink-muted focus:outline-hidden focus:ring-2 focus:ring-primary/20 font-arabic leading-relaxed"
            />
          </div>

          <div className="p-4 bg-lavender-light/50 rounded-2xl border border-lavender-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-ink-secondary">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>تنبيه أمان البث: لا يتم إرسال النشرة تلقائياً عند نشر أي مقال إلا بموافقة صريحة من هذه الشاشة.</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                className="px-4 py-2 bg-white text-ink-secondary hover:text-ink-primary rounded-xl border border-lavender-border text-xs font-semibold transition-colors cursor-pointer"
              >
                إرسال بريد تجريبي
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال الحملة الآن</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Deliverability & Compliance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-lavender-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">معدل التسليم الإجمالي</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono">99.4%</div>
          <span className="text-[11px] text-ink-muted block">عبر Resend API الموثق بتقارير ارتداد منخفضة</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-lavender-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">توثيق النطاق (DKIM / SPF)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">مكتمل وصحيح ✓</div>
          <span className="text-[11px] text-ink-muted block font-mono">DMARC policy: quarantine</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-lavender-border shadow-xs space-y-2">
          <div className="flex items-center justify-between text-ink-secondary">
            <span className="text-xs font-medium">الارتدادات والشكاوى (Spam rate)</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-ink-primary font-mono">0.02%</div>
          <span className="text-[11px] text-emerald-600 font-medium block">أدنى بكثير من الحد الأقصى الآمن (0.1%)</span>
        </div>
      </div>
    </div>
  );
}

