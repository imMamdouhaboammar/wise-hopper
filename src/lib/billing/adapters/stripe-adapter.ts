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
  private secretKey: string | undefined;

  constructor(secretKey?: string) {
    this.secretKey = secretKey || process.env.STRIPE_SECRET_KEY;
  }

  async createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    const key = this.secretKey || process.env.STRIPE_SECRET_KEY;

    if (!key) {
      throw new Error(
        'STRIPE_SECRET_KEY is not configured. Real Stripe checkout sessions require a valid Stripe secret key. Set STRIPE_SECRET_KEY or switch BILLING_PROVIDER=simulated.'
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const isAnnual = input.plan === 'annual';
    const unitAmount = isAnnual ? '10000' : '1000'; // $100.00 vs $10.00
    const interval = isAnnual ? 'year' : 'month';
    const planName = isAnnual ? 'عضوية وايز هوبر السنوية (Wise Hopper Annual)' : 'عضوية وايز هوبر الشهرية (Wise Hopper Monthly)';

    const bodyParams = new URLSearchParams();
    bodyParams.append('mode', 'subscription');
    bodyParams.append('success_url', input.redirectUrl);
    bodyParams.append('cancel_url', `${siteUrl}/membership?canceled=true`);
    bodyParams.append('customer_email', input.customerEmail);
    bodyParams.append('line_items[0][price_data][currency]', 'usd');
    bodyParams.append('line_items[0][price_data][product_data][name]', planName);
    bodyParams.append('line_items[0][price_data][unit_amount]', unitAmount);
    bodyParams.append('line_items[0][price_data][recurring][interval]', interval);
    bodyParams.append('line_items[0][quantity]', '1');

    if (input.readerId) {
      bodyParams.append('client_reference_id', input.readerId);
      bodyParams.append('metadata[reader_id]', input.readerId);
    }
    bodyParams.append('metadata[plan_type]', input.plan);

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams.toString(),
    });

    const data = await response.json();

    if (!response.ok || !data.id || !data.url) {
      const errMsg = data.error?.message || 'Failed to create Stripe Checkout session';
      throw new Error(`Stripe API error: ${errMsg}`);
    }

    return {
      sessionId: String(data.id),
      checkoutUrl: String(data.url),
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
      const signatureBuffer = Buffer.from(signature);

      if (expectedBuffer.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch {
      return false;
    }
  }

  parseWebhookPayload(rawBody: string): BillingWebhookEvent {
    const data = JSON.parse(rawBody);
    const object = data.data?.object || {};

    const eventId = String(data.id || `evt_${crypto.randomBytes(8).toString('hex')}`);
    let eventType: BillingWebhookEvent['eventType'] = 'subscription_created';

    if (data.type === 'customer.subscription.deleted') {
      eventType = 'subscription_canceled';
    } else if (data.type === 'invoice.payment_succeeded') {
      eventType = 'subscription_renewed';
    } else if (data.type === 'charge.refunded') {
      eventType = 'payment_refunded';
    }

    const currentPeriodEnd = object.current_period_end
      ? new Date(Number(object.current_period_end) * 1000).toISOString()
      : new Date(Date.now() + 30 * 86400000).toISOString();

    const planType = object.metadata?.plan_type === 'annual' ? 'annual' : 'monthly';

    return {
      eventId,
      eventType,
      readerEmail: String(object.customer_email || object.customer_details?.email || ''),
      readerId: object.metadata?.reader_id ? String(object.metadata.reader_id) : undefined,
      providerSubscriptionId: String(object.subscription || object.id || `sub_${crypto.randomBytes(8).toString('hex')}`),
      planType,
      currentPeriodEnd,
      timestamp: data.created ? new Date(Number(data.created) * 1000).toISOString() : new Date().toISOString(),
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<boolean> {
    const key = this.secretKey || process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured. Real Stripe subscription cancellation requires a valid Stripe secret key.');
    }
    try {
      const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${key}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
