import crypto from 'crypto';
import type {
  PaymentProviderAdapter,
  CheckoutSessionInput,
  CheckoutSessionResult,
  BillingWebhookEvent,
  BillingProviderType,
} from '../types';

export class PaymobAdapter implements PaymentProviderAdapter {
  readonly providerName: BillingProviderType = 'paymob';

  async createCheckoutSession(_input: CheckoutSessionInput): Promise<CheckoutSessionResult> {
    throw new Error('NotImplemented in POC: Paymob checkout is deferred to production backlog');
  }

  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
    if (!signature || !secret) {
      return false;
    }

    try {
      const payload = JSON.parse(rawBody);
      const obj = payload.obj || payload;

      // Paymob HMAC concatenation pattern
      const concatenated = [
        obj.amount_cents,
        obj.created_at,
        obj.currency,
        obj.error_occured,
        obj.has_parent_transaction,
        obj.id,
        obj.integration_id,
        obj.is_3d_secure,
        obj.is_auth,
        obj.is_capture,
        obj.is_refunded,
        obj.is_standalone_payment,
        obj.is_voided,
        obj.order?.id,
        obj.owner,
        obj.pending,
        obj.source_data?.pan,
        obj.source_data?.sub_type,
        obj.source_data?.type,
        obj.success,
      ].join('');

      const calculatedHmac = crypto.createHmac('sha512', secret).update(concatenated).digest('hex');
      return calculatedHmac.toLowerCase() === signature.toLowerCase();
    } catch {
      return false;
    }
  }

  parseWebhookPayload(rawBody: string): BillingWebhookEvent {
    const payload = JSON.parse(rawBody);
    const obj = payload.obj || payload;

    const isSuccess = obj.success === true;
    const isRefund = obj.is_refunded === true;

    let eventType: BillingWebhookEvent['eventType'] = isSuccess
      ? 'subscription_created'
      : 'subscription_canceled';

    if (isRefund) {
      eventType = 'payment_refunded';
    }

    return {
      eventId: String(obj.id || crypto.randomUUID()),
      eventType,
      readerEmail: obj.order?.shipping_data?.email || obj.customer?.email || '',
      readerId: obj.order?.merchant_order_id,
      providerSubscriptionId: String(obj.order?.id || obj.id || ''),
      planType: 'monthly',
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      timestamp: obj.created_at || new Date().toISOString(),
    };
  }

  async cancelSubscription(_subscriptionId: string): Promise<boolean> {
    throw new Error('NotImplemented in POC: Paymob subscription cancellation is deferred to production backlog');
  }
}
