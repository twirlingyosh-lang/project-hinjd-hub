interface RateLimitRecord {
  count: number;
  firstAttempt: number;
  blocked: boolean;
}

interface RateLimiterConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

export class RateLimiter {
  private attempts: Map<string, RateLimitRecord>;
  private config: RateLimiterConfig;

  constructor(config: RateLimiterConfig) {
    this.config = config;
    this.attempts = new Map();
  }

  tryAcquire(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) return true;

    // Check if still blocked
    if (record.blocked && (now - record.firstAttempt) < this.config.blockDurationMs) {
      return false;
    }

    // Reset if window expired
    if ((now - record.firstAttempt) > this.config.windowMs) {
      this.attempts.delete(key);
      return true;
    }

    return record.count < this.config.maxAttempts;
  }

  recordFailure(key: string): void {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record) {
      this.attempts.set(key, { count: 1, firstAttempt: now, blocked: false });
    } else {
      record.count++;
      if (record.count >= this.config.maxAttempts) {
        record.blocked = true;
      }
    }
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  getRemainingTime(key: string): number {
    const record = this.attempts.get(key);
    if (!record || !record.blocked) return 0;
    
    const elapsed = Date.now() - record.firstAttempt;
    const remaining = this.config.blockDurationMs - elapsed;
    return Math.max(0, Math.ceil(remaining / 1000 / 60)); // Return minutes
  }
}

// Singleton instance for auth rate limiting
export const authLimiter = new RateLimiter({
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 15 * 60 * 1000, // 15 minutes block
});
