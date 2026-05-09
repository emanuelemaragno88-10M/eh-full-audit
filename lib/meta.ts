export const META_APP_ID = process.env.META_APP_ID;
export const META_APP_SECRET = process.env.META_APP_SECRET;
export const APP_URL = process.env.APP_URL || 'https://eh-full-audit.vercel.app';
export const metaConfigured = !!(META_APP_ID && META_APP_SECRET);

export function metaAuthorizeUrl(state: string): string {
  const redirectUri = `${APP_URL}/api/auth/meta/callback`;
  const scope = 'ads_read,business_management';
  return `https://www.facebook.com/v21.0/dialog/oauth` +
    `?client_id=${encodeURIComponent(META_APP_ID || '')}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${encodeURIComponent(state)}` +
    `&response_type=code`;
}

export async function exchangeMetaCode(code: string): Promise<string> {
  const redirectUri = `${APP_URL}/api/auth/meta/callback`;
  const url = `https://graph.facebook.com/v21.0/oauth/access_token` +
    `?client_id=${encodeURIComponent(META_APP_ID!)}` +
    `&client_secret=${encodeURIComponent(META_APP_SECRET!)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&code=${encodeURIComponent(code)}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.access_token) throw new Error(json.error?.message || 'Meta token exchange failed');
  return json.access_token as string;
}

export async function fetchAdAccounts(token: string): Promise<Array<{ id: string; name: string; account_status: number }>> {
  const res = await fetch(`https://graph.facebook.com/v21.0/me/adaccounts?fields=id,name,account_status&access_token=${encodeURIComponent(token)}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Failed to fetch ad accounts');
  return json.data || [];
}

export async function fetchMetaAuditData(token: string, adAccountId: string) {
  const since = Math.floor((Date.now() - 30 * 86400000) / 1000);
  const until = Math.floor(Date.now() / 1000);
  const base = `https://graph.facebook.com/v21.0/${adAccountId}`;
  try {
    const [campaigns, ads, insights] = await Promise.all([
      fetch(`${base}/campaigns?fields=id,name,objective,status,daily_budget,lifetime_budget&limit=100&access_token=${encodeURIComponent(token)}`).then(r => r.json()),
      fetch(`${base}/ads?fields=id,name,status,creative,effective_status&limit=100&access_token=${encodeURIComponent(token)}`).then(r => r.json()),
      fetch(`${base}/insights?fields=spend,impressions,clicks,ctr,cpm,cpc,actions&time_range={"since":"${new Date(since * 1000).toISOString().slice(0, 10)}","until":"${new Date(until * 1000).toISOString().slice(0, 10)}"}&access_token=${encodeURIComponent(token)}`).then(r => r.json()),
    ]);
    return { campaigns: campaigns.data || [], ads: ads.data || [], insights: insights.data || [] };
  } catch {
    return { campaigns: [], ads: [], insights: [] };
  }
}
