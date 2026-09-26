'use client';

import { useState, useEffect } from 'react';
import {
  FileText,
  Target,
  CheckCircle,
  Compass,
  TrendingUp,
  DollarSign,
  Sparkles,
  Activity,
  HelpCircle,
  Copy,
  Check,
  Download,
  RotateCcw,
  BookOpen,
  Edit3,
} from 'lucide-react';

interface QuestionItem {
  id: string;
  title: string;
  question: string;
  icon: typeof Target;
  metadocExample: string;
  placeholder: string;
}

const WORKSHEET_QUESTIONS: QuestionItem[] = [
  {
    id: 'business_objective',
    title: 'Business Objective (الهدف التجاري)',
    question: 'إيه الهدف التجاري اللي صاحب المشروع عايز يحققه؟ وهل عندنا رقم مستهدف وفترة زمنية محددة؟',
    icon: Target,
    metadocExample: 'اكتساب 500 مستخدم جديد يجربون خدمة الاستشارة الطبية عن بُعد (Tele-Consultation) خلال الربع الحالي، مع إثبات الجدوى الاقتصادية.',
    placeholder: 'اكتب الهدف التجاري المحدد والرقم المستهدف والمدى الزمني هنا...',
  },
  {
    id: 'conversion_event',
    title: 'Conversion Event (حدث التحويل الأساسي)',
    question: 'إيه الفعل المحدد اللي هنعتبره نجاحًا؟ وإمتى بالضبط هنقول إن الحدث حصل؟',
    icon: CheckCircle,
    metadocExample: 'أول استشارة طبية مكتملة (First Completed Consultation) لمستخدم جديد أنشأ حسابه خلال الحملة وسجل التطبيق انتهاء المكالمة بنجاح.',
    placeholder: 'حدد الفعل الأكيد الذي يمثل القيمة الفعلية للبيزنس وليس مجرد التنزيل أو النقرة...',
  },
  {
    id: 'user_journey',
    title: 'User Journey (رحلة المستخدم وقمع التحويل)',
    question: 'إيه الخطوات اللي المستخدم هيعدي عليها قبل ما يوصل للحدث ده؟ وأنهي واحدة فيهم نقدر نقيسها؟',
    icon: Compass,
    metadocExample: 'إعلان الميديا → زيارة المتجر/Landing Page → تنزيل التطبيق (Install) → تسجيل الحساب (Sign-up) → تصفح واختيار الطبيب → حجز الموعد (Booking) → إتمام المكالمة (Completion).',
    placeholder: 'رتب المحطات الإلزامية التي يمر بها العميل من المشاهدة الأولى وحتى اكتمال القيمة...',
  },
  {
    id: 'baseline',
    title: 'Baseline (خط الأساس والأداء التاريخي)',
    question: 'الأداء الحالي عامل إيه؟ ولو الخدمة جديدة ومعندناش Historical Data، إيه أول تجربة صغيرة ممكن تساعدنا نحدد نقطة بداية؟',
    icon: TrendingUp,
    metadocExample: 'خدمة جديدة ليس لها بيانات تاريخية سابقة؛ سنطلق تجربة أولية بميزانية تجريبية صغيرة لتحديد تكلفة التحميل ونسبة الانتقال للحجز.',
    placeholder: 'ما هي الأرقام المعتادة للحملات السابقة أو فرضيات التجربة الأولى؟...',
  },
  {
    id: 'economics',
    title: 'Economics (اقتصاديات الحملة والـ CAC)',
    question: 'الميزانية المتاحة كام؟ وإيه تكلفة اكتساب المستخدم اللي البيزنس يقدر يتحملها؟ وهل عندنا معلومات كفاية عن قيمته المتوقعة؟',
    icon: DollarSign,
    metadocExample: 'الميزانية المبدئية 72,000 جنيه، والحد الأقصى المسموح به لاكتساب الاستشارة المكتملة هو 1,000 جنيه بناءً على هامش الربح وقيمة تكرار الزيارة (LTV).',
    placeholder: 'كم الميزانية؟ وما الحد الأقصى لتكلفة الاكتساب المقبولة للعميل؟...',
  },
  {
    id: 'product_offer',
    title: 'Product & Offer (المنتج والعرض الحقيقي)',
    question: 'إيه المميزات والشروط والأسعار والوعود اللي نقدر نستخدمها فعلًا في الكوبي، وإيه اللي محتاج يتأكد الأول؟',
    icon: Sparkles,
    metadocExample: 'استشارات فورية على مدار 24 ساعة، نخبة أطباء معتمدين، عرض خصم 50% على الاستشارة الأولى، والدفع بعد انتهاء المكالمة.',
    placeholder: 'ما الوعود والمزايا المؤكدة تقنياً وعملياً قبل أن نعد بها في الإعلان؟...',
  },
  {
    id: 'tracking',
    title: 'Tracking & Attribution (آليات التتبع والقياس)',
    question: 'هل الأحداث اللي اخترناها متسجلة صح؟ وهل نقدر نربط المستخدم الجديد بأول Conversion فعلية من غير ما نحسب نفس الشخص أكتر من مرة؟',
    icon: Activity,
    metadocExample: 'تم إعداد SDK التتبع لربط الـ Ad ID برقم المستخدم الداخلي وتسجيل حدث Completed_Consultation_FirstTime مرة واحدة لكل حساب.',
    placeholder: 'كيف ستتأكد أن فريق الـ Analytics يقيس نفس الحدث بنفس التعريف؟...',
  },
  {
    id: 'missing_info',
    title: 'Missing Information (الأسئلة العالقة)',
    question: 'إيه الأسئلة اللي لسه محتاجة إجابة من صاحب المشروع أو فريق الـ Product أو الـ Analytics قبل ما نبدأ التنفيذ؟',
    icon: HelpCircle,
    metadocExample: 'هل يستطيع المستخدم رؤية أسماء وتخصصات الأطباء قبل التسجيل؟ ما هو متوسط وقت الانتظار للدخول في المكالمة؟',
    placeholder: 'ما هي الأسئلة التي يجب أن توجهها فوراً للـ Account Manager أو صاحب المشروع؟...',
  },
];

export function BriefWorksheetInteractive() {
  const [activeTab, setActiveTab] = useState<'metadoc' | 'custom'>('metadoc');
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  // Load saved answers from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('wise_brief_worksheet');
      if (saved) {
        setCustomAnswers(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleAnswerChange = (id: string, value: string) => {
    const updated = { ...customAnswers, [id]: value };
    setCustomAnswers(updated);
    try {
      localStorage.setItem('wise_brief_worksheet', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleReset = () => {
    if (confirm('هل أنت متأكد من تفريغ كافة الإجابات المخصصة؟')) {
      setCustomAnswers({});
      try {
        localStorage.removeItem('wise_brief_worksheet');
      } catch {
        // Ignore
      }
    }
  };

  // Completed count in custom mode
  const completedCount = WORKSHEET_QUESTIONS.filter(
    (q) => (customAnswers[q.id] || '').trim().length > 0
  ).length;

  const buildMarkdownReport = () => {
    const isMetadoc = activeTab === 'metadoc';
    const lines = [
      `# ورقة عمل فحص وتجهيز الـ Brief (${isMetadoc ? 'نموذج تطبيق Metadoc' : 'مسودة حملتي الخاصة'})`,
      `تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-EG')}`,
      '',
      '---',
      '',
    ];

    for (const q of WORKSHEET_QUESTIONS) {
      const answer = isMetadoc ? q.metadocExample : customAnswers[q.id] || '[لم تتم الإجابة بعد]';
      lines.push(`## ${q.title}`);
      lines.push(`*السؤال الاستراتيجي:* ${q.question}`);
      lines.push('');
      lines.push(`**الإجابة:**\n${answer}`);
      lines.push('');
    }

    return lines.join('\n');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildMarkdownReport());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleDownload = () => {
    const md = buildMarkdownReport();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `brief-worksheet-${activeTab}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="my-10 rounded-3xl border border-lavender-border bg-white shadow-sm overflow-hidden" dir="rtl">
      {/* Top Header & Mode Toggle */}
      <div className="p-6 sm:p-8 bg-linear-to-b from-lavender-light/60 to-white border-b border-lavender-border">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-lavender text-primary flex items-center justify-center shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xs font-bold text-primary uppercase tracking-wider block">
                أداة تفاعلية حية
              </span>
              <h3 className="text-xl font-bold text-ink-primary">
                ورقة عمل فحص وتجهيز الـ Brief (Brief Worksheet)
              </h3>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-lavender-border shadow-2xs text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('metadoc')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'metadoc'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>مثال Metadoc المحلول</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'custom'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>اكتب Brief حملتك الخاصة</span>
            </button>
          </div>
        </div>

        {/* Progress & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {activeTab === 'custom' ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-secondary">
                نسبة اكتمال الـ Brief: <strong>{completedCount} من 8 أسئلة</strong>
              </span>
              <div className="w-28 bg-lavender-light h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300"
                  style={{ width: `${(completedCount / 8) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-secondary">
              تصفح الإجابات النموذجية الواقعية المطبقة على تطبيق الرعاية الصحية Metadoc كما وردت بالدرس.
            </p>
          )}

          <div className="flex items-center gap-2 mr-auto">
            {activeTab === 'custom' && (
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1.5 text-xs text-ink-muted hover:text-rose-600 transition-colors flex items-center gap-1"
                title="تفريغ الحقول"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة ضبط</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-white hover:bg-lavender text-ink-primary hover:text-primary rounded-xl text-xs font-semibold border border-lavender-border shadow-2xs transition-all flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-primary" />
                  <span>نسخ الـ Brief كماركداون</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تنزيل الملف (.md)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Questions Cards Grid */}
      <div className="p-6 sm:p-8 space-y-5">
        {WORKSHEET_QUESTIONS.map((item, idx) => {
          const IconComp = item.icon;
          const isFilled = (customAnswers[item.id] || '').trim().length > 0;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                activeTab === 'custom' && isFilled
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-lavender-border bg-white hover:border-primary/30'
              }`}
            >
              <div className="flex items-start gap-3.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-lavender-light text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-bold px-2 py-0.5 rounded-md bg-lavender-light text-primary">
                      السؤال {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-ink-primary">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                    {item.question}
                  </p>
                </div>
              </div>

              {/* Answer Content */}
              <div className="mr-11.5">
                {activeTab === 'metadoc' ? (
                  <div className="p-3.5 rounded-xl bg-lavender-light/40 border border-lavender-border/80 text-xs text-ink-primary leading-relaxed font-sans">
                    <strong className="text-primary block mb-1 text-2xs uppercase">إجابة Metadoc المعتمدة:</strong>
                    {item.metadocExample}
                  </div>
                ) : (
                  <textarea
                    rows={2}
                    value={customAnswers[item.id] || ''}
                    onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                    placeholder={item.placeholder}
                    className="w-full text-xs p-3 rounded-xl border border-lavender-border focus:border-primary focus:ring-2 focus:ring-primary/10 outline-hidden bg-white text-ink-primary leading-relaxed resize-y placeholder:text-ink-muted"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
