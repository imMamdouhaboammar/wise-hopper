import crypto from 'crypto';
import type {
  PaymentProviderAdapter,
  CheckoutSessionInput,
  CheckoutSessionResult,
  BillingWebhookEvent,
  BillingProviderType,
} from './types';

export class SimulatedBillingProvider implements PaymentProviderAdapter {
  readonly providerName: BillingProviderType = 'simulated';

  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    const sessionId = `sim_sess_${crypto.randomBytes(12).toString('hex')}`;
    const url = new URL(input.redirectUrl);
    url.searchParams.set('session_id', sessionId);
    url.searchParams.set('plan', input.plan);
    url.searchParams.set('email', input.customerEmail);

    return {
      sessionId,
      checkoutUrl: url.toString(),
    };
  }

  generateSignature(payload: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload, 'utf8');
    return `sha256=${hmac.digest('hex')}`;
  }

  verifyWebhookSignature(rawBody: string, signatureHeader: string, secret: string): boolean {
    if (!signatureHeader || !secret) {
      return false;
    }

    try {
      const expectedSignature = this.generateSignature(rawBody, secret);
      const expectedBuffer = Buffer.from(expectedSignature);
      const receivedBuffer = Buffer.from(signatureHeader);

      if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    } catch {
      return false;
    }
  }

  parseWebhookPayload(rawBody: string): BillingWebhookEvent {
    const data = JSON.parse(rawBody);

    return {
      eventId: data.event_id || `evt_${crypto.randomBytes(8).toString('hex')}`,
      eventType: data.event_type || 'subscription_created',
      readerEmail: data.customer_email || '',
      readerId: data.reader_id,
      providerSubscriptionId: data.subscription_id || `sub_${crypto.randomBytes(8).toString('hex')}`,
      planType: (data.plan === 'annual' ? 'annual' : 'monthly') as 'monthly' | 'annual',
      currentPeriodEnd: data.period_end || new Date(Date.now() + 30 * 86400000).toISOString(),
      timestamp: data.timestamp || new Date().toISOString(),
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    // In simulated mode, return true if valid subscriptionId format
    return Boolean(subscriptionId && subscriptionId.length > 0);
  }
}
