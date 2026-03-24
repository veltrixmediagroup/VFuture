type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  options: {
    limit: number;
    windowMs: number;
  },
) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now > current.resetAt) {
    buckets.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return { success: true, remaining: options.limit - 1 };
  }

  if (current.count >= options.limit) {
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.max(0, current.resetAt - now),
    };
  }

  current.count += 1;
  buckets.set(key, current);
  return { success: true, remaining: options.limit - current.count };
}
