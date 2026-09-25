import { NextRequest, NextResponse } from 'next/server';
import { newsletterService } from '@/lib/newsletter/instance';

export async function POST(request: NextRequest) {
  try {
    let email = '';
    let topics: string[] = [];

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = String(body?.email || '').trim();
      topics = Array.isArray(body?.topics) ? body.topics.map(String) : [];
    } else {
      const formData = await request.formData();
      email = formData.get('email')?.toString().trim() || '';
      topics = formData.getAll('topics').map((entry) => entry.toString());
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    await newsletterService.subscribe(email, topics);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${siteUrl}/newsletter?pending_confirmation=true`, 303);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Subscription failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
