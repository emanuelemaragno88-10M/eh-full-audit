import { NextRequest, NextResponse } from 'next/server';
import { sendVerification, rateLimitOk } from '@/lib/twilio';
import { getAudit, updateAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const { auditId, firstName, lastName, email, phone } = await req.json();
  if (!auditId || !phone) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const audit = await getAudit(auditId);
  if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 });

  if (!(await rateLimitOk(phone))) {
    return NextResponse.json({ error: 'Too many SMS requests. Please wait an hour and try again.' }, { status: 429 });
  }

  await updateAudit(auditId, { firstName, lastName, email, phone });

  const result = await sendVerification(phone);
  if (!result.ok) return NextResponse.json({ error: result.error || 'Failed to send code' }, { status: 502 });

  return NextResponse.json({ ok: true });
}
