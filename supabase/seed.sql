-- Seed Author Profile
insert into public.authors (id, name, bio, avatar_url, social_links)
values (
  '00000000-0000-0000-0000-000000000001',
  'ممدوح أبو عمار',
  'مهندس برمجيات وكاتب تقني، أهتم بهندسة النظم الموزعة، التصميم المرتكز على المحتوى العربي، ومستقبل النشر الرقمي المستقل.',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  '{"x": "https://x.com/mamdouh", "github": "https://github.com/imMamdouhaboammar", "linkedin": "https://linkedin.com"}'::jsonb
) on conflict (id) do nothing;

-- Seed Topics
insert into public.topics (id, slug, name, description)
values
  ('10000000-0000-0000-0000-000000000001', 'system-architecture', 'هندسة النظم', 'مقالات متعمقة في تصميم المعماريات الموزعة، قواعد البيانات، وقابلية التوسع.'),
  ('10000000-0000-0000-0000-000000000002', 'editorial-design', 'التصميم التحريري', 'فلسفة التصميم الرقمي العربي، الخطوط، وتجربة القراءة الطويلة.'),
  ('10000000-0000-0000-0000-000000000003', 'independent-publishing', 'النشر المستقل', 'استراتيجيات بناء النشرات البريدية ونماذج الاشتراكات المدفوعة لصناع المحتوى.')
on conflict (slug) do nothing;

-- Seed Tags
insert into public.tags (slug, name)
values
  ('nextjs', 'Next.js'),
  ('typescript', 'TypeScript'),
  ('arabic-ux', 'تجربة المستخدم العربية'),
  ('supabase', 'Supabase'),
  ('monetization', 'الاشتراكات المدفوعة')
on conflict (slug) do nothing;

-- Seed Free Article
insert into public.articles (
  id,
  slug,
  title,
  excerpt,
  cover_image_url,
  cover_image_alt,
  visibility,
  status,
  topic_id,
  author_id,
  reading_time_minutes,
  seo_title,
  seo_description,
  published_at
) values (
  '20000000-0000-0000-0000-000000000001',
  'arabic-web-typography-manifesto',
  'بيان في هندسة الخط والطباعة العربية على الويب الحديث',
  'لماذا تفشل معظم المواقع العربية في تقديم تجربة قراءة مريحة؟ وكيف نبني مقروئية متزنة تجمع بين أصالة الخط العربي وصرامة الأداء الهندسي.',
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
  'مخطوطة عربية تقليدية بجانب شاشة كود برمجي حديث',
  'FREE',
  'PUBLISHED',
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  7,
  'بيان في هندسة الخط والطباعة العربية على الويب الحديث | ممدوح أبو عمار',
  'تحليل معمق لهندسة المقروئية العربية، الخطوط التحريرية، والخصائص المنطقية في لغة التنسيق الانسيابية على الويب المعاصر.',
  now() - interval '2 days'
) on conflict (slug) do nothing;

-- Seed Revision for Free Article
insert into public.article_revisions (
  article_id,
  revision_number,
  mdx_source,
  rich_html,
  markdown_derivative,
  plaintext_derivative
) values (
  '20000000-0000-0000-0000-000000000001',
  1,
  E'# بيان في هندسة الخط والطباعة العربية على الويب الحديث\n\nالقراءة ليست مجرد إدراك بصري للرموز؛ إنها حوار صامت بين ذهن القارئ وإيقاع الصفحة. عندما ننقل اللغة العربية إلى الفضاء الرقمي، نقع كثيراً في فخ استخدام قوالب مصممة أساساً للغات اللاتينية دون مراعاة الطبيعة التركيبية للحرف العربي.\n\n<Callout type="info" title="أهمية الخصائص المنطقية">\nاستخدام CSS Logical Properties مثل `margin-inline` و `padding-inline` يضمن تدفقاً طبيعياً للتنسيق دون الحاجة إلى مضاعفة ملفات التنسيق في المشاريع ثنائية الاتجاه.\n</Callout>\n\n## 1. التناغم البصري ومقاييس الأسطر\n\nالحرف العربي بطبيعته متصل وتعبيري، ولذلك فإن المسافة بين الأسطر (`line-height`) يجب ألا تقل عن `1.85` في النصوص الطويلة. إذا ضاق السطر، اصطدمت حركات الإعراب بأسنان الحروف العلوية والسفلية، مما يُنهك عين القارئ سريعاً.\n\n```css\n.article-content {\n  font-family: var(--font-ibm-plex-arabic), system-ui, sans-serif;\n  line-height: 1.85;\n  max-inline-size: 68ch;\n  unicode-bidi: isolate;\n}\n```\n\n## 2. خاتمة وتأملات\n\nبناء منصة نشر عربية أولاً ليس مجرد اتجاه `dir="rtl"`، بل هو احترام معماري لهندسة اللغة وجمالياتها.',
  E'<div class="prose prose-purple">\n<h1>بيان في هندسة الخط والطباعة العربية على الويب الحديث</h1>\n<p>القراءة ليست مجرد إدراك بصري للرموز؛ إنها حوار صامت بين ذهن القارئ وإيقاع الصفحة.</p>\n<div class="callout callout-info"><strong>أهمية الخصائص المنطقية:</strong> استخدام الخصائص المنطقية يضمن تدفقاً انسيابياً.</div>\n<h2>1. التناغم البصري ومقاييس الأسطر</h2>\n<p>الحرف العربي متصل وتعبيري...</p>\n</div>',
  E'# بيان في هندسة الخط والطباعة العربية على الويب الحديث\n\nالقراءة ليست مجرد إدراك بصري للرموز؛ إنها حوار صامت بين ذهن القارئ وإيقاع الصفحة.\n\n> **أهمية الخصائص المنطقية:** استخدام الخصائص المنطقية يضمن تدفقاً انسيابياً.\n\n## 1. التناغم البصري ومقاييس الأسطر\n\nالحرف العربي بطبيعته متصل وتعبيري...',
  E'بيان في هندسة الخط والطباعة العربية على الويب الحديث\nالكاتب: ممدوح أبو عمار\n\nالقراءة ليست مجرد إدراك بصري للرموز؛ إنها حوار صامت بين ذهن القارئ وإيقاع الصفحة.\n\n[تنبيه: أهمية الخصائص المنطقية] استخدام الخصائص المنطقية يضمن تدفقاً انسيابياً.\n\n1. التناغم البصري ومقاييس الأسطر\nالحرف العربي بطبيعته متصل وتعبيري...'
) on conflict do nothing;

-- Seed Premium Article
insert into public.articles (
  id,
  slug,
  title,
  excerpt,
  cover_image_url,
  cover_image_alt,
  visibility,
  status,
  topic_id,
  author_id,
  reading_time_minutes,
  seo_title,
  seo_description,
  published_at
) values (
  '20000000-0000-0000-0000-000000000002',
  'building-zero-drift-publishing-pipelines',
  'هندسة خطوط النشر الحتمية: توليد 3 مشتقات رقمية دون انحراف المحتوى',
  'دليل هندسي حصري للمشتركين يشرح بالتفصيل بناء معمارية نشر تحول وثيقة MDX واحدة إلى HTML تفاعلي، وماركداون نقي، ونص UTF-8 صلب مع ضمانات الاسترجاع المتطابق.',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
  'خوادم بيانات وشبكات متصلة ترمز لخطوط الأنابيب الهندسية',
  'PREMIUM',
  'PUBLISHED',
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  12,
  'هندسة خطوط النشر الحتمية | دليل المشتركين الحصري',
  'دليل تقني تفصيلي لبناء منظومة نشر حتمية موحدة، وإدارة الاشتراكات المدفوعة مع حماية الخوادم من تسريب البيانات.',
  now() - interval '6 hours'
) on conflict (slug) do nothing;

-- Seed Revision for Premium Article
insert into public.article_revisions (
  article_id,
  revision_number,
  mdx_source,
  rich_html,
  markdown_derivative,
  plaintext_derivative
) values (
  '20000000-0000-0000-0000-000000000002',
  1,
  E'# هندسة خطوط النشر الحتمية: توليد 3 مشتقات رقمية دون انحراف المحتوى\n\nتعتمد منصات النشر التقليدية على حفظ نسخ متفرقة للمقالات: نسخة للعرض في المتصفح، ونسخة للموجز الإخباري RSS، وربما نسخة بصيغة Markdown للتحميل. تؤدي هذه الطريقة حتماً إلى ظاهرة انحراف المحتوى (Content Drift).\n\nفي هذه المقالة الحصرية، سنستعرض المعمارية الدقيقة لبناء محول AST حتمي يولد المشتقات الثلاثة في عملية ذرية واحدة (Atomic Publishing).\n\n## معمارية المحول الموحد\n\nيبدأ مسار المعالجة من وثيقة Markdown/MDX المرجعية التي تخضع للتحليل النحوي عبر مكتبة Remark.\n\n```mermaid\ngraph LR\n  MDX[وثيقة MDX الأصلية] --> AST[شجرة النحو التجريدية]\n  AST --> HTML[Rich HTML]\n  AST --> MD[CommonMark Markdown]\n  AST --> TXT[Plain UTF-8 Text]\n```\n\n## حماية المحتوى على مستوى الخادم (Zero Leakage)\n\nالأمان في الاشتراكات المدفوعة يبدأ بعدم إرسال بايت واحد من المحتوى المحمي إلى المتصفح ما لم يتم التحقق من صحة الاشتراك.',
  E'<div class="prose"><h1>هندسة خطوط النشر الحتمية</h1><p>المحتوى الكامل للمشتركين...</p></div>',
  E'# هندسة خطوط النشر الحتمية\nالمحتوى الكامل للمشتركين...',
  E'هندسة خطوط النشر الحتمية\nالمحتوى الكامل للمشتركين...'
) on conflict do nothing;
