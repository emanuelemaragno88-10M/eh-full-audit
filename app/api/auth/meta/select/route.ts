import { NextRequest, NextResponse } from 'next/server';
import { updateAudit, getAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const { auditId, adAccountId } = await req.json();
  if (!auditId || !adAccountId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const audit = await getAudit(auditId);
  if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  await updateAudit(auditId, { metaAdAccountId: adAccountId });
  return NextResponse.json({ ok: true });
}
