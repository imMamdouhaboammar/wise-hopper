/**
 * Canonical Arabic UI strings for wise-hopper Studio
 * Short, natural, direct Arabic without filler or marketing tone.
 */

export const STUDIO_STRINGS = {
  // Navigation & General
  studio: 'الاستوديو',
  articles: 'المقالات',
  newArticle: 'مقال جديد',
  dashboard: 'لوحة التحكم',
  settings: 'الإعدادات',
  backToArticles: 'العودة للمقالات',
  viewSite: 'معاينة الموقع',
  help: 'مساعدة',
  shortcuts: 'اختصارات لوحة المفاتيح',
  close: 'إغلاق',
  cancel: 'إلغاء',
  confirm: 'تأكيد',
  delete: 'حذف',
  edit: 'تعديل',
  save: 'حفظ',
  restore: 'استعادة',
  retry: 'إعادة المحاولة',
  search: 'بحث في المقالات…',
  filter: 'تصفية',
  all: 'الكل',

  // Article Statuses
  statusDraft: 'مسودة',
  statusScheduled: 'مجدول',
  statusPublished: 'منشور',
  statusArchived: 'مؤرشف',
  statusFree: 'مجاني',
  statusPremium: 'للمشتركين',

  // Save Status
  saved: 'محفوظ',
  saving: 'جارٍ الحفظ…',
  saveFailed: 'لم يُحفظ، إعادة المحاولة',
  unsavedChanges: 'توجد تغييرات غير محفوظة',
  restorePrompt: 'تم العثور على نسخة محلية أحدث، هل ترغب في استعادتها؟',
  restoreConfirm: 'استعادة المسودة المحلية',
  discardLocal: 'تجاهل والاعتماد على الخادم',

  // Optimistic Lock Conflict
  conflictTitle: 'تعارض في حفظ المقال',
  conflictMessage: 'تم تعديل هذا المقال في نافذة أخرى أو من جلسة ثانية. اختر النسخة التي ترغب بالاحتفاظ بها:',
  keepMine: 'الاحتفاظ بنسختي الحالية',
  loadTheirs: 'تحميل نسخة الخادم الأحدث',

  // Editor View Modes
  modeVisual: 'مرئي',
  modeSource: 'المصدر (MDX)',
  modeSplit: 'عرض مزدوج',

  // Editor Typography & Stats
  wordsCount: (count: number) => `${count} كلمة`,
  readingTime: (mins: number) => `${mins} دقيقة قراءة`,
  charactersCount: (count: number) => `${count} حرف`,

  // Title Placeholder
  titlePlaceholder: 'عنوان المقال…',
  bodyPlaceholder: 'اكتب هنا، أو اكتب / لإدراج عنصر تحريري…',

  // Slash Menu Items & Aliases
  slashHeading2: 'عنوان فرعي كبير (H2)',
  slashHeading3: 'عنوان قسم (H3)',
  slashHeading4: 'عنوان فرعي صغير (H4)',
  slashBulletList: 'قائمة نقطية',
  slashOrderedList: 'قائمة رقمية',
  slashBlockquote: 'اقتباس مقالي',
  slashCodeBlock: 'كتلة برمجية',
  slashTable: 'جدول بيانات',
  slashHorizontalRule: 'فاصل أفقي',
  slashCallout: 'صندوق تنبيه',
  slashPullQuote: 'اقتباس بارز',
  slashFigure: 'صورة مع نص بديل',
  slashMermaid: 'رسم تخطيطي (Mermaid)',

  // Bubble Menu
  bold: 'غامق',
  italic: 'مائل',
  strike: 'مشطوب',
  code: 'رمز برمجي',
  link: 'رابط',
  unlink: 'إزالة الرابط',
  turnInto: 'تحويل إلى',

  // Custom Blocks UI
  calloutTypeInfo: 'معلومة',
  calloutTypeWarning: 'تحذير',
  calloutTypeTip: 'نصيحة',
  calloutTitlePlaceholder: 'عنوان التنبيه…',
  calloutBodyPlaceholder: 'نص التنبيه التحريري…',

  pullQuoteQuotePlaceholder: 'نص الاقتباس البارز…',
  pullQuoteAuthorPlaceholder: 'اسم القائل أو المصدر…',

  figureUploadImage: 'رفع صورة',
  figureUploading: 'جارٍ الرفع…',
  figureAltLabel: 'نص بديل للصورة (مطلوب)',
  figureAltPlaceholder: 'صف الصورة بدقة لضعاف البصر ومحركات البحث…',
  figureAltRequiredError: 'النص البديل إلزامي لنشر الصورة',
  figureCaptionPlaceholder: 'شرح توضيحي للصورة (اختياري)…',

  mermaidCodeTitle: 'كود المخطط البياني (Mermaid)',
  mermaidPreviewTitle: 'معاينة الرسم التخطيطي',
  mermaidErrorTitle: 'خطأ في صياغة المخطط',

  // Media & Uploads
  uploadErrorInvalidType: 'الصيغة غير مدعومة. يسمح فقط بـ JPEG, PNG, WebP, AVIF',
  uploadErrorTooLarge: 'حجم الملف يتجاوز الحد الأقصى (5 ميجابايت)',
  uploadErrorFailed: 'فشل رفع الصورة، يرجى المحاولة مرة أخرى',

  // Metadata Sidebar
  metadataTitle: 'بيانات المقال',
  slugLabel: 'الرابط الدائم (Slug)',
  slugPlaceholder: 'عنوان-المقال-بالعربية-او-الانجليزية',
  slugPreview: 'معاينة الرابط:',
  slugDuplicateError: 'الرابط الدائم مستخدم بالفعل لمقال آخر',
  excerptLabel: 'المقتطف التحريري',
  excerptPlaceholder: 'نبذة موجزة تظهر في خلاصات المقالات والبحث…',
  coverImageLabel: 'صورة الغلاف',
  coverImageAltLabel: 'النص البديل للغلاف (مطلوب)',
  topicLabel: 'التصنيف الرئيسي',
  tagsLabel: 'الوسوم',
  addTagPlaceholder: 'أضف وسماً واضغط Enter…',
  visibilityLabel: 'نوع النفاذ',
  visibilityFree: 'مقال مجاني متاح للجميع',
  visibilityPremium: 'مقال حصري للمشتركين',
  seoSettings: 'تهيئة محركات البحث (SEO)',
  seoTitleLabel: 'عنوان محركات البحث',
  seoDescLabel: 'وصف محركات البحث',
  seoSearchPreview: 'معاينة في محركات البحث',
  seoOgPreview: 'معاينة بطاقة المشاركة الاجتماعية',

  // Publishing Workflow
  publishNow: 'نشر الآن',
  schedulePublish: 'جدولة النشر',
  unpublishToDraft: 'إلغاء النشر وإعادة إلى مسودة',
  archiveArticle: 'أرشفة المقال',
  unarchiveArticle: 'إلغاء الأرشفة',
  prepublishTitle: 'قائمة التحقق قبل النشر',
  prepublishValidating: 'جارٍ تدقيق متطلبات النشر…',
  prepublishReady: 'المقال جاهز للنشر الفوري',
  prepublishHasErrors: 'يرجى تصحيح الأخطاء التالية للمتابعة:',
  prepublishHasWarnings: 'تنبيهات تحسين تحريرية (اختيارية):',
  publishedSuccess: 'تم نشر المقال بنجاح!',
  scheduledSuccess: 'تمت جدولة نشر المقال بنجاح!',
  viewPublishedPage: 'عرض المقال المنشور',
  viewMarkdownDerivative: 'مشتق Markdown النقي',
  viewPlaintextDerivative: 'مشتق UTF-8 النصي',

  // Revisions Drawer
  revisionsTitle: 'سجل المراجعات التاريخية',
  revisionNumber: (num: number) => `المراجعة رقم ${num}`,
  restoreToDraft: 'استعادة إلى المسودة',
  diffSideBySide: 'مقارنة الفروقات جنباً إلى جنب',
  currentDraft: 'المسودة الحالية',
  revisionHistorical: 'نسخة المراجعة',

  // Anonymous Reader Preview Toggle
  previewReaderView: 'ما يراه القارئ العام (محدود للمشتركين)',
  previewMemberView: 'ما يراه المشترك (كامل المحتوى)',

  // Validation messages
  errorTitleRequired: 'عنوان المقال إلزامي',
  errorSlugRequired: 'الرابط الدائم (Slug) إلزامي',
  errorExcerptRequired: 'المقتطف إلزامي',
  errorFigureAltRequired: 'توجد صور أو غلاف بدون نص بديل إلزامي',
  errorMdxInvalid: 'يحتوي كود MDX على أخطاء نحوية تمنع النشر',
} as const;

export type StudioStrings = typeof STUDIO_STRINGS;
