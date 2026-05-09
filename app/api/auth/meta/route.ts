import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { metaConfigured, metaAuthorizeUrl } from '@/lib/meta';
import { kvSet } from '@/lib/kv';
import { getAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const auditId = searchParams.get('audit_id');
  if (!auditId) return new NextResponse('Missing audit_id', { status: 400 });

  const audit = await getAudit(auditId);
  if (!audit) return new NextResponse('Audit not found', { status: 404 });

  if (!metaConfigured) {
    const url = `/onboarding/meta?audit_id=${auditId}&error=${encodeURIComponent('Meta integration not configured. Set META_APP_ID and META_APP_SECRET.')}`;
    return NextResponse.redirect(new URL(url, req.url), 302);
  }

  const state = crypto.randomBytes(16).toString('hex');
  await kvSet(`meta-state:${state}`, { auditId }, 600);
  return NextResponse.redirect(metaAuthorizeUrl(state), 302);
}
