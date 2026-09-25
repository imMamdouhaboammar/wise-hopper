import { NextRequest, NextResponse } from 'next/server';
import { newsletterService } from '@/lib/newsletter/instance';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/newsletter?error=missing_token`, 303);
  }

  const success = await newsletterService.confirmSubscription(token);
  if (!success) {
    return NextResponse.redirect(`${siteUrl}/newsletter?error=invalid_or_expired_token`, 303);
  }

  return NextResponse.redirect(`${siteUrl}/newsletter?confirmed=true`, 303);
}
