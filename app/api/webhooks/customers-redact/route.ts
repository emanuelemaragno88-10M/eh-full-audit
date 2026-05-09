import { NextRequest, NextResponse } from 'next/server';
import { verifyHmacBase64 } from '@/lib/verify-hmac';

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const hmac = req.headers.get('x-shopify-hmac-sha256');
  if (!verifyHmacBase64(rawBody, hmac, process.env.SHOPIFY_API_SECRET)) {
    return NextResponse.json({ error: 'Invalid HMAC signature' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, topic: 'customers/redact' });
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
