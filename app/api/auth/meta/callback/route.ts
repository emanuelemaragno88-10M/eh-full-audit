import { NextRequest, NextResponse } from 'next/server';
import { exchangeMetaCode, fetchAdAccounts } from '@/lib/meta';
import { kvGet, kvDel } from '@/lib/kv';
import { updateAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errDesc = searchParams.get('error_description');
  const appUrl = process.env.APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  if (error) {
    return NextResponse.redirect(`${appUrl}/onboarding/meta?error=${encodeURIComponent(errDesc || error)}`, 302);
  }
  if (!code || !state) return new NextResponse('Missing code or state', { status: 400 });

  const stored = await kvGet<{ auditId: string }>(`meta-state:${state}`);
  if (!stored) return new NextResponse('Invalid or expired state', { status: 400 });
  await kvDel(`meta-state:${state}`);

  let token: string;
  try { token = await exchangeMetaCode(code); }
  catch (e: any) {
    return NextResponse.redirect(`${appUrl}/onboarding/meta?audit_id=${stored.auditId}&error=${encodeURIComponent(e.message)}`, 302);
  }

  await updateAudit(stored.auditId, { metaToken: token, status: 'meta_connected' });

  // If multiple ad accounts, route to selector
  let accounts: any[] = [];
  try { accounts = await fetchAdAccounts(token); } catch {}

  if (accounts.length > 1) {
    return NextResponse.redirect(`${appUrl}/onboarding/meta/select?audit_id=${stored.auditId}`, 302);
  }
  if (accounts.length === 1) {
    await updateAudit(stored.auditId, { metaAdAccountId: accounts[0].id });
    return NextResponse.redirect(`${appUrl}/onboarding/generating?audit_id=${stored.auditId}`, 302);
  }
  // No accounts found — proceed anyway with limited audit
  return NextResponse.redirect(`${appUrl}/onboarding/generating?audit_id=${stored.auditId}`, 302);
}
