import { NextRequest, NextResponse } from 'next/server';
import { newsletterService } from '../subscribe/route';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get('email')?.toString().trim() || 'reader@example.com';
  const topics = formData.getAll('topics').map((entry) => entry.toString());

  await newsletterService.updateTopics(email, topics);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return NextResponse.redirect(`${siteUrl}/account?updated=true`, 303);
}
