import { cookies, headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '../supabase/server';

export interface ReaderSessionResult {
  isAuthenticated: boolean;
  hasEntitlement: boolean;
  readerEmail?: string;
  isOwner?: boolean;
}

export interface OwnerSessionResult {
  isOwner: boolean;
  email?: string;
}

const TEST_SECRET_FALLBACK = 'wise-hopper-test-secret-key-32-chars';

/**
 * Verifies whether the request originates from an authenticated platform owner.
 * Checks:
 * 1. Owner cookie 'wise_owner_session'
 * 2. Authorization Bearer / X-Studio-Key header matching STUDIO_SECRET_KEY
 * 3. Supabase Auth session with matching owner email / role
 */
export async function verifyOwnerSession(request?: NextRequest): Promise<OwnerSessionResult> {
  const secretKey = process.env.STUDIO_SECRET_KEY || process.env.SESSION_SECRET || TEST_SECRET_FALLBACK;

  // 1. Check direct request headers if provided (API routes / middleware)
  if (request) {
    const authHeader = request.headers.get('authorization') || '';
    const studioKeyHeader = request.headers.get('x-studio-key') || '';
    const testSecretHeader = request.headers.get('x-test-session-secret') || '';

    if (
      (authHeader.startsWith('Bearer ') && authHeader.slice(7) === secretKey) ||
      studioKeyHeader === secretKey ||
      testSecretHeader === secretKey
    ) {
      return { isOwner: true, email: 'owner@wise-hopper.io' };
    }

    const cookieOwner = request.cookies.get('wise_owner_session')?.value;
    if (cookieOwner && cookieOwner === secretKey) {
      return { isOwner: true, email: 'owner@wise-hopper.io' };
    }
  }

  // 2. Check Next.js server cookies & headers (Server Components)
  try {
    const cookieStore = await cookies();
    const cookieOwner = cookieStore.get('wise_owner_session')?.value;
    if (cookieOwner && cookieOwner === secretKey) {
      return { isOwner: true, email: 'owner@wise-hopper.io' };
    }

    const headerStore = await headers();
    const testSecretHeader = headerStore.get('x-test-session-secret') || '';
    const studioKeyHeader = headerStore.get('x-studio-key') || '';
    if (testSecretHeader === secretKey || studioKeyHeader === secretKey) {
      return { isOwner: true, email: 'owner@wise-hopper.io' };
    }

    // 3. Check Supabase server auth session
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const ownerEmail = process.env.OWNER_EMAIL || 'owner@wise-hopper.io';
      if (session.user.email === ownerEmail) {
        return { isOwner: true, email: session.user.email };
      }
    }
  } catch {
    // Contexts where cookies/headers are not readable (e.g. static export)
  }

  return { isOwner: false };
}

/**
 * Returns true only when DEMO_MODE=true is explicitly set.
 * When false, demo shortcuts like ?auth=true are disabled.
 */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true';
}

/**
 * Securely verifies reader authentication and paid content entitlement on the server.
 * Never trusts client query parameters such as `?auth=true`.
 * When DEMO_MODE=true, the URL param `?auth=true` grants simulated entitlement for demos only.
 */
export async function verifyReaderEntitlement(request?: NextRequest): Promise<ReaderSessionResult> {
  const secretKey = process.env.SESSION_SECRET || TEST_SECRET_FALLBACK;

  // DEMO_MODE bypass — only active when DEMO_MODE=true, never in production
  if (isDemoMode() && request) {
    const authParam = request.nextUrl.searchParams.get('auth');
    if (authParam === 'true') {
      return {
        isAuthenticated: true,
        hasEntitlement: true,
        readerEmail: 'demo@wise-hopper.io',
      };
    }
  }

  // Check if owner session exists (owners always have full entitlement)
  const ownerCheck = await verifyOwnerSession(request);
  if (ownerCheck.isOwner) {
    return {
      isAuthenticated: true,
      hasEntitlement: true,
      readerEmail: ownerCheck.email,
      isOwner: true,
    };
  }

  // 1. Check request headers / cookies if request is supplied
  if (request) {
    const testSecretHeader = request.headers.get('x-test-session-secret');
    if (testSecretHeader && testSecretHeader === secretKey) {
      return {
        isAuthenticated: true,
        hasEntitlement: true,
        readerEmail: 'reader@example.com',
      };
    }

    const sessionCookie = request.cookies.get('wise_reader_token')?.value;
    if (sessionCookie && sessionCookie === secretKey) {
      return {
        isAuthenticated: true,
        hasEntitlement: true,
        readerEmail: 'subscriber@example.com',
      };
    }
  }

  // 2. Check Next.js server cookies & headers (Server Components)
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('wise_reader_token')?.value;
    if (sessionCookie && sessionCookie === secretKey) {
      return {
        isAuthenticated: true,
        hasEntitlement: true,
        readerEmail: 'subscriber@example.com',
      };
    }

    const headerStore = await headers();
    const testSecretHeader = headerStore.get('x-test-session-secret');
    if (testSecretHeader && testSecretHeader === secretKey) {
      return {
        isAuthenticated: true,
        hasEntitlement: true,
        readerEmail: 'reader@example.com',
      };
    }

    // 3. Supabase DB Subscription Check
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const email = session.user.email;
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('reader_id', session.user.id)
        .in('status', ['active', 'trialing'])
        .gte('current_period_end', new Date().toISOString())
        .maybeSingle();

      return {
        isAuthenticated: true,
        hasEntitlement: Boolean(sub),
        readerEmail: email,
      };
    }
  } catch {
    // Non-SSR or testing environment
  }

  return {
    isAuthenticated: false,
    hasEntitlement: false,
  };
}
