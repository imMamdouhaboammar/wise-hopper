/**
 * Billing Domain Types and Contracts
 */

export type PlanDuration = 'monthly' | 'annual';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired';

export type BillingProviderType = 'simulated' | 'lemonsqueezy' | 'paymob' | 'stripe';

export interface CheckoutSessionInput {
  plan: PlanDuration;
  customerEmail: string;
  readerId?: string;
  redirectUrl: string;
}

export interface CheckoutSessionResult {
  checkoutUrl: string;
  sessionId: string;
}

export type WebhookEventType =
  | 'subscription_created'
  | 'subscription_renewed'
  | 'subscription_canceled'
  | 'subscription_expired'
  | 'payment_refunded';

export interface BillingWebhookEvent {
  eventId: string;
  eventType: WebhookEventType;
  readerEmail: string;
  readerId?: string;
  providerSubscriptionId: string;
  planType: PlanDuration;
  currentPeriodEnd: string;
  timestamp: string;
}

export interface PaymentProviderAdapter {
  readonly providerName: BillingProviderType;
  createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult>;
  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean;
  parseWebhookPayload(rawBody: string): BillingWebhookEvent;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
}
