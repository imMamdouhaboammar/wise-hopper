'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BookOpen, Mail, Sparkles, User, PenTool, ArrowLeft } from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: typeof BookOpen;
}

const NAV_ITEMS: readonly NavItem[] = [
  { name: 'الرئيسية', href: '/', icon: Sparkles },
  { name: 'المقالات', href: '/articles', icon: BookOpen },
  { name: 'النشرة البريدية', href: '/newsletter', icon: Mail },
  { name: 'العضوية المميزة', href: '/membership', icon: Sparkles },
  { name: 'عن الكاتب', href: '/about', icon: User },
];

export function MainHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className="border-b border-lavender-border sticky top-0 bg-white/95 backdrop-blur-md z-40 transition-shadow duration-200">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo & Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xl p-1 -m-1"
          >
            <span className="w-10 h-10 rounded-xl bg-linear-to-br from-primary to-[#5F44C0] text-white flex items-center justify-center font-bold text-xl shadow-xs group-hover:scale-105 group-hover:shadow-md transition-all duration-200">
              و
            </span>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-ink-primary tracking-tight leading-tight group-hover:text-primary transition-colors">
                وايز هوبر
              </span>
              <span className="text-[11px] text-ink-secondary">نشر تحريري عربي مستقل</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-1 text-sm font-medium"
            aria-label="التنقل الأساسي"
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-2 rounded-lg transition-all duration-150 ${
                    active
                      ? 'text-primary font-semibold bg-lavender/60'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-lavender-light'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Controls & Mobile Hamburger Toggle */}
        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-primary bg-lavender/80 hover:bg-lavender-dark hover:text-primary-active rounded-xl transition-all border border-lavender-border"
          >
            <PenTool className="w-3.5 h-3.5" aria-hidden="true" />
            <span>استوديو النشر</span>
          </Link>

          <Link
            href="/newsletter"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-white bg-primary hover:bg-primary-hover active:bg-primary-active rounded-xl shadow-xs hover:shadow-md transition-all active:scale-[0.98]"
          >
            اشترك في النشرة
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2.5 rounded-xl text-ink-secondary hover:text-ink-primary hover:bg-lavender-light focus:outline-hidden focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة الرئيسية'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-ink-primary" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-20 bg-white border-b border-lavender-border shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-4">
            <nav className="flex flex-col gap-1" aria-label="تنقل الجوال">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-lavender text-primary'
                        : 'text-ink-primary hover:bg-lavender-light'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-ink-secondary'}`} />
                      <span>{item.name}</span>
                    </div>
                    {active && <ArrowLeft className="w-4 h-4 text-primary" />}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-lavender-border flex flex-col gap-2.5">
              <Link
                href="/newsletter"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>اشترك في النشرة البريدية</span>
              </Link>
              <Link
                href="/studio"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-lavender-light hover:bg-lavender text-primary text-xs font-semibold rounded-xl border border-lavender-border transition-colors"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>دخول استوديو النشر</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
