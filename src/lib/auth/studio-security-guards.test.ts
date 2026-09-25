import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as studioPublishRouteHandler } from '../../app/api/studio/publish/route';

describe('Phase 1 Security Invariant: Studio Endpoints Reject Non-Owners', () => {
  const originalStudioSecret = process.env.STUDIO_SECRET_KEY;

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

  const studioRouteHandlers: Array<{
    name: string;
    handler: (req: NextRequest) => Promise<Response>;
    method: string;
    url: string;
  }> = [
    {
      name: '/api/studio/publish',
      handler: studioPublishRouteHandler,
      method: 'POST',
      url: 'http://localhost:3000/api/studio/publish',
    },
  ];

  for (const { name, handler, method, url } of studioRouteHandlers) {
    it(`fails closed and rejects non-owner with 401 for ${name}`, async () => {
      const unauthRequest = new NextRequest(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
      });

      const response = await handler(unauthRequest);
      expect(response.status).toBe(401);
    });
  }
});
