import { NextRequest, NextResponse } from 'next/server';
import { verifyCopeCartIpn, parseCopeCartPayload } from '@/lib/copecart';
import { createAudit, getAuditByOrderId } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get('x-copecart-signature') || req.headers.get('x-signature');

  if (process.env.COPECART_IPN_SECRET) {
    if (!verifyCopeCartIpn(rawBody, sig)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let payload: any;
  try { payload = JSON.parse(rawBody); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const parsed = parseCopeCartPayload(payload);
  if (!parsed) return NextResponse.json({ error: 'Unrecognized payload' }, { status: 400 });

  if (parsed.status !== 'paid' && parsed.status !== 'completed' && parsed.status !== 'success') {
    return NextResponse.json({ ok: true, ignored: true, status: parsed.status });
  }

  const existing = await getAuditByOrderId(parsed.orderId);
  if (existing) return NextResponse.json({ ok: true, auditId: existing.id, existed: true });

  const audit = await createAudit(parsed.email, parsed.orderId);
  return NextResponse.json({ ok: true, auditId: audit.id });
}
