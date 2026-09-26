import type { Metadata } from 'next';
import Link from 'next/link';
import '@/styles/globals.css';
import { MainHeader } from '@/components/layout/main-header';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    template: '%s | وايز هوبر',
    default: 'وايز هوبر | منصة النشر الرقمي العربي المستقل',
  },
  description: 'منصة تحريرية عربية متخصصة في هندسة النظم، التصميم الرقمي، ومستقبل النشر المستقل.',
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [{ url: '/rss.xml', title: 'RSS Feed' }],
      'application/atom+xml': [{ url: '/atom.xml', title: 'Atom Feed' }],
    },
  },
  openGraph: {
    locale: 'ar_AR',
    type: 'website',
    siteName: 'وايز هوبر',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-ink-primary selection:bg-lavender selection:text-primary">
        {process.env.DEMO_MODE === 'true' && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 text-amber-900 px-4 py-1.5 text-center text-xs font-medium" role="alert">
            نسخة تجريبية: البيانات والدفع محاكاة
          </div>
        )}
        {/* Navigation Bar */}
        <MainHeader />

        {/* Main Content Area */}
        <main className="flex-1">{children}</main>

        {/* Editorial Footer */}
        <footer className="border-t border-lavender-border bg-lavender-light/50 py-16 mt-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-base">
                    و
                  </span>
                  <span className="font-bold text-lg text-ink-primary">وايز هوبر</span>
                </div>
                <p className="text-sm text-ink-secondary leading-relaxed max-w-md">
                  منصة شخصية للنشر الرقمي المعمق باللغة العربية. نكتب مرة واحدة، وننشر بحتمية ونقاء عبر الويب الحديث
                  والموجزات الإخبارية والمشتقات النصية.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-ink-primary mb-4">الأقسام</h4>
                <ul className="space-y-2 text-sm text-ink-secondary">
                  <li>
                    <Link href="/articles" className="hover:text-primary transition-colors">
                      جميع المقالات
                    </Link>
                  </li>
                  <li>
                    <Link href="/newsletter" className="hover:text-primary transition-colors">
                      أرشيف النشرة
                    </Link>
                  </li>
                  <li>
                    <Link href="/membership" className="hover:text-primary transition-colors">
                      خطط العضوية
                    </Link>
                  </li>
                  <li>
                    <Link href="/account" className="hover:text-primary transition-colors">
                      حساب القارئ
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-primary transition-colors">
                      بيان المنصة
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-ink-primary mb-4">الموجزات والأرشفة</h4>
                <ul className="space-y-2 text-sm text-ink-secondary">
                  <li>
                    <Link href="/rss.xml" className="hover:text-primary transition-colors">
                      موجز RSS 2.0
                    </Link>
                  </li>
                  <li>
                    <Link href="/atom.xml" className="hover:text-primary transition-colors">
                      موجز Atom
                    </Link>
                  </li>
                  <li>
                    <Link href="/sitemap.xml" className="hover:text-primary transition-colors">
                      خريطة الموقع Sitemap
                    </Link>
                  </li>
                  <li>
                    <Link href="/llms.txt" className="hover:text-primary transition-colors">
                      فهرس الوكلاء llms.txt
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-lavender-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ink-muted gap-4">
              <span>جميع الحقوق محفوظة © 2026 ممدوح أبو عمار. كُتب وصُمم بحب للعربية.</span>
              <span className="ltr-isolate">Designed with pure RTL and CSS Logical Properties.</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
