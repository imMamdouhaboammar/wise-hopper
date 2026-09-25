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
      className="p-5 bg-lavender-light rounded-2xl border border-lavender-border"
      aria-label="جدول المحتويات"
    >
      <h3 className="font-bold text-sm text-ink-primary mb-3">محتويات المقال</h3>
      <ul className="space-y-2 text-xs">
        {headings.map((item) => (
          <li
            key={item.id}
            style={{ paddingInlineStart: item.level === 3 ? '1rem' : '0' }}
          >
            <a
              href={`#${item.id}`}
              className={`block py-1 hover:text-primary transition-colors ${
                activeId === item.id
                  ? 'text-primary font-bold'
                  : 'text-ink-secondary font-normal'
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
