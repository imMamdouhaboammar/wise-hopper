'use client';

import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const article = document.querySelector('.editorial-prose');
    if (!article) return;

    const elements = article.querySelectorAll('h2, h3');
    const items: TocItem[] = [];

    elements.forEach((el, index) => {
      let id = el.id;
      if (!id) {
        id = `heading-${index}`;
        el.id = id;
      }
      items.push({
        id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3,
      });
    });

    setHeadings(items);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -60% 0%' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav
      className="p-5 bg-white rounded-2xl border border-lavender-border/70 shadow-soft-xs"
      aria-label="فهرس المقال"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-lavender-border/60">
        <h3 className="font-bold text-xs uppercase tracking-wider text-ink-primary">
          فهرس المقال
        </h3>
        <span className="text-xs font-medium text-ink-muted bg-lavender-light px-2.5 py-0.5 rounded-full">
          {headings.length} أقسام
        </span>
      </div>

      <ul className="space-y-1 text-xs sm:text-sm">
        {headings.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li
              key={item.id}
              style={{ paddingInlineStart: item.level === 3 ? '0.85rem' : '0' }}
            >
              <a
                href={`#${item.id}`}
                className={`group flex items-center gap-2 py-1.5 px-2.5 rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'text-primary font-bold bg-lavender/60 shadow-2xs'
                    : 'text-ink-secondary hover:text-ink-primary hover:bg-lavender-light'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                    isActive ? 'bg-primary scale-125' : 'bg-lavender-border group-hover:bg-primary/40'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate leading-relaxed">{item.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
