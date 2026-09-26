import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET as contentRouteHandler } from '@/app/api/content/[slug]/route';
import { POST as webhookRouteHandler } from '@/app/api/webhooks/billing/route';
import { ACTIVE_SUBSCRIPTIONS_STORE } from '@/lib/billing/webhook-ledger';
import { POST as studioPublishRouteHandler } from '@/app/api/studio/publish/route';
import { GET as unsubscribeRouteHandler } from '@/app/api/newsletter/unsubscribe/route';
import { POST as campaignRouteHandler } from '@/app/api/newsletter/campaign/route';
import { newsletterService } from '@/lib/newsletter/instance';
import { GET as rssRouteHandler } from '@/app/rss.xml/route';
import { GET as atomRouteHandler } from '@/app/atom.xml/route';
import { GET as llmsRouteHandler } from '@/app/llms.txt/route';
import { NextRequest } from 'next/server';
import { SimulatedBillingProvider } from '@/lib/billing/simulated-provider';
import { verifyReaderEntitlement } from '@/lib/auth/session';

describe('E2E Delivery & Security Integration Tests (Fable TDD)', () => {
  const secretKey = 'local-simulated-webhook-secret-32-bytes-long';
  const testStudioKey = 'test-studio-secret-key-32-chars-ok';
  const provider = new SimulatedBillingProvider();

  beforeEach(() => {
    process.env.STUDIO_SECRET_KEY = testStudioKey;
  });

  afterEach(() => {
    delete process.env.STUDIO_SECRET_KEY;
  });

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

    it('rejects trivial ?auth=true client parameters and keeps premium content protected', async () => {
      const request = new NextRequest('http://localhost:3000/api/content/building-zero-drift-publishing-pipelines?format=md&auth=true');
      const response = await contentRouteHandler(request, {
        params: Promise.resolve({ slug: 'building-zero-drift-publishing-pipelines' }),
      });

      expect(response.status).toBe(200);
      const body = await response.text();
      // Parameter manipulation MUST NOT unlock secret content
      expect(body).not.toContain('Zero Leakage');
      expect(body).toContain('[محتوى حصري للمشتركين]');
    });

    it('grants full premium markdown access when verified server session is present', async () => {
      const request = new NextRequest('http://localhost:3000/api/content/building-zero-drift-publishing-pipelines?format=md', {
        headers: {
          'x-studio-key': testStudioKey,
        },
      });
      const response = await contentRouteHandler(request, {
        params: Promise.resolve({ slug: 'building-zero-drift-publishing-pipelines' }),
      });

      expect(response.status).toBe(200);
      const body = await response.text();
      expect(body).toContain('هندسة خطوط النشر الحتمية');
      expect(body).toContain('في هذه المقالة الحصرية، سنستعرض المعمارية الدقيقة');
    });
  });

  describe('Webhook Endpoint Security & Idempotent Persistence', () => {
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

    it('accepts legitimate HMAC-signed webhook and commits subscription before returning 200', async () => {
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

      // Verify state was actually committed before responding
      const committed = ACTIVE_SUBSCRIPTIONS_STORE.get('sub_valid_123');
      expect(committed).toBeDefined();
      expect(committed?.status).toBe('active');
      expect(committed?.planType).toBe('annual');
    });
  });

  describe('Studio Publishing & Protection', () => {
    it('rejects unauthenticated publishing requests with 401', async () => {
      const unauthRequest = new NextRequest('http://localhost:3000/api/studio/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test', slug: 'test', contentMdx: '# Test' }),
      });

      const response = await studioPublishRouteHandler(unauthRequest);
      expect(response.status).toBe(401);
    });

    it('publishes and persists articles when authorized as owner', async () => {
      const authRequest = new NextRequest('http://localhost:3000/api/studio/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-studio-key': 'test-studio-secret-key-32-chars-ok',
        },
        body: JSON.stringify({
          title: 'مقال تجريبي منشور من الاستوديو',
          slug: 'studio-test-published-article',
          excerpt: 'مقتطف تعريفي لمقال تجريبي.',
          contentMdx: '# مقال تجريبي\n\nنص تحليلي منشور.',
          visibility: 'FREE',
          status: 'PUBLISHED',
        }),
      });

      const response = await studioPublishRouteHandler(authRequest);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.slug).toBe('studio-test-published-article');
      expect(json.urls.markdown).toBe('/content/studio-test-published-article.md');
    });
  });

  describe('Newsletter Security & Campaign Execution', () => {
    it('rejects unsubscription requests without a secret token', async () => {
      const req = new NextRequest('http://localhost:3000/api/newsletter/unsubscribe');
      const response = await unsubscribeRouteHandler(req);
      expect(response.status).toBe(400);
    });

    it('unsubscribes subscriber when valid secret token is provided', async () => {
      const sub = await newsletterService.subscribe('unsub_test@example.com', ['system-architecture']);
      expect(sub.unsubscribe_token).toBeDefined();

      const req = new NextRequest(`http://localhost:3000/api/newsletter/unsubscribe?token=${sub.unsubscribe_token}`);
      const response = await unsubscribeRouteHandler(req);
      expect(response.status).toBe(303);

      const updated = await newsletterService.getSubscriber('unsub_test@example.com');
      expect(updated?.status).toBe('unsubscribed');
    });

    it('rejects campaign dispatch from unauthenticated requests with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/newsletter/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'Test Campaign', body: 'Test Body' }),
      });

      const response = await campaignRouteHandler(req);
      expect(response.status).toBe(401);
    });

    it('dispatches campaigns to subscribers when authorized as owner', async () => {
      const req = new NextRequest('http://localhost:3000/api/newsletter/campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-studio-key': 'test-studio-secret-key-32-chars-ok',
        },
        body: JSON.stringify({
          subject: 'العدد 13: تحديثات معمارية',
          body: 'مرحباً بالقراء الأعزاء، إليكم ملخص الأسبوع.',
        }),
      });

      const response = await campaignRouteHandler(req);
      expect(response.status).toBe(200);
      const json = await response.json();
      expect(json.success).toBe(true);
      expect(json.subject).toBe('العدد 13: تحديثات معمارية');
    });
  });

  describe('Syndication Feeds & Machine-Readable Endpoints', () => {
    it('generates valid RSS 2.0 feed with Arabic items', async () => {
      const response = await rssRouteHandler();
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/rss+xml');

      const body = await response.text();
      expect(body).toContain('<rss version="2.0"');
      expect(body).toContain('<title>وايز هوبر | النشر الرقمي العربي المستقل</title>');
      expect(body).toContain('<language>ar</language>');
      expect(body).toContain('<item>');
    });

    it('generates valid Atom feed with xml:lang ar', async () => {
      const response = await atomRouteHandler();
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/atom+xml');

      const body = await response.text();
      expect(body).toContain('<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="ar">');
      expect(body).toContain('<entry>');
    });

    it('generates llms.txt indexing derivatives and AI-agent guidelines', async () => {
      const response = await llmsRouteHandler();
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/plain');

      const body = await response.text();
      expect(body).toContain('# وايز هوبر (Wise Hopper) | فهرس المحتوى للوكلاء والنماذج اللغوية (llms.txt)');
      expect(body).toContain('Raw Markdown URL');
      expect(body).toContain('Plain Text URL');
      expect(body).toContain('/content/');
    });
  });

  describe('DEMO_MODE Guard', () => {
    const originalDemoMode = process.env.DEMO_MODE;

    afterEach(() => {
      // Restore original env after each test
      if (originalDemoMode === undefined) {
        delete process.env.DEMO_MODE;
      } else {
        process.env.DEMO_MODE = originalDemoMode;
      }
    });

    it('blocks ?auth=true access to premium content when DEMO_MODE=false', async () => {
      process.env.DEMO_MODE = 'false';

      // Request with ?auth=true to a premium article should NOT grant entitlement
      const request = new NextRequest(
        'http://localhost:3000/api/content/building-zero-drift-publishing-pipelines?format=md&auth=true',
      );
      const session = await verifyReaderEntitlement(request);

      // DEMO_MODE=false means the ?auth=true bypass must not activate
      expect(session.hasEntitlement).toBe(false);
    });

    it('allows ?auth=true access when DEMO_MODE=true', async () => {
      process.env.DEMO_MODE = 'true';

      const request = new NextRequest(
        'http://localhost:3000/api/content/building-zero-drift-publishing-pipelines?format=md&auth=true',
      );
      const session = await verifyReaderEntitlement(request);

      // DEMO_MODE=true activates the shortcut for demo purposes only
      expect(session.hasEntitlement).toBe(true);
      expect(session.readerEmail).toBe('demo@wise-hopper.io');
    });
  });
});
