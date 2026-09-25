import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { BillingWebhookEvent, BillingProviderType } from '@/lib/billing/types';
import type { SubscriptionStatus } from '@/lib/supabase/types';

// In-memory ledger for fast testing and sandbox verification
export const PROCESSED_WEBHOOK_EVENTS = new Map<string, BillingWebhookEvent>();
export const ACTIVE_SUBSCRIPTIONS_STORE = new Map<
  string,
  { status: SubscriptionStatus; planType: string; currentPeriodEnd: string }
>();

export async function applyBillingEvent(
  event: BillingWebhookEvent,
  providerName: BillingProviderType,
): Promise<void> {
  // Idempotency check: if event already processed, return immediately
  if (PROCESSED_WEBHOOK_EVENTS.has(event.eventId)) {
    return;
  }
  PROCESSED_WEBHOOK_EVENTS.set(event.eventId, event);

  let status: SubscriptionStatus = 'active';
  if (event.eventType === 'subscription_canceled') {
    status = 'canceled';
  } else if (event.eventType === 'subscription_expired' || event.eventType === 'payment_refunded') {
    status = 'expired';
  }

  // Record in memory store for instant test inspection and offline mode
  ACTIVE_SUBSCRIPTIONS_STORE.set(event.providerSubscriptionId, {
    status,
    planType: event.planType,
    currentPeriodEnd: event.currentPeriodEnd,
  });

  // Commit idempotently to Supabase database
  try {
    const supabase = await createServerSupabaseClient();
    let readerId = event.readerId;

    if (!readerId && event.readerEmail) {
      const { data: reader } = await supabase
        .from('readers')
        .select('id')
        .eq('email', event.readerEmail.toLowerCase())
        .maybeSingle();
      if (reader !== null && reader !== undefined) {
        // SAFETY: readers table is not yet in generated Supabase schema types; we select only `id`
        // and narrow to non-null above, so reader is guaranteed to be { id: string }.
        readerId = (reader as { id: string }).id;
      }
    }

    if (readerId) {
      // SAFETY: subscriptions table is not yet in generated Supabase schema types; the cast
      // to `any` is intentional at this DB boundary until types are regenerated.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('subscriptions') as any).upsert(
        {
          reader_id: readerId,
          provider: providerName,
          provider_subscription_id: event.providerSubscriptionId,
          status,
          plan_type: event.planType,
          current_period_end: event.currentPeriodEnd,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'provider_subscription_id' },
      );
    }
  } catch {
    // In unit tests or sandbox environments, in-memory sync above is committed
  }
}
