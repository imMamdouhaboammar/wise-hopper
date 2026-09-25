import { NextRequest, NextResponse } from 'next/server';
import { NewsletterService } from '@/lib/newsletter/subscriber-service';
import { MailerService } from '@/lib/newsletter/mailer';

// Persistent singleton for application runtime
const mailer = new MailerService();
export const newsletterService = new NewsletterService(mailer);

export async function POST(request: NextRequest) {
  try {
    let email = '';
    let topics: string[] = [];

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = body.email;
      topics = body.topics || [];
    } else {
      const formData = await request.formData();
      email = (formData.get('email') as string) || '';
      topics = formData.getAll('topics') as string[];
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    await newsletterService.subscribe(email, topics);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${siteUrl}/newsletter?pending_confirmation=true`, 303);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Subscription failed' }, { status: 500 });
  }
}
