import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getValidStudioSecret, timingSafeEqualString } from './lib/auth/session';

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL('/account', request.url);
  loginUrl.searchParams.set('error', 'unauthorized_studio');
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /studio routes from unauthenticated access
  if (pathname.startsWith('/studio')) {
    const secretKey = getValidStudioSecret();

    // Fail closed if STUDIO_SECRET_KEY is unset or shorter than 32 characters
    if (!secretKey) {
      return redirectToLogin(request, pathname);
    }

    const authHeader = request.headers.get('authorization') || '';
    const studioKeyHeader = request.headers.get('x-studio-key') || '';
    const cookieOwner = request.cookies.get('wise_owner_session')?.value || '';

    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    const isAuthorized =
      (bearerToken.length > 0 && timingSafeEqualString(bearerToken, secretKey)) ||
      (studioKeyHeader.length > 0 && timingSafeEqualString(studioKeyHeader, secretKey)) ||
      (cookieOwner.length > 0 && timingSafeEqualString(cookieOwner, secretKey));

    if (!isAuthorized) {
      return redirectToLogin(request, pathname);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/studio/:path*'],
};
