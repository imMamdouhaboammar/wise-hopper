import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { verifyOwnerSession, timingSafeEqualString } from './session';
import { middleware } from '../../middleware';
import { POST as studioPublishRouteHandler } from '../../app/api/studio/publish/route';

describe('Phase 0: Studio Owner Security & Fail-Closed Guard (Fable TDD)', () => {
  const originalStudioSecret = process.env.STUDIO_SECRET_KEY;
  const originalSessionSecret = process.env.SESSION_SECRET;
  const VALID_32_CHAR_SECRET = 'a-super-secret-key-that-is-at-least-32-chars-long';

  beforeEach(() => {
    delete process.env.STUDIO_SECRET_KEY;
    delete process.env.SESSION_SECRET;
  });

  afterEach(() => {
    if (originalStudioSecret !== undefined) {
      process.env.STUDIO_SECRET_KEY = originalStudioSecret;
    } else {
      delete process.env.STUDIO_SECRET_KEY;
    }
    if (originalSessionSecret !== undefined) {
      process.env.SESSION_SECRET = originalSessionSecret;
    } else {
      delete process.env.SESSION_SECRET;
    }
  });

  describe('timingSafeEqualString', () => {
    it('returns true for matching strings', () => {
      expect(timingSafeEqualString('secret123', 'secret123')).toBe(true);
    });

    it('returns false for mismatched strings of same length', () => {
      expect(timingSafeEqualString('secret123', 'secret124')).toBe(false);
    });

    it('returns false for strings of different length', () => {
      expect(timingSafeEqualString('secret', 'secret123')).toBe(false);
      expect(timingSafeEqualString('secret123', 'secret')).toBe(false);
    });
  });

  describe('Fail-closed when STUDIO_SECRET_KEY is unset or too short', () => {
    it('rejects owner access when STUDIO_SECRET_KEY is unset, even with legacy test key', async () => {
      delete process.env.STUDIO_SECRET_KEY;

      const req = new NextRequest('http://localhost:3000/api/studio/publish', {
        method: 'POST',
        headers: {
          'x-studio-key': 'wise-hopper-test-secret-key-32-chars',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: 'Test' }),
      });

      const session = await verifyOwnerSession(req);
      expect(session.isOwner).toBe(false);

      const publishRes = await studioPublishRouteHandler(req);
      expect(publishRes.status).toBe(401);

      const studioReq = new NextRequest('http://localhost:3000/studio', {
        headers: { 'x-studio-key': 'wise-hopper-test-secret-key-32-chars' },
      });
      const mwRes = middleware(studioReq);
      expect(mwRes.status).toBe(307);
      expect(mwRes.headers.get('location')).toContain('/account?error=unauthorized_studio');
    });

    it('rejects owner access when STUDIO_SECRET_KEY is shorter than 32 characters', async () => {
      process.env.STUDIO_SECRET_KEY = 'short-secret';

      const req = new NextRequest('http://localhost:3000/studio', {
        headers: { 'x-studio-key': 'short-secret' },
      });

      const session = await verifyOwnerSession(req);
      expect(session.isOwner).toBe(false);

      const mwRes = middleware(req);
      expect(mwRes.status).toBe(307);
      expect(mwRes.headers.get('location')).toContain('/account?error=unauthorized_studio');
    });

    it('ignores x-test-session-secret header entirely', async () => {
      process.env.STUDIO_SECRET_KEY = VALID_32_CHAR_SECRET;

      const req = new NextRequest('http://localhost:3000/studio', {
        headers: { 'x-test-session-secret': VALID_32_CHAR_SECRET },
      });

      const session = await verifyOwnerSession(req);
      expect(session.isOwner).toBe(false);

      const mwRes = middleware(req);
      expect(mwRes.status).toBe(307);
    });
  });

  describe('Authorized owner access with valid secret key', () => {
    beforeEach(() => {
      process.env.STUDIO_SECRET_KEY = VALID_32_CHAR_SECRET;
    });

    it('grants owner access with valid x-studio-key header', async () => {
      const req = new NextRequest('http://localhost:3000/studio', {
        headers: { 'x-studio-key': VALID_32_CHAR_SECRET },
      });

      const session = await verifyOwnerSession(req);
      expect(session.isOwner).toBe(true);

      const mwRes = middleware(req);
      expect(mwRes.status).toBe(200);
    });

    it('grants owner access with valid Bearer authorization header', async () => {
      const req = new NextRequest('http://localhost:3000/studio', {
        headers: { authorization: `Bearer ${VALID_32_CHAR_SECRET}` },
      });

      const session = await verifyOwnerSession(req);
      expect(session.isOwner).toBe(true);

      const mwRes = middleware(req);
      expect(mwRes.status).toBe(200);
    });

    it('grants owner access with valid wise_owner_session cookie', async () => {
      const req = new NextRequest('http://localhost:3000/studio');
      req.cookies.set('wise_owner_session', VALID_32_CHAR_SECRET);

      const session = await verifyOwnerSession(req);
      expect(session.isOwner).toBe(true);

      const mwRes = middleware(req);
      expect(mwRes.status).toBe(200);
    });
  });
});
