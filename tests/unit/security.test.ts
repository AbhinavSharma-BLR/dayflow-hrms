import { describe, it, expect } from 'vitest';
import { RateLimiter } from '../../lib/security/rate-limit';

describe('Phase 6: Security & Rate Limiting', () => {
  it('should allow requests within rate limit threshold', () => {
    const limiter = new RateLimiter({ interval: 1000 });
    const id = 'user_test_1';

    const req1 = limiter.check(id, 3);
    expect(req1.success).toBe(true);
    expect(req1.remaining).toBe(2);

    const req2 = limiter.check(id, 3);
    expect(req2.success).toBe(true);
    expect(req2.remaining).toBe(1);

    const req3 = limiter.check(id, 3);
    expect(req3.success).toBe(true);
    expect(req3.remaining).toBe(0);
  });

  it('should block requests that exceed limit in window', () => {
    const limiter = new RateLimiter({ interval: 1000 });
    const id = 'user_test_2';

    // 2 allowed
    limiter.check(id, 2);
    limiter.check(id, 2);

    // 3rd request should fail
    const blocked = limiter.check(id, 2);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('should reset limit when requested', () => {
    const limiter = new RateLimiter({ interval: 1000 });
    const id = 'user_test_3';

    limiter.check(id, 1);
    const blocked = limiter.check(id, 1);
    expect(blocked.success).toBe(false);

    limiter.reset(id);
    const retry = limiter.check(id, 1);
    expect(retry.success).toBe(true);
  });
});
