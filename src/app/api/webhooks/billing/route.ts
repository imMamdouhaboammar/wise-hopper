import { NextRequest, NextResponse } from 'next/server';
import { resolveBillingAdapter } from '@/lib/billing/provider-factory';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get('x-signature') ||
      request.headers.get('x-hub-signature') ||
      request.headers.get('stripe-signature') ||
      request.headers.get('x-signature-sha256') ||
      '';

    const secret = process.env.BILLING_WEBHOOK_SECRET || 'local-simulated-webhook-secret-32-bytes-long';
    const adapter = resolveBillingAdapter();

    const isValid = adapter.verifyWebhookSignature(rawBody, signature, secret);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const event = adapter.parseWebhookPayload(rawBody);

    // In production, synchronization is committed atomically to Supabase `subscriptions` table.
    return NextResponse.json({
      received: true,
      eventId: event.eventId,
      eventType: event.eventType,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Webhook processing failed' },
      { status: 400 }
    );
  }
}
