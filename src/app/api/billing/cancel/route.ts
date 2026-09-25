import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return NextResponse.redirect(`${siteUrl}/account?canceled=true`, 303);
}
