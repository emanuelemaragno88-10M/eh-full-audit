const crypto = require('crypto');

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

function verifyWebhookHmac(rawBody, headerHmac, secret) {
  if (!headerHmac || !secret || !rawBody) return false;

  const computed = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64');

  const a = Buffer.from(computed, 'utf8');
  const b = Buffer.from(headerHmac, 'utf8');
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

module.exports = { getRawBody, verifyWebhookHmac };
