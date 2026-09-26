'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Mail,
  CreditCard,
  ExternalLink,
  LogOut,
} from 'lucide-react';

interface StudioNavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  isSpecial?: boolean;
}

const STUDIO_NAV_ITEMS: readonly StudioNavItem[] = [
  { name: 'لوحة القيادة', href: '/studio', icon: LayoutDashboard },
  { name: 'إدارة المقالات', href: '/studio/articles', icon: FileText },
  { name: 'مقال جديد', href: '/studio/articles/new', icon: PlusCircle, isSpecial: true },
  { name: 'النشرة والحملات', href: '/studio/newsletter', icon: Mail },
  { name: 'العضويات والفوترة', href: '/studio/billing', icon: CreditCard },
];

export function StudioHeader() {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === '/studio') return pathname === '/studio';
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-white border-b border-lavender-border sticky top-0 z-30 shadow-2xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link
            href="/studio"
            className="flex items-center gap-2.5 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-lg p-1 -m-1"
          >
            <span className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-[#5F44C0] text-white flex items-center justify-center font-bold text-sm shadow-2xs group-hover:scale-105 transition-transform">
              و
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-sm text-ink-primary group-hover:text-primary transition-colors">
                استوديو النشر
              </span>
              <span className="text-[10px] text-ink-secondary leading-none">مساحة الكاتب المالك</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1.5" aria-label="تنقل الاستوديو">
            {STUDIO_NAV_ITEMS.map((item) => {
              const active = isItemActive(item.href);
              const Icon = item.icon;

              if (item.isSpecial) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-primary bg-lavender/80 hover:bg-lavender hover:text-primary-hover border border-lavender-border transition-all mr-1 shadow-2xs"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-lavender/70 text-primary font-bold shadow-2xs'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-lavender-light'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-primary' : 'text-ink-muted'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lavender-light hover:bg-lavender text-ink-secondary hover:text-primary text-xs font-semibold rounded-lg border border-lavender-border transition-colors"
          >
            <span>الموقع العام</span>
            <ExternalLink className="w-3 h-3 text-ink-muted" />
          </Link>
          <form action="/api/studio/auth/logout" method="POST">
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>تسجيل الخروج</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
