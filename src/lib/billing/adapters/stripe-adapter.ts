import crypto from 'crypto';
import type {
  PaymentProviderAdapter,
  CheckoutSessionInput,
  CheckoutSessionResult,
  BillingWebhookEvent,
  BillingProviderType,
} from '../types';

export class StripeAdapter implements PaymentProviderAdapter {
  readonly providerName: BillingProviderType = 'stripe';

  async createCheckoutSession(_input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    const sessionId = `cs_test_${crypto.randomBytes(12).toString('hex')}`;
    const checkoutUrl = `https://checkout.stripe.com/c/pay/${sessionId}`;

    return {
      sessionId,
      checkoutUrl,
    };
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
    if (!signatureHeader || !secret) {
      return false;
    }

    try {
      // Parse Stripe signature header format: t=timestamp,v1=signature
      const parts = signatureHeader.split(',');
      const timestampPart = parts.find((p) => p.startsWith('t='));
      const signaturePart = parts.find((p) => p.startsWith('v1='));

      if (!timestampPart || !signaturePart) {
        return false;
      }

      const timestamp = timestampPart.substring(2);
      const signature = signaturePart.substring(3);
      const signedPayload = `${timestamp}.${rawBody}`;

      const hmac = crypto.createHmac('sha256', secret);
      const expectedSignature = hmac.update(signedPayload).digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature);
      const receivedBuffer = Buffer.from(signature);

      if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    } catch {
      return false;
    }
  }

  parseWebhookPayload(rawBody: string): BillingWebhookEvent {
    const event = JSON.parse(rawBody);
    const obj = event.data?.object || {};

    let eventType: BillingWebhookEvent['eventType'] = 'subscription_created';
    if (event.type === 'customer.subscription.updated') eventType = 'subscription_renewed';
    if (event.type === 'customer.subscription.deleted') eventType = 'subscription_canceled';
    if (event.type === 'charge.refunded') eventType = 'payment_refunded';

    const planInterval = obj.items?.data?.[0]?.plan?.interval;

    return {
      eventId: event.id || crypto.randomUUID(),
      eventType,
      readerEmail: obj.customer_email || '',
      readerId: obj.metadata?.reader_id,
      providerSubscriptionId: obj.id || '',
      planType: planInterval === 'year' ? 'annual' : 'monthly',
      currentPeriodEnd: obj.current_period_end
        ? new Date(obj.current_period_end * 1000).toISOString()
        : new Date(Date.now() + 30 * 86400000).toISOString(),
      timestamp: new Date(event.created * 1000).toISOString(),
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    return Boolean(subscriptionId);
  }
}
