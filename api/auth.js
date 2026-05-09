const crypto = require('crypto');

const SHOP_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.myshopify\.com$/;

const LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ECOM HOUSE Audit Tool</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Montserrat', Helvetica, sans-serif; background: #000; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; text-align: center; }
  .card { max-width: 520px; }
  h1 { font-size: 2rem; font-weight: 700; margin-bottom: 1rem; }
  h1 span { color: #c9a25a; }
  p { color: #999; font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem; }
  .badge { display: inline-block; background: #1a1a15; color: #c9a25a; font-size: 0.75rem; font-weight: 600; padding: 6px 14px; border-radius: 4px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 1.5rem; border: 1px solid #c9a25a33; }
</style>
</head>
<body>
<div class="card">
  <div class="badge">ECOM HOUSE</div>
  <h1>Audit Tool <span>—</span> Shopify App</h1>
  <p>Install from the Shopify App Store to connect your store and generate your performance audit report.</p>
</div>
</body>
</html>`;

module.exports = async function handler(req, res) {
  const shop = req.query.shop;

  if (!shop) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(LANDING_HTML);
  }

  if (!SHOP_REGEX.test(shop)) {
    return res.status(400).send('Invalid shop parameter');
  }

  const apiKey = process.env.SHOPIFY_API_KEY;
  const scopes = process.env.SCOPES || 'read_products';
  const appUrl = process.env.APP_URL;

  if (!apiKey || !appUrl) {
    return res.status(500).send('Server misconfigured');
  }

  const redirectUri = `${appUrl}/auth/callback`;
  const state = crypto.randomBytes(16).toString('hex');

  const installUrl = `https://${shop}/admin/oauth/authorize` +
    `?client_id=${encodeURIComponent(apiKey)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(state)}`;

  res.setHeader('Set-Cookie', `shopify_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);
  res.writeHead(302, { Location: installUrl });
  return res.end();
};
