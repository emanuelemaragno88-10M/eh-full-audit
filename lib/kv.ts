import { kv as vercelKv } from '@vercel/kv';

const memory = new Map<string, any>();
const useKv = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

export async function kvGet<T = any>(key: string): Promise<T | null> {
  if (useKv) {
    const v = await vercelKv.get<T>(key);
    return v ?? null;
  }
  return (memory.get(key) as T) ?? null;
}

export async function kvSet(key: string, value: any, ttlSeconds?: number): Promise<void> {
  if (useKv) {
    if (ttlSeconds) await vercelKv.set(key, value, { ex: ttlSeconds });
    else await vercelKv.set(key, value);
    return;
  }
  memory.set(key, value);
  if (ttlSeconds) setTimeout(() => memory.delete(key), ttlSeconds * 1000);
}

export async function kvDel(key: string): Promise<void> {
  if (useKv) await vercelKv.del(key);
  else memory.delete(key);
}

export async function kvIncr(key: string, ttlSeconds?: number): Promise<number> {
  if (useKv) {
    const n = await vercelKv.incr(key);
    if (ttlSeconds && n === 1) await vercelKv.expire(key, ttlSeconds);
    return n;
  }
  const cur = (memory.get(key) as number) ?? 0;
  const next = cur + 1;
  memory.set(key, next);
  if (ttlSeconds && next === 1) setTimeout(() => memory.delete(key), ttlSeconds * 1000);
  return next;
}
