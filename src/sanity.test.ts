import { describe, it, expect } from 'vitest';

describe('Sanity Environment Check', () => {
  it('runs vitest in happy-dom successfully', () => {
    expect(1 + 1).toBe(2);
  });
});
