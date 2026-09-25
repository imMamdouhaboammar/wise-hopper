import { NextRequest, NextResponse } from 'next/server';
import { verifyOwnerSession } from '@/lib/auth/session';
import { newsletterService } from '@/lib/newsletter/instance';
import { MailerService } from '@/lib/newsletter/mailer';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const mailer = new MailerService();

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

      const html = `
        <div dir="rtl" style="font-family: 'IBM Plex Sans Arabic', sans-serif, system-ui; color: #242035; line-height: 1.8; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h1 style="color: #7054D4; font-size: 24px; margin-bottom: 20px;">${subject}</h1>
          <div style="font-size: 16px; margin-bottom: 32px; white-space: pre-wrap;">${body}</div>
          <hr style="border: none; border-top: 1px solid #E8E3F5; margin: 32px 0;" />
          <p style="font-size: 12px; color: #706B80;">
            تصلك هذه الرسالة لأنك مشترك في نشرة وايز هوبر البريدية.
            <br />
            <a href="${unsubLink}" style="color: #7054D4; text-decoration: underline;">إلغاء الاشتراك من هنا</a>
          </p>
        </div>
      `;

      const text = `${subject}\n\n${body}\n\n---\nلإلغاء الاشتراك: ${unsubLink}`;

      const sent = await mailer.send({
        to: sub.email,
        subject,
        html,
        text,
      });

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
