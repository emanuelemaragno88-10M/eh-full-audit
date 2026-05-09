import { NextRequest, NextResponse } from 'next/server';
import { getAudit } from '@/lib/audit';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const audit = await getAudit(params.id);
  if (!audit) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Strip secrets before returning
  const { shopifyToken, metaToken, ...safe } = audit;
  return NextResponse.json(safe);
}
