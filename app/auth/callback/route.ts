import { NextRequest, NextResponse } from 'next/server';
import { isValidShop, SHOPIFY_API_SECRET, exchangeCodeForToken } from '@/lib/shopify';
import { verifyShopifyOAuthHmac } from '@/lib/verify-hmac';
import { kvGet, kvDel } from '@/lib/kv';
import { updateAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query: Record<string, string> = {};
  searchParams.forEach((v, k) => { query[k] = v; });

  const { shop, code, hmac, state } = query;
  if (!shop || !code || !hmac) return new NextResponse('Missing required parameters', { status: 400 });
  if (!isValidShop(shop)) return new NextResponse('Invalid shop', { status: 400 });
  if (!verifyShopifyOAuthHmac(query, SHOPIFY_API_SECRET)) return new NextResponse('HMAC verification failed', { status: 401 });

  // Look up state for audit_id (set during /api/auth/shopify)
  let auditId: string | undefined;
  if (state) {
    const stored = await kvGet<{ shop: string; auditId: string }>(`oauth-state:${state}`);
    if (stored) {
      auditId = stored.auditId;
      await kvDel(`oauth-state:${state}`);
    }
  }

  let token: string;
  try { token = await exchangeCodeForToken(shop, code); }
  catch { return new NextResponse('Token exchange failed', { status: 502 }); }

  if (auditId) {
    await updateAudit(auditId, {
      shopifyStore: shop,
      shopifyToken: token,
      status: 'shopify_connected',
    });
    const dest = `${process.env.APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`}/onboarding/meta?audit_id=${auditId}`;
    return NextResponse.redirect(dest, 302);
  }

  // No audit_id (legacy flow): land on home
  return NextResponse.redirect(process.env.APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`, 302);
}
