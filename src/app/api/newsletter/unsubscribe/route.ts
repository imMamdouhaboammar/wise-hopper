import { NextRequest, NextResponse } from 'next/server';
import { newsletterService } from '../subscribe/route';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (email) {
    await newsletterService.unsubscribe(email);
  }

  return NextResponse.redirect(`${siteUrl}/newsletter?unsubscribed=true`, 303);
}
