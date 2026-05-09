const { verifySessionToken, extractBearerToken, shopFromSessionToken } = require('../../lib/verify-session-token');

module.exports = async function handler(req, res) {
  const token = extractBearerToken(req);
  const payload = verifySessionToken(token, process.env.SHOPIFY_API_SECRET, process.env.SHOPIFY_API_KEY);

  if (!payload || !shopFromSessionToken(payload)) {
    return res.status(401).json({ error: 'Invalid or missing session token' });
  }

  const metaAppId = process.env.META_APP_ID;
  const appUrl = process.env.APP_URL;

  if (!metaAppId) {
    return res.status(501).json({
      error: 'Meta integration not yet configured',
      hint: 'Set META_APP_ID and META_APP_SECRET environment variables in Vercel.',
    });
  }

  const redirectUri = `${appUrl}/api/meta/callback`;
  const scope = 'ads_read,ads_management,business_management';
  const state = require('crypto').randomBytes(16).toString('hex');

  const authorizeUrl = `https://www.facebook.com/v21.0/dialog/oauth` +
    `?client_id=${encodeURIComponent(metaAppId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${encodeURIComponent(state)}` +
    `&response_type=code`;

  return res.status(200).json({ authorizeUrl, state });
};
