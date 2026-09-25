import { NextRequest, NextResponse } from 'next/server';
import { resolveBillingAdapter } from '@/lib/billing/provider-factory';
import { applyBillingEvent } from '@/lib/billing/webhook-ledger';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get('x-signature') ||
      request.headers.get('x-hub-signature') ||
      request.headers.get('stripe-signature') ||
      request.headers.get('x-signature-sha256') ||
      '';

    const adapter = resolveBillingAdapter();
    const configuredSecret = process.env.BILLING_WEBHOOK_SECRET;

    if (adapter.providerName !== 'simulated' && !configuredSecret) {
      return NextResponse.json(
        { error: `Webhook secret is not configured for provider: ${adapter.providerName}` },
        { status: 500 },
      );
    }

    const secret = configuredSecret || 'local-simulated-webhook-secret-32-bytes-long';

    const isValid = adapter.verifyWebhookSignature(rawBody, signature, secret);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const event = adapter.parseWebhookPayload(rawBody);

    // Apply billing event idempotently BEFORE acknowledging webhook
    // providerName is typed as BillingProviderType on all adapters
    await applyBillingEvent(event, adapter.providerName);

    return NextResponse.json({
      received: true,
      eventId: event.eventId,
      eventType: event.eventType,
      status: 'committed',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    return NextResponse.json(
      { error: message },
      { status: 400 },
    );
  }
}
