import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { newsletterService } from '@/lib/newsletter/instance';

describe('Resend Webhook Handler (Fable TDD)', () => {
  beforeEach(() => {
    delete process.env.RESEND_WEBHOOK_SECRET;
  });

  it('rejects invalid JSON payload when secret is unset', async () => {
    const req = new NextRequest('http://localhost:3000/api/webhooks/resend', {
      method: 'POST',
      body: 'invalid-json',
      headers: {
        'content-type': 'application/json',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid JSON payload');
  });

  it('rejects requests with missing Svix headers when secret is configured', async () => {
    process.env.RESEND_WEBHOOK_SECRET = 'whsec_test_secret_12345';

    const req = new NextRequest('http://localhost:3000/api/webhooks/resend', {
      method: 'POST',
      body: JSON.stringify({ type: 'email.delivered', data: {} }),
      headers: {
        'content-type': 'application/json',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Missing Svix webhook signature headers');
  });

  it('unsubscribes recipient upon email.bounced event', async () => {
    const email = 'bounce-test@wisehopper.dev';
    const sub = await newsletterService.subscribe(email, []);
    await newsletterService.confirmSubscription(sub.confirmation_token!);

    const initial = await newsletterService.getSubscriber(email);
    expect(initial?.status).toBe('active');

    const payload = {
      type: 'email.bounced',
      created_at: new Date().toISOString(),
      data: {
        email_id: 'em_123',
        to: [email],
        bounce: {
          type: 'Permanent',
          message: 'Mailbox does not exist',
        },
      },
    };

    const req = new NextRequest('http://localhost:3000/api/webhooks/resend', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'content-type': 'application/json',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);

    const updated = await newsletterService.getSubscriber(email);
    expect(updated?.status).toBe('unsubscribed');
  });

  it('unsubscribes recipient upon email.complained event', async () => {
    const email = 'complaint-test@wisehopper.dev';
    const sub = await newsletterService.subscribe(email, []);
    await newsletterService.confirmSubscription(sub.confirmation_token!);

    const payload = {
      type: 'email.complained',
      created_at: new Date().toISOString(),
      data: {
        email_id: 'em_456',
        to: [email],
      },
    };

    const req = new NextRequest('http://localhost:3000/api/webhooks/resend', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'content-type': 'application/json',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const updated = await newsletterService.getSubscriber(email);
    expect(updated?.status).toBe('unsubscribed');
  });

  it('accepts and logs email.delivered event without error', async () => {
    const payload = {
      type: 'email.delivered',
      created_at: new Date().toISOString(),
      data: {
        email_id: 'em_789',
        to: ['happy-reader@example.com'],
      },
    };

    const req = new NextRequest('http://localhost:3000/api/webhooks/resend', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'content-type': 'application/json',
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.event).toBe('email.delivered');
  });
});
