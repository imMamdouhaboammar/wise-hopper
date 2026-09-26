import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerSession } from '@/lib/auth/session';
import { mailer, newsletterService } from '@/lib/newsletter/instance';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  // 1. Verify owner authorization
  const session = await verifyOwnerSession(request);
  if (!session.isOwner) {
    return NextResponse.json({ error: 'Unauthorized: Studio access required' }, { status: 401 });
  }

  try {
    let subject = '';
    let segment = 'all';
    let body = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await request.json();
      subject = String(json.subject || '').trim();
      segment = String(json.segment || 'all').trim();
      body = String(json.body || '').trim();
    } else {
      const formData = await request.formData();
      subject = formData.get('subject')?.toString().trim() || '';
      segment = formData.get('segment')?.toString().trim() || 'all';
      body = formData.get('body')?.toString().trim() || '';
    }

    if (!subject || !body) {
      return NextResponse.json(
        { error: 'Missing required campaign fields: subject and body' },
        { status: 400 }
      );
    }

    // 2. Fetch active subscribers
    const activeSubscribers = await newsletterService.getActiveSubscribers();

    // 3. Dispatch emails
    let sentCount = 0;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    for (const sub of activeSubscribers) {
      const unsubLink = sub.unsubscribe_token
        ? `${siteUrl}/api/newsletter/unsubscribe?token=${sub.unsubscribe_token}`
        : `${siteUrl}/newsletter`;

      const sent = await mailer.sendCampaignEmail(sub.email, subject, body, unsubLink);

      if (sent) {
        sentCount++;
      }
    }

    // 4. Record campaign in Supabase newsletter_campaigns
    try {
      const supabase = await createServerSupabaseClient();
      // SAFETY: newsletter_campaigns is a runtime table not yet in the generated schema types;
      // the cast to `any` is intentional at this DB boundary until types are regenerated.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('newsletter_campaigns') as any).insert({
        id: crypto.randomUUID(),
        subject,
        body_text: body,
        sent_at: new Date().toISOString(),
      });
    } catch {
      // In-memory or offline fallback
    }

    if (!contentType.includes('application/json')) {
      return NextResponse.redirect(`${siteUrl}/studio/newsletter?sent=true&count=${sentCount}`, 303);
    }

    return NextResponse.json({
      success: true,
      subject,
      segment,
      sentCount,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Campaign dispatch failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
