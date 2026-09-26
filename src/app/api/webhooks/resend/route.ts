import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { newsletterService } from '@/lib/newsletter/instance';

interface ResendWebhookEmailData {
  email_id?: string;
  from?: string;
  to?: string[];
  subject?: string;
  bounce?: {
    message?: string;
    type?: string;
    subType?: string;
  };
}

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: ResendWebhookEmailData;
}

function parseResendWebhookPayload(rawBody: string): ResendWebhookPayload {
  // SAFETY: JSON.parse parses untrusted raw string to structural payload with fallback defaults
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsed = JSON.parse(rawBody) as any;
  return {
    type: String(parsed?.type || ''),
    created_at: String(parsed?.created_at || new Date().toISOString()),
    data: parsed?.data || {},
  };
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    const id = req.headers.get('svix-id') || req.headers.get('webhook-id') || '';
    const timestamp = req.headers.get('svix-timestamp') || req.headers.get('webhook-timestamp') || '';
    const signature = req.headers.get('svix-signature') || req.headers.get('webhook-signature') || '';

    let payload: ResendWebhookPayload;

    if (webhookSecret) {
      if (!id || !timestamp || !signature) {
        return NextResponse.json(
          { error: 'Missing Svix webhook signature headers' },
          { status: 400 }
        );
      }

      const resend = new Resend(process.env.RESEND_API_KEY || 're_mock');
      try {
        resend.webhooks.verify({
          payload: rawBody,
          headers: {
            id,
            timestamp,
            signature,
          },
          webhookSecret,
        });
        payload = parseResendWebhookPayload(rawBody);
      } catch (err) {
        console.error('[Resend Webhook Verification Failed]', err);
        return NextResponse.json(
          { error: 'Invalid webhook signature' },
          { status: 400 }
        );
      }
    } else {
      // In development or when webhook secret is not yet configured, parse payload directly
      try {
        payload = parseResendWebhookPayload(rawBody);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }
    }

    if (!payload.type) {
      return NextResponse.json({ error: 'Malformed webhook event: missing type' }, { status: 400 });
    }

    const recipients = Array.isArray(payload.data?.to) ? payload.data.to : [];

    switch (payload.type) {
      case 'email.bounced': {
        const bounceType = payload.data?.bounce?.type || 'Permanent';
        console.warn(`[Resend Webhook] Email bounced (${bounceType}) for recipients:`, recipients);

        // Immediately deactivate bounced emails to protect domain reputation
        for (const email of recipients) {
          if (email) {
            await newsletterService.unsubscribe(email);
          }
        }
        break;
      }

      case 'email.complained': {
        console.warn('[Resend Webhook] Spam complaint received for recipients:', recipients);

        // Immediately suppress complainant
        for (const email of recipients) {
          if (email) {
            await newsletterService.unsubscribe(email);
          }
        }
        break;
      }

      case 'email.delivered': {
        console.info('[Resend Webhook] Email successfully delivered to:', recipients);
        break;
      }

      case 'email.opened':
      case 'email.clicked': {
        console.info(`[Resend Webhook] Engagement event: ${payload.type} for:`, recipients);
        break;
      }

      default:
        console.info(`[Resend Webhook] Unhandled event type: ${payload.type}`);
        break;
    }

    return NextResponse.json({ received: true, event: payload.type }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook handling failed';
    console.error('[Resend Webhook Error]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
