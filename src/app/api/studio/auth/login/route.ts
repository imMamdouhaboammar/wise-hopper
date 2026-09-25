import { NextRequest, NextResponse } from 'next/server';
import { getValidStudioSecret, timingSafeEqualString } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const secretKey = getValidStudioSecret();

  // Determine request content type (JSON or Form Data)
  const contentType = request.headers.get('content-type') || '';
  const isFormSubmission =
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data');

  let candidateKey = '';
  let redirectTarget = '/studio';

  try {
    if (isFormSubmission) {
      const formData = await request.formData();
      candidateKey = String(formData.get('secretKey') || formData.get('studio_key') || '').trim();
      const customRedirect = String(formData.get('redirect') || '').trim();
      if (customRedirect.startsWith('/')) {
        redirectTarget = customRedirect;
      }
    } else {
      const json = await request.json();
      candidateKey = String(json.secretKey || json.studio_key || '').trim();
      const customRedirect = String(json.redirect || '').trim();
      if (customRedirect.startsWith('/')) {
        redirectTarget = customRedirect;
      }
    }
  } catch {
    if (isFormSubmission) {
      const errorUrl = new URL('/account', request.url);
      errorUrl.searchParams.set('error', 'invalid_request');
      return NextResponse.redirect(errorUrl, 303);
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Prevent redirect loops
  if (redirectTarget === '/studio/login') {
    redirectTarget = '/studio';
  }

  // 1. Fail closed if STUDIO_SECRET_KEY is not configured or shorter than 32 characters
  if (!secretKey) {
    if (isFormSubmission) {
      const errorUrl = new URL('/account', request.url);
      errorUrl.searchParams.set('error', 'server_misconfigured');
      errorUrl.searchParams.set('redirect', redirectTarget);
      return NextResponse.redirect(errorUrl, 303);
    }
    return NextResponse.json(
      {
        error: 'server_misconfigured',
        message: 'مفتاح STUDIO_SECRET_KEY غير معرّف في بيئة الخادم أو يقل عن 32 حرفاً.',
      },
      { status: 503 }
    );
  }

  // 2. Validate user-provided key
  if (!candidateKey || !timingSafeEqualString(candidateKey, secretKey)) {
    if (isFormSubmission) {
      const errorUrl = new URL('/account', request.url);
      errorUrl.searchParams.set('error', 'invalid_credentials');
      errorUrl.searchParams.set('redirect', redirectTarget);
      return NextResponse.redirect(errorUrl, 303);
    }
    return NextResponse.json(
      {
        error: 'invalid_credentials',
        message: 'المفتاح السري المدخل غير صحيح.',
      },
      { status: 401 }
    );
  }

  // 3. Set cookie and redirect or return success
  const targetUrl = new URL(redirectTarget, request.url);
  const response = isFormSubmission
    ? NextResponse.redirect(targetUrl, 303)
    : NextResponse.json({ success: true, redirect: redirectTarget });

  response.cookies.set({
    name: 'wise_owner_session',
    value: secretKey,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
