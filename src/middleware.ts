import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const TEST_SECRET_FALLBACK = 'wise-hopper-test-secret-key-32-chars';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /studio routes from unauthenticated access
  if (pathname.startsWith('/studio')) {
    const secretKey = process.env.STUDIO_SECRET_KEY || process.env.SESSION_SECRET || TEST_SECRET_FALLBACK;
    const authHeader = request.headers.get('authorization') || '';
    const studioKeyHeader = request.headers.get('x-studio-key') || '';
    const testSecretHeader = request.headers.get('x-test-session-secret') || '';
    const cookieOwner = request.cookies.get('wise_owner_session')?.value;

    const isAuthorized =
      (authHeader.startsWith('Bearer ') && authHeader.slice(7) === secretKey) ||
      studioKeyHeader === secretKey ||
      testSecretHeader === secretKey ||
      cookieOwner === secretKey;

    if (!isAuthorized) {
      const loginUrl = new URL('/account', request.url);
      loginUrl.searchParams.set('error', 'unauthorized_studio');
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/studio/:path*'],
};
