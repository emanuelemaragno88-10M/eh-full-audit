const crypto = require('crypto');

function base64UrlDecode(str) {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  return Buffer.from(str + pad, 'base64');
}

function verifySessionToken(token, secret, expectedAud) {
  if (!token || !secret) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;
  const signingInput = `${headerB64}.${payloadB64}`;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(signingInput)
    .digest();

  let received;
  try {
    received = base64UrlDecode(signatureB64);
  } catch {
    return null;
  }

  if (expected.length !== received.length) return null;
  if (!crypto.timingSafeEqual(expected, received)) return null;

  let payload;
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64).toString('utf8'));
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  const leeway = 5;
  if (payload.exp && payload.exp + leeway < now) return null;
  if (payload.nbf && payload.nbf - leeway > now) return null;
  if (expectedAud && payload.aud !== expectedAud) return null;

  return payload;
}

function extractBearerToken(req) {
  const auth = req.headers.authorization || req.headers.Authorization;
  if (!auth || typeof auth !== 'string') return null;
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

function shopFromSessionToken(payload) {
  if (!payload || !payload.dest) return null;
  const m = payload.dest.match(/^https:\/\/([a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com)$/);
  return m ? m[1] : null;
}

module.exports = { verifySessionToken, extractBearerToken, shopFromSessionToken };
