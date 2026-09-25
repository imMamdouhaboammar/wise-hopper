import Link from 'next/link';

export const metadata = {
  title: 'استوديو النشر | وايز هوبر',
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-lavender-light/40 flex flex-col">
      {/* Studio Header */}
      <header className="bg-white border-b border-lavender-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/studio" className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
                و
              </span>
              <span className="font-bold text-base text-ink-primary">استوديو النشر</span>
            </Link>

            <nav className="flex items-center gap-5 text-xs font-semibold text-ink-secondary">
              <Link href="/studio" className="hover:text-primary transition-colors">
                لوحة التحكم
              </Link>
              <Link href="/studio/articles" className="hover:text-primary transition-colors">
                إدارة المقالات
              </Link>
              <Link href="/studio/articles/new" className="text-primary hover:underline">
                + كتابة مقال جديد
              </Link>
              <Link href="/studio/newsletter" className="hover:text-primary transition-colors">
                النشرة والحملات
              </Link>
              <Link href="/studio/billing" className="hover:text-primary transition-colors">
                العضويات والإهداء
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3 py-1.5 bg-lavender hover:bg-lavender-dark text-primary text-xs font-semibold rounded-lg transition-colors"
            >
              عرض الموقع العام ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Main Studio Viewport */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">{children}</div>
    </div>
  );
}
