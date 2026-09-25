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

const MINIMUM_SECRET_LENGTH = 32;

/**
 * Constant-time string comparison to prevent timing side-channel attacks.
 * Operates across Node.js, Bun, and Edge runtime environments.
 */
export function timingSafeEqualString(a: string, b: string): boolean {
  const aLen = a.length;
  const bLen = b.length;
  let diff = aLen ^ bLen;
  const maxLen = Math.max(aLen, bLen);
  for (let i = 0; i < maxLen; i++) {
    const codeA = i < aLen ? a.charCodeAt(i) : 0;
    const codeB = i < bLen ? b.charCodeAt(i) : 0;
    diff |= codeA ^ codeB;
  }
  return diff === 0;
}

/**
 * Retrieves the studio secret key only if configured and meeting minimum length.
 * Fails closed if missing or shorter than 32 characters.
 */
export function getValidStudioSecret(): string | null {
  const secret = process.env.STUDIO_SECRET_KEY;
  if (!secret || secret.length < MINIMUM_SECRET_LENGTH) {
    return null;
  }
  return secret;
}

function extractBearerToken(authHeader: string | null): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return '';
  }
  return authHeader.slice(7);
}

function matchesSecretKey(candidate: string | null | undefined, secretKey: string): boolean {
  if (!candidate) {
    return false;
  }
  return timingSafeEqualString(candidate, secretKey);
}

/**
 * Verifies whether the request originates from an authenticated platform owner.
 * Fails closed if STUDIO_SECRET_KEY is unset or shorter than 32 characters.
 */
export async function verifyOwnerSession(request?: NextRequest): Promise<OwnerSessionResult> {
  const secretKey = getValidStudioSecret();

  // 1. Direct request check (API routes / Middleware)
  if (request && secretKey) {
    const bearer = extractBearerToken(request.headers.get('authorization'));
    const studioKey = request.headers.get('x-studio-key');
    const cookie = request.cookies.get('wise_owner_session')?.value;

    if (
      matchesSecretKey(bearer, secretKey) ||
      matchesSecretKey(studioKey, secretKey) ||
      matchesSecretKey(cookie, secretKey)
    ) {
      return { isOwner: true, email: 'owner@wise-hopper.io' };
    }
  }

  // 2. Next.js server headers & cookies (Server Components / Server Actions)
  try {
    if (secretKey) {
      const cookieStore = await cookies();
      const cookieVal = cookieStore.get('wise_owner_session')?.value;
      if (matchesSecretKey(cookieVal, secretKey)) {
        return { isOwner: true, email: 'owner@wise-hopper.io' };
      }

      const headerStore = await headers();
      const studioKeyVal = headerStore.get('x-studio-key');
      const bearerVal = extractBearerToken(headerStore.get('authorization'));
      if (matchesSecretKey(studioKeyVal, secretKey) || matchesSecretKey(bearerVal, secretKey)) {
        return { isOwner: true, email: 'owner@wise-hopper.io' };
      }
    }

    // 3. Supabase Auth session via getUser() (validates token with Supabase auth server)
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const ownerEmail = process.env.OWNER_EMAIL || 'owner@wise-hopper.io';
      if (user.email === ownerEmail) {
        return { isOwner: true, email: user.email };
      }
    }
  } catch {
    // Non-SSR or testing environments without Supabase client
  }

  return { isOwner: false };
}

/**
 * Returns true only when DEMO_MODE=true is explicitly set.
 */
export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === 'true';
}

/**
 * Securely verifies reader authentication and paid content entitlement on the server.
 * In POC, entitlement comes only from DEMO ?auth=true or Supabase subscriptions.
 */
export async function verifyReaderEntitlement(request?: NextRequest): Promise<ReaderSessionResult> {
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

  // Supabase DB Subscription Check via authenticated user
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const email = user.email;
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('reader_id', user.id)
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
