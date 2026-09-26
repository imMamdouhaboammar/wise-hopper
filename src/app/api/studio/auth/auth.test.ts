import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as loginHandler } from './login/route';
import { POST as logoutHandler, GET as logoutGetHandler } from './logout/route';
import { GET as adminRedirectHandler } from '../../../admin/route';

describe('Studio Admin Authentication & Login Suite', () => {
  const originalStudioSecret = process.env.STUDIO_SECRET_KEY;
  const VALID_32_CHAR_SECRET = 'a-super-secret-key-that-is-at-least-32-chars-long';

  beforeEach(() => {
    delete process.env.STUDIO_SECRET_KEY;
  });

  afterEach(() => {
    if (originalStudioSecret !== undefined) {
      process.env.STUDIO_SECRET_KEY = originalStudioSecret;
    } else {
      delete process.env.STUDIO_SECRET_KEY;
    }
  });

  describe('Login Route (JSON)', () => {
    it('fails closed with 503 when STUDIO_SECRET_KEY is unset on server', async () => {
      delete process.env.STUDIO_SECRET_KEY;

      const req = new NextRequest('http://localhost:3000/api/studio/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: VALID_32_CHAR_SECRET }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.error).toBe('server_misconfigured');
    });

    it('fails closed with 503 when STUDIO_SECRET_KEY is shorter than 32 characters', async () => {
      process.env.STUDIO_SECRET_KEY = 'too-short-secret';

      const req = new NextRequest('http://localhost:3000/api/studio/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: 'too-short-secret' }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.error).toBe('server_misconfigured');
    });

    it('rejects invalid secret key with 401', async () => {
      process.env.STUDIO_SECRET_KEY = VALID_32_CHAR_SECRET;

      const req = new NextRequest('http://localhost:3000/api/studio/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: 'wrong-secret-key-that-does-not-match-at-all' }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('invalid_credentials');
    });

    it('authenticates valid secret key, sets wise_owner_session cookie, and returns redirect', async () => {
      process.env.STUDIO_SECRET_KEY = VALID_32_CHAR_SECRET;

      const req = new NextRequest('http://localhost:3000/api/studio/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: VALID_32_CHAR_SECRET, redirect: '/studio/articles' }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.redirect).toBe('/studio/articles');

      const cookie = res.cookies.get('wise_owner_session');
      expect(cookie).toBeDefined();
      expect(cookie?.value).toBe(VALID_32_CHAR_SECRET);
      expect(cookie?.httpOnly).toBe(true);
      expect(cookie?.sameSite).toBe('lax');
    });
  });

  describe('Login Route (Form Submissions)', () => {
    it('redirects with 303 to destination on valid form POST', async () => {
      process.env.STUDIO_SECRET_KEY = VALID_32_CHAR_SECRET;

      const params = new URLSearchParams();
      params.append('secretKey', VALID_32_CHAR_SECRET);
      params.append('redirect', '/studio');

      const req = new NextRequest('http://localhost:3000/api/studio/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(303);
      expect(res.headers.get('location')).toBe('http://localhost:3000/studio');
      expect(res.cookies.get('wise_owner_session')?.value).toBe(VALID_32_CHAR_SECRET);
    });

    it('redirects with 303 to /account?error=invalid_credentials on bad form submission', async () => {
      process.env.STUDIO_SECRET_KEY = VALID_32_CHAR_SECRET;

      const params = new URLSearchParams();
      params.append('secretKey', 'incorrect-key');
      params.append('redirect', '/studio');

      const req = new NextRequest('http://localhost:3000/api/studio/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(303);
      expect(res.headers.get('location')).toContain('/account?error=invalid_credentials');
    });
  });

  describe('Logout Route', () => {
    it('clears wise_owner_session cookie via POST JSON', async () => {
      const req = new NextRequest('http://localhost:3000/api/studio/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await logoutHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      const cookie = res.cookies.get('wise_owner_session');
      expect(cookie?.value).toBe('');
      expect(cookie?.maxAge).toBe(0);
    });

    it('redirects to /account?logged_out=true via form POST or GET', async () => {
      const req = new NextRequest('http://localhost:3000/api/studio/auth/logout', {
        method: 'GET',
      });

      const res = await logoutGetHandler(req);
      expect(res.status).toBe(303);
      expect(res.headers.get('location')).toContain('/account?logged_out=true');
      expect(res.cookies.get('wise_owner_session')?.maxAge).toBe(0);
    });
  });

  describe('/admin Shortcut Route', () => {
    it('redirects /admin to /studio', async () => {
      const req = new NextRequest('http://localhost:3000/admin');
      const res = adminRedirectHandler(req);
      expect(res.status).toBe(302);
      expect(res.headers.get('location')).toBe('http://localhost:3000/studio');
    });
  });
});
