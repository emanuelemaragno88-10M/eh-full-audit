import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { isValidShop, SHOPIFY_API_KEY, SCOPES } from '@/lib/shopify';
import { kvSet } from '@/lib/kv';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get('shop');
  const auditId = searchParams.get('audit_id') || '';

  if (!shop || !isValidShop(shop)) {
    return new NextResponse('Invalid shop', { status: 400 });
  }
  if (!SHOPIFY_API_KEY) return new NextResponse('Server misconfigured', { status: 500 });

  const appUrl = process.env.APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
  const redirectUri = `${appUrl}/auth/callback`;
  const state = crypto.randomBytes(16).toString('hex');

  await kvSet(`oauth-state:${state}`, { shop, auditId }, 600);

  const url = `https://${shop}/admin/oauth/authorize` +
    `?client_id=${encodeURIComponent(SHOPIFY_API_KEY)}` +
    `&scope=${encodeURIComponent(SCOPES)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(state)}`;

  const res = NextResponse.redirect(url, 302);
  res.cookies.set('shopify_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600 });
  return res;
}
