import crypto from 'crypto';

export function verifyHmacBase64(rawBody: string | Buffer, headerHmac: string | null, secret: string | undefined): boolean {
  if (!headerHmac || !secret) return false;
  const computed = crypto.createHmac('sha256', secret).update(rawBody).digest('base64');
  const a = Buffer.from(computed, 'utf8');
  const b = Buffer.from(headerHmac, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function verifyHmacHex(message: string, hexSig: string, secret: string | undefined): boolean {
  if (!hexSig || !secret) return false;
  const computed = crypto.createHmac('sha256', secret).update(message).digest('hex');
  const a = Buffer.from(computed, 'utf8');
  const b = Buffer.from(hexSig, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function verifyShopifyOAuthHmac(query: Record<string, string>, secret: string | undefined): boolean {
  if (!secret || !query.hmac) return false;
  const { hmac, signature, ...rest } = query;
  const message = Object.keys(rest).sort().map(k => `${k}=${rest[k]}`).join('&');
  return verifyHmacHex(message, hmac, secret);
}
