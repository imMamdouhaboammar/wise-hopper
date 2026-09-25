import type { BillingProviderType, PaymentProviderAdapter } from './types';
import { SimulatedBillingProvider } from './simulated-provider';
import { LemonSqueezyAdapter } from './adapters/lemonsqueezy-adapter';
import { PaymobAdapter } from './adapters/paymob-adapter';
import { StripeAdapter } from './adapters/stripe-adapter';

export function resolveBillingAdapter(providerName?: BillingProviderType | string): PaymentProviderAdapter {
  const chosen = (providerName || process.env.BILLING_PROVIDER || 'simulated').toLowerCase();

  switch (chosen) {
    case 'lemonsqueezy':
      return new LemonSqueezyAdapter();
    case 'paymob':
      return new PaymobAdapter();
    case 'stripe':
      return new StripeAdapter();
    case 'simulated':
    default:
      return new SimulatedBillingProvider();
  }
}
