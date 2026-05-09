import { NextRequest, NextResponse } from 'next/server';
import { checkVerification } from '@/lib/twilio';
import { getAudit, updateAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const { auditId, phone, code } = await req.json();
  if (!auditId || !phone || !code) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const audit = await getAudit(auditId);
  if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 });

  const result = await checkVerification(phone, code);
  if (!result.ok) return NextResponse.json({ error: result.error || 'Incorrect code, try again' }, { status: 401 });

  await updateAudit(auditId, { phoneVerified: true, status: 'verified' });
  return NextResponse.json({ ok: true });
}
