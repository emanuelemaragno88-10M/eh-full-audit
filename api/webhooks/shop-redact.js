const { getRawBody, verifyWebhookHmac } = require('../../lib/verify-hmac');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = await getRawBody(req);
  const hmacHeader = req.headers['x-shopify-hmac-sha256'];
  const secret = process.env.SHOPIFY_API_SECRET;

  if (!verifyWebhookHmac(rawBody, hmacHeader, secret)) {
    return res.status(401).json({ error: 'Invalid HMAC signature' });
  }

  return res.status(200).json({ ok: true, topic: 'shop/redact' });
};

module.exports.config = { api: { bodyParser: false } };
