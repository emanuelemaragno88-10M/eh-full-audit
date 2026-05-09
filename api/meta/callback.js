module.exports = async function handler(req, res) {
  const { code, state, error, error_description } = req.query;

  if (error) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(closeWindowHtml(`Meta authorization denied: ${error_description || error}`));
  }

  if (!code) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(400).send(closeWindowHtml('Missing authorization code'));
  }

  const metaAppId = process.env.META_APP_ID;
  const metaAppSecret = process.env.META_APP_SECRET;
  const appUrl = process.env.APP_URL;

  if (!metaAppId || !metaAppSecret) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(501).send(closeWindowHtml('Meta integration not yet configured on the server.'));
  }

  const redirectUri = `${appUrl}/api/meta/callback`;
  const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token` +
    `?client_id=${encodeURIComponent(metaAppId)}` +
    `&client_secret=${encodeURIComponent(metaAppSecret)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&code=${encodeURIComponent(code)}`;

  let tokenJson;
  try {
    const tokenRes = await fetch(tokenUrl);
    tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      throw new Error(tokenJson.error?.message || 'Token exchange failed');
    }
  } catch (err) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(502).send(closeWindowHtml(`Token exchange failed: ${err.message}`));
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(closeWindowHtml('Meta connected. You can close this window.', true));
};

function closeWindowHtml(message, success = false) {
  const color = success ? '#008060' : '#D72C0D';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Meta Connect</title><style>
body{font-family:-apple-system,Inter,sans-serif;background:#F6F6F7;margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:2rem}
.card{background:#fff;border:1px solid #E1E3E5;border-radius:12px;padding:2rem;max-width:420px;text-align:center}
.dot{width:48px;height:48px;border-radius:50%;background:${color};margin:0 auto 1rem;display:flex;align-items:center;justify-content:center;color:#fff;font-size:24px;font-weight:bold}
p{color:#202223;margin:0 0 1rem;font-size:0.95rem;line-height:1.5}
button{background:#202223;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-weight:600;cursor:pointer;font-family:inherit}
</style></head><body>
<div class="card">
  <div class="dot">${success ? '✓' : '!'}</div>
  <p>${message}</p>
  <button onclick="window.opener?.postMessage({type:'meta-connect',success:${success}},'*');window.close()">Close</button>
</div>
<script>setTimeout(()=>{try{window.opener?.postMessage({type:'meta-connect',success:${success}},'*');window.close()}catch(e){}},1500)</script>
</body></html>`;
}
