import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return handleLogout(request);
}

export async function GET(request: NextRequest) {
  return handleLogout(request);
}

function handleLogout(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';
  const isFormOrBrowser =
    request.method === 'GET' ||
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data');

  const redirectUrl = new URL('/account', request.url);
  redirectUrl.searchParams.set('logged_out', 'true');

  const response = isFormOrBrowser
    ? NextResponse.redirect(redirectUrl, 303)
    : NextResponse.json({ success: true });

  response.cookies.set({
    name: 'wise_owner_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
