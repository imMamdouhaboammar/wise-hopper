import { describe, it, expect } from 'vitest';
import { SimulatedBillingProvider } from './simulated-provider';
import { LemonSqueezyAdapter } from './adapters/lemonsqueezy-adapter';
import { PaymobAdapter } from './adapters/paymob-adapter';
import { StripeAdapter } from './adapters/stripe-adapter';
import { resolveBillingAdapter } from './provider-factory';

describe('Pluggable Billing Subsystem (Fable TDD)', () => {
  const secretKey = 'test-secret-key-for-hmac-verification-32chars';
  const provider = new SimulatedBillingProvider();

  describe('Simulated Provider Checkout Session', () => {
    it('creates a deterministic checkout session URL with session ID', async () => {
      const result = await provider.createCheckoutSession({
        plan: 'annual',
        customerEmail: 'reader@example.com',
        redirectUrl: 'http://localhost:3000/membership/success',
      });

      expect(result.sessionId).toBeDefined();
      expect(result.sessionId.startsWith('sim_sess_')).toBe(true);
      expect(result.checkoutUrl).toContain(result.sessionId);
    });
  });

  describe('HMAC Signature Verification & Security', () => {
    it('validates authentic webhook payloads with correct HMAC signature', () => {
      const rawPayload = JSON.stringify({
        event_id: 'evt_123',
        event_type: 'subscription_created',
        customer_email: 'subscriber@example.com',
        subscription_id: 'sub_sim_999',
        plan: 'monthly',
        period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
      });

      const signature = provider.generateSignature(rawPayload, secretKey);
      const isValid = provider.verifyWebhookSignature(rawPayload, signature, secretKey);
      expect(isValid).toBe(true);
    });

    it('rejects tampered webhook payloads', () => {
      const originalPayload = JSON.stringify({ amount: 100 });
      const tamperedPayload = JSON.stringify({ amount: 1000 });
      const signature = provider.generateSignature(originalPayload, secretKey);

      const isValid = provider.verifyWebhookSignature(tamperedPayload, signature, secretKey);
      expect(isValid).toBe(false);
    });

    it('rejects forged signatures', () => {
      const payload = JSON.stringify({ id: 1 });
      const fakeSignature = 'sha256=invalidfakesignaturehex';
      const isValid = provider.verifyWebhookSignature(payload, fakeSignature, secretKey);
      expect(isValid).toBe(false);
    });
  });

  describe('Webhook Event Parsing & Lifecycle', () => {
    it('parses subscription_created event cleanly into normalized domain event', () => {
      const nowIso = new Date().toISOString();
      const rawPayload = JSON.stringify({
        event_id: 'evt_sub_01',
        event_type: 'subscription_created',
        customer_email: 'reader@domain.com',
        subscription_id: 'sub_12345',
        plan: 'annual',
        period_end: nowIso,
        timestamp: nowIso,
      });

      const event = provider.parseWebhookPayload(rawPayload);
      expect(event.eventType).toBe('subscription_created');
      expect(event.readerEmail).toBe('reader@domain.com');
      expect(event.providerSubscriptionId).toBe('sub_12345');
      expect(event.planType).toBe('annual');
    });

    it('parses subscription_canceled event cleanly', () => {
      const rawPayload = JSON.stringify({
        event_id: 'evt_sub_02',
        event_type: 'subscription_canceled',
        customer_email: 'reader@domain.com',
        subscription_id: 'sub_12345',
        plan: 'monthly',
        period_end: new Date().toISOString(),
        timestamp: new Date().toISOString(),
      });

      const event = provider.parseWebhookPayload(rawPayload);
      expect(event.eventType).toBe('subscription_canceled');
      expect(event.providerSubscriptionId).toBe('sub_12345');
    });
  });

  describe('Provider Factory & Pluggable Connectors', () => {
    it('instantiates the configured provider adapter properly', () => {
      const sim = resolveBillingAdapter('simulated');
      expect(sim.providerName).toBe('simulated');

      const lemon = resolveBillingAdapter('lemonsqueezy');
      expect(lemon.providerName).toBe('lemonsqueezy');
      expect(lemon instanceof LemonSqueezyAdapter).toBe(true);

      const paymob = resolveBillingAdapter('paymob');
      expect(paymob.providerName).toBe('paymob');
      expect(paymob instanceof PaymobAdapter).toBe(true);

      const stripe = resolveBillingAdapter('stripe');
      expect(stripe.providerName).toBe('stripe');
      expect(stripe instanceof StripeAdapter).toBe(true);
    });

    it('requires STRIPE_SECRET_KEY when creating Stripe checkout session', async () => {
      const stripe = new StripeAdapter(undefined);
      await expect(
        stripe.createCheckoutSession({
          plan: 'annual',
          customerEmail: 'reader@example.com',
          redirectUrl: 'http://localhost:3000/membership/success',
        })
      ).rejects.toThrow('STRIPE_SECRET_KEY is not configured');
    });

    it('parses Stripe webhook payloads accurately', () => {
      const stripe = new StripeAdapter('sk_test_mock');
      const stripePayload = JSON.stringify({
        id: 'evt_stripe_999',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_stripe_real_123',
            customer_email: 'subscriber@example.com',
            current_period_end: Math.floor(Date.now() / 1000) + 86400,
            metadata: { plan_type: 'annual' },
          },
        },
        created: Math.floor(Date.now() / 1000),
      });

      const parsed = stripe.parseWebhookPayload(stripePayload);
      expect(parsed.eventId).toBe('evt_stripe_999');
      expect(parsed.eventType).toBe('subscription_canceled');
      expect(parsed.providerSubscriptionId).toBe('sub_stripe_real_123');
      expect(parsed.readerEmail).toBe('subscriber@example.com');
      expect(parsed.planType).toBe('annual');
    });
  });
});
