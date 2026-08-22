interface RateLimitOptions {
  interval: number; // in milliseconds (e.g. 60000 = 1 minute)
  uniqueTokenPerInterval?: number; // Max number of unique users to track per interval
}

export class RateLimiter {
  private tokenCache: Map<string, number[]>;
  private interval: number;

  constructor(options: RateLimitOptions) {
    this.interval = options.interval;
    this.tokenCache = new Map<string, number[]>();
  }

  /**
   * Check if a request identifier has exceeded the rate limit
   * @param identifier e.g. IP address or user ID
   * @param limit Max requests allowed within the interval
   * @returns { success: boolean, remaining: number, reset: number }
   */
  check(identifier: string, limit: number): { success: boolean; remaining: number; reset: number } {
    const now = Date.now();
    const windowStart = now - this.interval;

    let timestamps = this.tokenCache.get(identifier) || [];
    // Filter timestamps within current window
    timestamps = timestamps.filter((t) => t > windowStart);

    const isRateLimited = timestamps.length >= limit;
    const remaining = Math.max(0, limit - timestamps.length);
    const reset = windowStart + this.interval;

    if (!isRateLimited) {
      timestamps.push(now);
      this.tokenCache.set(identifier, timestamps);
    }

    // Periodic cleanup of stale tokens
    if (this.tokenCache.size > 5000) {
      for (const [key, times] of this.tokenCache.entries()) {
        const valid = times.filter((t) => t > windowStart);
        if (valid.length === 0) {
          this.tokenCache.delete(key);
        } else {
          this.tokenCache.set(key, valid);
        }
      }
    }

    return {
      success: !isRateLimited,
      remaining: isRateLimited ? 0 : remaining - 1,
      reset,
    };
  }

  reset(identifier: string) {
    this.tokenCache.delete(identifier);
  }
}

// Global API rate limiters
export const globalApiRateLimiter = new RateLimiter({ interval: 60 * 1000 }); // 60s window
export const authRateLimiter = new RateLimiter({ interval: 60 * 1000 }); // 60s window for auth
