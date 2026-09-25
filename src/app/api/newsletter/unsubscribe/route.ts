import { NextRequest, NextResponse } from 'next/server';
import { newsletterService } from '@/lib/newsletter/instance';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (!token || token.trim().length === 0) {
    return NextResponse.json(
      { error: 'Valid subscriber token required to unsubscribe' },
      { status: 400 }
    );
  }

  const success = await newsletterService.unsubscribeByToken(token);
  if (!success) {
    return NextResponse.json(
      { error: 'Invalid or expired unsubscribe token' },
      { status: 404 }
    );
  }

  return NextResponse.redirect(`${siteUrl}/newsletter?unsubscribed=true`, 303);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  const token = formData?.get('token')?.toString() || request.nextUrl.searchParams.get('token');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (!token || token.trim().length === 0) {
    return NextResponse.json(
      { error: 'Valid subscriber token required to unsubscribe' },
      { status: 400 }
    );
  }

  const success = await newsletterService.unsubscribeByToken(token);
  if (!success) {
    return NextResponse.json(
      { error: 'Invalid or expired unsubscribe token' },
      { status: 404 }
    );
  }

  return NextResponse.redirect(`${siteUrl}/newsletter?unsubscribed=true`, 303);
}
