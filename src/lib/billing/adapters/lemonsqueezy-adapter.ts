import crypto from 'crypto';
import type {
  PaymentProviderAdapter,
  CheckoutSessionInput,
  CheckoutSessionResult,
  BillingWebhookEvent,
  BillingProviderType,
} from '../types';

export class LemonSqueezyAdapter implements PaymentProviderAdapter {
  readonly providerName: BillingProviderType = 'lemonsqueezy';

  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    const storeId = process.env.LEMONSQUEEZY_STORE_ID || 'dummy_store';
    const variantId =
      input.plan === 'annual'
        ? process.env.LEMONSQUEEZY_ANNUAL_VARIANT_ID || 'var_annual'
        : process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID || 'var_monthly';

    const sessionId = `lsq_sess_${crypto.randomBytes(8).toString('hex')}`;
    const checkoutUrl = `https://${storeId}.lemonsqueezy.com/buy/${variantId}?checkout[email]=${encodeURIComponent(
      input.customerEmail
    )}&checkout[custom][reader_id]=${input.readerId || ''}&checkout[custom][session_id]=${sessionId}`;

    return {
      sessionId,
      checkoutUrl,
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
    if (!signature || !secret) {
      return false;
    }

    try {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
      const signatureBuffer = Buffer.from(signature, 'utf8');

      if (digest.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(digest, signatureBuffer);
    } catch {
      return false;
    }
  }

  parseWebhookPayload(rawBody: string): BillingWebhookEvent {
    const payload = JSON.parse(rawBody);
    const eventName = payload.meta?.event_name;
    const attributes = payload.data?.attributes;

    let eventType: BillingWebhookEvent['eventType'] = 'subscription_created';
    if (eventName === 'subscription_updated') eventType = 'subscription_renewed';
    if (eventName === 'subscription_cancelled') eventType = 'subscription_canceled';
    if (eventName === 'subscription_expired') eventType = 'subscription_expired';
    if (eventName === 'subscription_payment_refunded') eventType = 'payment_refunded';

    return {
      eventId: String(payload.meta?.webhook_id || crypto.randomUUID()),
      eventType,
      readerEmail: attributes?.user_email || '',
      readerId: payload.meta?.custom_data?.reader_id,
      providerSubscriptionId: String(payload.data?.id || ''),
      planType: (payload.meta?.custom_data?.plan === 'annual' ? 'annual' : 'monthly'),
      currentPeriodEnd: attributes?.renews_at || new Date(Date.now() + 30 * 86400000).toISOString(),
      timestamp: payload.meta?.created_at || new Date().toISOString(),
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    return Boolean(subscriptionId);
  }
}
