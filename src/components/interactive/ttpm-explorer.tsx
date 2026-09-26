'use client';

import { useState } from 'react';
import {
  Clock,
  Users,
  Compass,
  FileText,
  UserPlus,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

interface PillarStrategy {
  title: string;
  timing: {
    description: string;
    keyQuestions: string[];
    metadocTip: string;
  };
  targeting: {
    description: string;
    keyQuestions: string[];
    metadocTip: string;
  };
  placement: {
    description: string;
    keyQuestions: string[];
    metadocTip: string;
  };
  messaging: {
    description: string;
    keyQuestions: string[];
    metadocTip: string;
  };
}

const STRATEGIES: Record<'acquisition' | 'activation', PillarStrategy> = {
  acquisition: {
    title: 'اكتساب مستخدمين جدد (New User Acquisition)',
    timing: {
      description: 'اللحظة التي يشعر فيها الشخص باحتياج طبي عاجل، أو في المساء وعطلات نهاية الأسبوع عند إغلاق العيادات التقليدية.',
      keyQuestions: [
        'هل الأطباء متاحون فعلياً في لحظة ظهور الإعلان؟',
        'ما هو متوسط زمن انتظار المكالمة في ساعات الذروة؟',
      ],
      metadocTip: 'الإعلان في أوقات متأخرة يركز على: «طبيبك معاك حتى في نص الليل»، مستغلاً عائق إغلاق العيادات.',
    },
    targeting: {
      description: 'أشخاص لم يسمعوا بالتطبيق أو لم ينشئوا حساباً بعد؛ يحتاجون إلى بناء ثقة سريعة وإثبات كفاءة الأطباء.',
      keyQuestions: [
        'هل الجمهور المستهدف اعتاد التعامل مع تطبيقات طبية؟',
        'ما هي المخاوف الرئيسية لديهم من الاستشارة عن بُعد؟',
      ],
      metadocTip: 'استهداف الأمهات وأصحاب الدوام الطويل بمحتوى يعالج عناء الانتظار في العيادات.',
    },
    placement: {
      description: 'قنوات الاكتشاف السريع ومحركات البحث (Google Search لحالات الأعراض العاجلة، وMeta / TikTok للتوعية بالقيمة).',
      keyQuestions: [
        'هل الإعلان يظهر على الموبايل حصراً لضمان سهولة التنزيل الفوري؟',
        'هل تقيس المنصة الإعلانية الاستشارة المكتملة أم تكتفي بالتنزيل؟',
      ],
      metadocTip: 'توجيه نقرات Google Search مباشرة لصفحة متجر التطبيقات مع تتبع دقيق لمعرف الإعلان.',
    },
    messaging: {
      description: 'التركيز على إزالة الخوف وتوضيح الخطوة التالية: «حمّل التطبيق، اختر طبيبك، وابدأ استشارتك الآن في 5 دقائق».',
      keyQuestions: [
        'هل الرسالة تجيب عن: «إيه اللي هيحصل بعد ما أحمّل التطبيق؟»',
        'هل السعر والعرض الترويجي لأول استشارة واضح وشفاف؟',
      ],
      metadocTip: 'تجنب الوعود العامة مثل «صحتك أولاً» واستبدالها بوعود ملموسة: «استشارة مع استشاري معتمد خلال دقائق بـ 150 جنيه فقط».',
    },
  },
  activation: {
    title: 'تنشيط المستخدمين الحاليين (Existing User Activation)',
    timing: {
      description: 'بعد أسبوع من تنزيل التطبيق دون حجز، أو في مواسم الفحوصات الدورية وموجات تقلبات الطقس والإنفلونزا.',
      keyQuestions: [
        'لماذا توقف المستخدم بعد التسجيل؟ هل واجه مشكلة في الدفع؟',
        'ما هو التوقيت الأنسب لإرسال إشعار تذكيري (Push Notification)؟',
      ],
      metadocTip: 'إرسال إشعار عند توفر مواعيد جديدة لطبيب كان المستخدم قد تصفح ملفه الشخصي ولم يحجز.',
    },
    targeting: {
      description: 'مستخدمون قاموا بتنزيل التطبيق أو إنشاء الحساب بالفعل، لكنهم لم يكملوا استشارتهم الأولى بعد.',
      keyQuestions: [
        'هل نعرف التخصص الذي بحث عنه المستخدم داخل التطبيق؟',
        'ما العائق الذي منعه من استكمال الخطوة الأخيرة؟',
      ],
      metadocTip: 'استهداف مخصص عبر قوائم Custom Audiences ورسائل داخل التطبيق موجهة حسب التخصص المتصفح.',
    },
    placement: {
      description: 'قنوات التواصل المباشرة منخفضة التكلفة: إشعارات التطبيق (Push)، البريد الإلكتروني، وإعادة الاستهداف المباشر (Retargeting).',
      keyQuestions: [
        'هل رسائل البريد تصل إلى صندوق الوارد الرئيسي؟',
        'هل الإشعار ينقل المستخدم بنقرة واحدة لشاشة الحجز (Deep Link)؟',
      ],
      metadocTip: 'استخدام رابط مباشر (Deep Link) يفتح شاشة اختيار الطبيب فوراً دون المرور بصفحة البداية.',
    },
    messaging: {
      description: 'إزالة العائق الأخير وتقديم حافز إتمام: «خطوة واحدة تفصلك عن أول استشارة.. استخدم كود خصم 30% واحجز الآن».',
      keyQuestions: [
        'هل الرسالة تذكر المستخدم بالسبب الذي جعله يحمل التطبيق أول مرة؟',
        'هل العرض مخصص ومحدد المدة لخلق إحساس بالإلحاح (Urgency)؟',
      ],
      metadocTip: 'الرسالة هنا لا تشرح من هو التطبيق، بل تركز على تسهيل إجراء الخطوة المعلقة فقط.',
    },
  },
};

export function TTPMExplorer() {
  const [activeStrategy, setActiveStrategy] = useState<'acquisition' | 'activation'>('acquisition');
  const [activePillar, setActivePillar] = useState<'timing' | 'targeting' | 'placement' | 'messaging'>('timing');

  const strategy = STRATEGIES[activeStrategy];
  const currentContent = strategy[activePillar];

  const pillars = [
    { id: 'timing' as const, name: 'التوقيت', en: 'Timing', icon: Clock },
    { id: 'targeting' as const, name: 'الاستهداف', en: 'Targeting', icon: Users },
    { id: 'placement' as const, name: 'الموضع والمنصة', en: 'Placement', icon: Compass },
    { id: 'messaging' as const, name: 'الرسالة الإعلانية', en: 'Messaging', icon: FileText },
  ];

  return (
    <div className="my-10 rounded-3xl border border-lavender-border bg-white shadow-sm overflow-hidden" dir="rtl">
      {/* Header with Strategy Selector */}
      <div className="p-6 sm:p-8 bg-linear-to-b from-lavender-light/50 via-white to-white border-b border-lavender-border">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-lavender text-primary flex items-center justify-center font-bold text-xs">
              TTPM
            </span>
            <div>
              <h3 className="text-xl font-bold text-ink-primary">
                مستكشف مصفوفة TTPM التفاعلي
              </h3>
              <p className="text-xs text-ink-secondary mt-0.5">
                شاهد كيف تختلف صياغة الرسالة والموضع باختلاف هدف الحملة ومرحلة العميل
              </p>
            </div>
          </div>

          {/* Strategy Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-lavender-light/60 rounded-2xl border border-lavender-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveStrategy('acquisition')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeStrategy === 'acquisition'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>اكتساب مستخدمين جدد</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveStrategy('activation')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeStrategy === 'activation'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تنشيط المستخدمين المسجلين</span>
            </button>
          </div>
        </div>

        {/* 4 Pillars Navigation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {pillars.map((p) => {
            const Icon = p.icon;
            const isSelected = activePillar === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePillar(p.id)}
                className={`p-3 rounded-2xl border text-right transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary shadow-2xs font-bold'
                    : 'border-lavender-border bg-white text-ink-secondary hover:border-primary/30'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary text-white' : 'bg-lavender-light text-primary'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs block">{p.name}</span>
                  <span className="text-2xs font-normal opacity-70 block">{p.en}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pillar Details Container */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Core Strategy Explanation */}
        <div className="p-5 rounded-2xl bg-lavender-light/30 border border-lavender-border">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>التطبيق العملي لركن {pillars.find((p) => p.id === activePillar)?.name} في {strategy.title}</span>
          </h4>
          <p className="text-sm text-ink-primary leading-relaxed">
            {currentContent.description}
          </p>
        </div>

        {/* Key Questions Checklist */}
        <div className="p-5 rounded-2xl bg-white border border-lavender-border shadow-2xs">
          <h4 className="text-xs font-bold text-ink-secondary mb-3 flex items-center gap-1.5">
            <span>الأسئلة التي يجب حسمها مع التيم قبل اعتماد هذه الزاوية:</span>
          </h4>
          <ul className="space-y-2.5">
            {currentContent.keyQuestions.map((q, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-ink-primary leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Copywriting Tip for Metadoc */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 font-bold text-2xs shrink-0">
            تكتيك الكوبي
          </span>
          <div>
            <strong>تطبيق الكاتب على Metadoc: </strong>
            {currentContent.metadocTip}
          </div>
        </div>
      </div>
    </div>
  );
}
