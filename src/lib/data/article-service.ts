import type { Article, ArticleRevision, Topic, Author } from '../supabase/types';
import { matchArabicQuery } from '../content/arabic-normalizer';

// Canonical in-memory seed records representing database content (matches supabase/seed.sql)
export const SEED_AUTHOR: Author = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'ممدوح أبو عمار',
  bio: 'مهندس برمجيات وكاتب تقني، أهتم بهندسة النظم الموزعة، التصميم المرتكز على المحتوى العربي، ومستقبل النشر الرقمي المستقل.',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  social_links: {
    x: 'https://x.com/mamdouh',
    github: 'https://github.com/imMamdouhaboammar',
    linkedin: 'https://linkedin.com',
  },
  created_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-25T00:00:00Z',
};

export const SEED_TOPICS: Topic[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    slug: 'system-architecture',
    name: 'هندسة النظم',
    description: 'مقالات متعمقة في تصميم المعماريات الموزعة، قواعد البيانات، وقابلية التوسع.',
    created_at: '2026-09-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    slug: 'editorial-design',
    name: 'التصميم التحريري',
    description: 'فلسفة التصميم الرقمي العربي، الخطوط، وتجربة القراءة الطويلة.',
    created_at: '2026-09-01T00:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    slug: 'independent-publishing',
    name: 'النشر المستقل',
    description: 'استراتيجيات بناء النشرات البريدية ونماذج الاشتراكات المدفوعة لصناع المحتوى.',
    created_at: '2026-09-01T00:00:00Z',
  },
];

export const SEED_ARTICLES: (Article & { revision: ArticleRevision })[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    slug: 'arabic-web-typography-manifesto',
    title: 'بيان في هندسة الخط والطباعة العربية على الويب الحديث',
    excerpt: 'لماذا تفشل معظم المواقع العربية في تقديم تجربة قراءة مريحة؟ وكيف نبني مقروئية متزنة تجمع بين أصالة الخط العربي وصرامة الأداء الهندسي.',
    cover_image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
    cover_image_alt: 'مخطوطة عربية تقليدية بجانب شاشة كود برمجي حديث',
    visibility: 'FREE',
    status: 'PUBLISHED',
    topic_id: '10000000-0000-0000-0000-000000000002',
    author_id: '00000000-0000-0000-0000-000000000001',
    reading_time_minutes: 7,
    seo_title: 'بيان في هندسة الخط والطباعة العربية على الويب الحديث | ممدوح أبو عمار',
    seo_description: 'تحليل معمق لهندسة المقروئية العربية، الخطوط التحريرية، والخصائص المنطقية في لغة التنسيق الانسيابية على الويب المعاصر.',
    published_at: '2026-09-23T10:00:00Z',
    scheduled_at: null,
    created_at: '2026-09-23T08:00:00Z',
    updated_at: '2026-09-23T10:00:00Z',
    revision: {
      id: 'rev-01',
      article_id: '20000000-0000-0000-0000-000000000001',
      revision_number: 1,
      mdx_source: `# بيان في هندسة الخط والطباعة العربية على الويب الحديث

القراءة ليست مجرد إدراك بصري للرموز؛ إنها حوار صامت بين ذهن القارئ وإيقاع الصفحة. عندما ننقل اللغة العربية إلى الفضاء الرقمي، نقع كثيراً في فخ استخدام قوالب مصممة أساساً للغات اللاتينية دون مراعاة الطبيعة التركيبية للحرف العربي.

<Callout type="info" title="أهمية الخصائص المنطقية">
استخدام CSS Logical Properties مثل \`margin-inline\` و \`padding-inline\` يضمن تدفقاً طبيعياً للتنسيق دون الحاجة إلى مضاعفة ملفات التنسيق في المشاريع ثنائية الاتجاه.
</Callout>

## 1. التناغم البصري ومقاييس الأسطر

الحرف العربي بطبيعته متصل وتعبيري، ولذلك فإن المسافة بين الأسطر (\`line-height\`) يجب ألا تقل عن \`1.85\` في النصوص الطويلة. إذا ضاق السطر، اصطدمت حركات الإعراب بأسنان الحروف العلوية والسفلية، مما يُنهك عين القارئ سريعاً.

<PullQuote quote="الطباعة الجيدة غير مرئية؛ إنها تفتح الطريق للمعنى دون أن تعترضه" author="روبرت برينجهرست" />

\`\`\`css
.article-content {
  font-family: var(--font-ibm-plex-arabic), system-ui, sans-serif;
  line-height: 1.85;
  max-inline-size: 68ch;
  unicode-bidi: isolate;
}
\`\`\`

## 2. خاتمة وتأملات

بناء منصة نشر عربية أولاً ليس مجرد اتجاه \`dir="rtl"\`، بل هو احترام معماري لهندسة اللغة وجمالياتها.`,
      rich_html: `<h1>بيان في هندسة الخط والطباعة العربية على الويب الحديث</h1><p>القراءة ليست مجرد إدراك بصري للرموز؛ إنها حوار صامت بين ذهن القارئ وإيقاع الصفحة. عندما ننقل اللغة العربية إلى الفضاء الرقمي، نقع كثيراً في فخ استخدام قوالب مصممة أساساً للغات اللاتينية دون مراعاة الطبيعة التركيبية للحرف العربي.</p><div class="editorial-callout editorial-callout-info" data-type="info"><span class="editorial-callout-title">أهمية الخصائص المنطقية</span><div class="editorial-callout-body">استخدام CSS Logical Properties يضمن تدفقاً طبيعياً للتنسيق.</div></div><h2>1. التناغم البصري ومقاييس الأسطر</h2><p>الحرف العربي بطبيعته متصل وتعبيري، ولذلك فإن المسافة بين الأسطر يجب ألا تقل عن 1.85 في النصوص الطويلة.</p><blockquote class="editorial-pullquote"><p>«الطباعة الجيدة غير مرئية؛ إنها تفتح الطريق للمعنى دون أن تعترضه»</p><cite>— روبرت برينجهرست</cite></blockquote><h2>2. خاتمة وتأملات</h2><p>بناء منصة نشر عربية أولاً هو احترام معماري لهندسة اللغة.</p>`,
      markdown_derivative: `# بيان في هندسة الخط والطباعة العربية على الويب الحديث\n\nالقراءة ليست مجرد إدراك بصري للرموز؛ إنها حوار صامت بين ذهن القارئ وإيقاع الصفحة.\n\n> [!info] أهمية الخصائص المنطقية\n> استخدام CSS Logical Properties يضمن تدفقاً طبيعياً للتنسيق.`,
      plaintext_derivative: `بيان في هندسة الخط والطباعة العربية على الويب الحديث\nالكاتب: ممدوح أبو عمار\nتاريخ النشر: 2026-09-23\n\nالقراءة ليست مجرد إدراك بصري للرموز؛ إنها حوار صامت بين ذهن القارئ وإيقاع الصفحة.`,
      created_at: '2026-09-23T10:00:00Z',
    },
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    slug: 'building-zero-drift-publishing-pipelines',
    title: 'هندسة خطوط النشر الحتمية: توليد 3 مشتقات رقمية دون انحراف المحتوى',
    excerpt: 'دليل هندسي حصري للمشتركين يشرح بالتفصيل بناء معمارية نشر تحول وثيقة MDX واحدة إلى HTML تفاعلي، وماركداون نقي، ونص UTF-8 صلب مع ضمانات الاسترجاع المتطابق.',
    cover_image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    cover_image_alt: 'خوادم بيانات وشبكات متصلة ترمز لخطوط الأنابيب الهندسية',
    visibility: 'PREMIUM',
    status: 'PUBLISHED',
    topic_id: '10000000-0000-0000-0000-000000000001',
    author_id: '00000000-0000-0000-0000-000000000001',
    reading_time_minutes: 12,
    seo_title: 'هندسة خطوط النشر الحتمية | دليل المشتركين الحصري',
    seo_description: 'دليل تقني تفصيلي لبناء منظومة نشر حتمية موحدة، وإدارة الاشتراكات المدفوعة مع حماية الخوادم من تسريب البيانات.',
    published_at: '2026-09-25T11:00:00Z',
    scheduled_at: null,
    created_at: '2026-09-25T09:00:00Z',
    updated_at: '2026-09-25T11:00:00Z',
    revision: {
      id: 'rev-02',
      article_id: '20000000-0000-0000-0000-000000000002',
      revision_number: 1,
      mdx_source: `# هندسة خطوط النشر الحتمية: توليد 3 مشتقات رقمية دون انحراف المحتوى

تعتمد منصات النشر التقليدية على حفظ نسخ متفرقة للمقالات: نسخة للعرض في المتصفح، ونسخة للموجز الإخباري RSS، وربما نسخة بصيغة Markdown للتحميل. تؤدي هذه الطريقة حتماً إلى ظاهرة انحراف المحتوى (Content Drift).

في هذه المقالة الحصرية، سنستعرض المعمارية الدقيقة لبناء محول AST حتمي يولد المشتقات الثلاثة في عملية ذرية واحدة (Atomic Publishing).

## معمارية المحول الموحد

يبدأ مسار المعالجة من وثيقة Markdown/MDX المرجعية التي تخضع للتحليل النحوي عبر مكتبة Remark.

\`\`\`mermaid
graph LR
  MDX[وثيقة MDX الأصلية] --> AST[شجرة النحو التجريدية]
  AST --> HTML[Rich HTML]
  AST --> MD[CommonMark Markdown]
  AST --> TXT[Plain UTF-8 Text]
\`\`\`

## حماية المحتوى على مستوى الخادم (Zero Leakage)

الأمان في الاشتراكات المدفوعة يبدأ بعدم إرسال بايت واحد من المحتوى المحمي إلى المتصفح ما لم يتم التحقق من صحة الاشتراك.`,
      rich_html: `<h1>هندسة خطوط النشر الحتمية</h1><p>تعتمد منصات النشر التقليدية على حفظ نسخ متفرقة للمقالات: نسخة للعرض في المتصفح، ونسخة للموجز الإخباري RSS، وربما نسخة بصيغة Markdown للتحميل. تؤدي هذه الطريقة حتماً إلى ظاهرة انحراف المحتوى (Content Drift).</p><p>في هذه المقالة الحصرية، سنستعرض المعمارية الدقيقة لبناء محول AST حتمي يولد المشتقات الثلاثة في عملية ذرية واحدة.</p><h2>معمارية المحول الموحد</h2><div class="editorial-mermaid" data-mermaid="graph LR" role="img" aria-label="رسم تخطيطي بياني"><pre class="mermaid">graph LR</pre></div><h2>حماية المحتوى على مستوى الخادم (Zero Leakage)</h2><p>الأمان في الاشتراكات المدفوعة يبدأ بعدم إرسال بايت واحد من المحتوى المحمي إلى المتصفح ما لم يتم التحقق من صحة الاشتراك.</p>`,
      markdown_derivative: `# هندسة خطوط النشر الحتمية\n\nتعتمد منصات النشر التقليدية على حفظ نسخ متفرقة للمقالات.\n\nفي هذه المقالة الحصرية، سنستعرض المعمارية الدقيقة.`,
      plaintext_derivative: `هندسة خطوط النشر الحتمية\nالكاتب: ممدوح أبو عمار\nتاريخ النشر: 2026-09-25\n\nتعتمد منصات النشر التقليدية على حفظ نسخ متفرقة للمقالات.\n\nفي هذه المقالة الحصرية، سنستعرض المعمارية الدقيقة.`,
      created_at: '2026-09-25T11:00:00Z',
    },
  },
];

export async function getPublishedArticles(query?: string, topicSlug?: string) {
  let list = SEED_ARTICLES.filter((a) => a.status === 'PUBLISHED');

  if (topicSlug) {
    const topic = SEED_TOPICS.find((t) => t.slug === topicSlug);
    if (topic) {
      list = list.filter((a) => a.topic_id === topic.id);
    }
  }

  if (query && query.trim()) {
    list = list.filter(
      (a) => matchArabicQuery(a.title, query) || matchArabicQuery(a.excerpt, query)
    );
  }

  return list;
}

export async function getArticleBySlug(slug: string) {
  return SEED_ARTICLES.find((a) => a.slug === slug) || null;
}

export async function getTopicBySlug(slug: string) {
  return SEED_TOPICS.find((t) => t.slug === slug) || null;
}

export async function getAllTopics() {
  return SEED_TOPICS;
}

export async function getAuthor() {
  return SEED_AUTHOR;
}
