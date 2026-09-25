import { describe, it, expect } from 'vitest';
import { normalizeArabic, tokenizeArabic, matchArabicQuery } from './arabic-normalizer';

describe('Arabic Text Normalization (Fable TDD)', () => {
  it('strips all Arabic diacritics (tashkeel/harakat)', () => {
    const withTashkeel = 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ';
    const expected = 'الحمد لله رب العالمين';
    expect(normalizeArabic(withTashkeel)).toBe(expected);
  });

  it('normalizes all Alef forms (أ, إ, آ, ٱ) to bare Alef (ا)', () => {
    const input = 'إتقان الأداء في آفاق الابتكار';
    const expected = 'اتقان الاداء في افاق الابتكار';
    expect(normalizeArabic(input)).toBe(expected);
  });

  it('normalizes Taa Marbuta (ة) to Haa (ه)', () => {
    const input = 'مكتبة رقمية حديثة';
    const expected = 'مكتبه رقميه حديثه';
    expect(normalizeArabic(input)).toBe(expected);
  });

  it('normalizes Alef Maqsura (ى) to Yaa (ي)', () => {
    const input = 'إلى المستشفى والقرى المجاورة';
    const expected = 'الي المستشفي والقري المجاوره';
    expect(normalizeArabic(input)).toBe(expected);
  });

  it('removes Tatweel / Kashida elongation lines', () => {
    const input = 'هــــنـــدســــة';
    const expected = 'هندسه';
    expect(normalizeArabic(input)).toBe(expected);
  });

  it('preserves mixed numbers, Latin words, and technical terms', () => {
    const input = 'تصميم Next.js 15 مع Supabase في عام 2026';
    const expected = 'تصميم next.js 15 مع supabase في عام 2026';
    expect(normalizeArabic(input)).toBe(expected);
  });

  it('tokenizes search queries into normalized distinctive tokens', () => {
    const query = 'الخطوط، والطباعة: العربية!';
    const tokens = tokenizeArabic(query);
    expect(tokens).toEqual(['الخطوط', 'والطباعه', 'العربيه']);
  });

  it('matches search queries flexibly regardless of spelling variants and tashkeel', () => {
    const articleTitle = 'بيان في هندسة الخط والطباعة العربية';
    
    // Search with Alef variants and Tashkeel
    expect(matchArabicQuery(articleTitle, 'هَنْدَسَةُ الخَط')).toBe(true);
    expect(matchArabicQuery(articleTitle, 'الطباعه')).toBe(true);
    expect(matchArabicQuery(articleTitle, 'بيان')).toBe(true);
    expect(matchArabicQuery(articleTitle, 'قواعد')).toBe(false);
  });
});
