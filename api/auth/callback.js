const crypto = require('crypto');

const SHOP_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

function verifyOAuthHmac(query, secret) {
  if (!query || !secret) return false;
  const { hmac, signature, ...rest } = query;
  if (!hmac) return false;

  const message = Object.keys(rest)
    .sort()
    .map(k => `${k}=${rest[k]}`)
    .join('&');

  const computed = crypto
    .createHmac('sha256', secret)
    .update(message)
    .digest('hex');

  const a = Buffer.from(computed, 'utf8');
  const b = Buffer.from(hmac, 'utf8');
  if (a.length !== b.length) return false;

  return crypto.timingSafeEqual(a, b);
}

module.exports = async function handler(req, res) {
  const { shop, code, hmac } = req.query;
  const apiKey = process.env.SHOPIFY_API_KEY;
  const secret = process.env.SHOPIFY_API_SECRET;

  if (!apiKey || !secret) {
    return res.status(500).send('Server misconfigured');
  }

  if (!shop || !code || !hmac) {
    return res.status(400).send('Missing required parameters');
  }

  if (!SHOP_REGEX.test(shop)) {
    return res.status(400).send('Invalid shop parameter');
  }

  if (!verifyOAuthHmac(req.query, secret)) {
    return res.status(401).send('HMAC verification failed');
  }

  let tokenRes;
  try {
    tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: secret,
        code: code,
      }),
    });
  } catch (err) {
    return res.status(502).send('Token exchange request failed');
  }

  if (!tokenRes.ok) {
    return res.status(502).send('Token exchange returned non-2xx');
  }

  res.writeHead(302, { Location: `https://${shop}/admin/apps/${apiKey}` });
  return res.end();
};
