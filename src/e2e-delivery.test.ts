import { describe, it, expect } from 'vitest';
import { GET as contentRouteHandler } from '@/app/api/content/[slug]/route';
import { POST as webhookRouteHandler } from '@/app/api/webhooks/billing/route';
import { NextRequest } from 'next/server';
import { SimulatedBillingProvider } from '@/lib/billing/simulated-provider';

describe('E2E Delivery & Security Integration Tests (Fable TDD)', () => {
  const secretKey = 'local-simulated-webhook-secret-32-bytes-long';
  const provider = new SimulatedBillingProvider();

  describe('Three Derivatives Public Content Delivery', () => {
    it('serves full normalized markdown for FREE article with X-Robots-Tag noindex', async () => {
      const request = new NextRequest('http://localhost:3000/api/content/arabic-web-typography-manifesto?format=md');
      const response = await contentRouteHandler(request, {
        params: Promise.resolve({ slug: 'arabic-web-typography-manifesto' }),
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/markdown');
      expect(response.headers.get('x-robots-tag')).toBe('noindex, follow');

      const body = await response.text();
      expect(body).toContain('# بيان في هندسة الخط والطباعة العربية على الويب الحديث');
      expect(body).toContain('أهمية الخصائص المنطقية');
    });

    it('serves full plain text for FREE article with UTF-8 encoding', async () => {
      const request = new NextRequest('http://localhost:3000/api/content/arabic-web-typography-manifesto?format=txt');
      const response = await contentRouteHandler(request, {
        params: Promise.resolve({ slug: 'arabic-web-typography-manifesto' }),
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/plain');

      const body = await response.text();
      expect(body).toContain('بيان في هندسة الخط والطباعة العربية على الويب الحديث');
      expect(body).toContain('الكاتب: ممدوح أبو عمار');
      // No raw HTML tags
      expect(body).not.toContain('<div');
    });
  });

  describe('Premium Paywall Zero-Leakage across Derivatives', () => {
    it('blocks unauthorized access to premium markdown and serves only teaser', async () => {
      const request = new NextRequest('http://localhost:3000/api/content/building-zero-drift-publishing-pipelines?format=md');
      const response = await contentRouteHandler(request, {
        params: Promise.resolve({ slug: 'building-zero-drift-publishing-pipelines' }),
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('cache-control')).toContain('private');

      const body = await response.text();
      // Ensure the secret protected body NEVER leaks
      expect(body).not.toContain('Zero Leakage');
      expect(body).not.toContain('الأمان في الاشتراكات المدفوعة يبدأ بعدم إرسال بايت واحد');

      // But teaser is present
      expect(body).toContain('تعتمد منصات النشر التقليدية');
      expect(body).toContain('[محتوى حصري للمشتركين]');
    });

    it('blocks unauthorized access to premium plain text and serves only teaser', async () => {
      const request = new NextRequest('http://localhost:3000/api/content/building-zero-drift-publishing-pipelines?format=txt');
      const response = await contentRouteHandler(request, {
        params: Promise.resolve({ slug: 'building-zero-drift-publishing-pipelines' }),
      });

      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).not.toContain('Zero Leakage');
      expect(body).toContain('[محتوى حصري مخصص لأعضاء العضوية المميزة]');
    });

    it('grants full premium markdown access when authorized session is present', async () => {
      const request = new NextRequest('http://localhost:3000/api/content/building-zero-drift-publishing-pipelines?format=md&auth=true');
      const response = await contentRouteHandler(request, {
        params: Promise.resolve({ slug: 'building-zero-drift-publishing-pipelines' }),
      });

      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toContain('هندسة خطوط النشر الحتمية');
      expect(body).toContain('في هذه المقالة الحصرية، سنستعرض المعمارية الدقيقة');
    });
  });

  describe('Webhook Endpoint Security', () => {
    it('rejects forged webhook requests with 401 Unauthorized', async () => {
      const forgedRequest = new NextRequest('http://localhost:3000/api/webhooks/billing', {
        method: 'POST',
        headers: {
          'x-signature': 'sha256=forged_invalid_signature_hex_code',
        },
        body: JSON.stringify({ event: 'fake' }),
      });

      const response = await webhookRouteHandler(forgedRequest);
      expect(response.status).toBe(401);
    });

    it('accepts legitimate HMAC-signed webhook and processes event', async () => {
      const payload = JSON.stringify({
        event_id: 'evt_e2e_001',
        event_type: 'subscription_created',
        customer_email: 'buyer@example.com',
        subscription_id: 'sub_valid_123',
        plan: 'annual',
      });

      const signature = provider.generateSignature(payload, secretKey);

      const validRequest = new NextRequest('http://localhost:3000/api/webhooks/billing', {
        method: 'POST',
        headers: {
          'x-signature': signature,
        },
        body: payload,
      });

      const response = await webhookRouteHandler(validRequest);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.received).toBe(true);
      expect(json.eventId).toBe('evt_e2e_001');
    });
  });
});
