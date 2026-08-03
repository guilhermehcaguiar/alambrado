const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function prune() {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function isRateLimited(key: string): boolean {
  prune();
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_REQUESTS;
}
