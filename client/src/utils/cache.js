// Lightweight in-memory SWR cache for instant route & tab transitions
const store = new Map();

export function getCached(key, maxAgeMs = 60_000) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > maxAgeMs) {
    return { data: entry.data, stale: true };
  }
  return { data: entry.data, stale: false };
}

export function setCached(key, data) {
  store.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(prefix) {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  }
}
