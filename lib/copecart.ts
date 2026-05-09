import crypto from 'crypto';

const SECRET = process.env.COPECART_IPN_SECRET;

export function verifyCopeCartIpn(rawBody: string, signatureHeader: string | null): boolean {
  if (!SECRET || !signatureHeader) return false;
  const computed = crypto.createHmac('sha256', SECRET).update(rawBody).digest('hex');
  const a = Buffer.from(computed, 'utf8');
  const b = Buffer.from(signatureHeader, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function parseCopeCartPayload(payload: any): { orderId: string; email: string; status: string } | null {
  if (!payload) return null;
  const orderId = payload.order_id || payload.orderId || payload.transaction_id || payload.id;
  const email = payload.email || payload.buyer?.email || payload.customer?.email;
  const status = payload.status || payload.payment_status || (payload.event === 'order.completed' ? 'paid' : '');
  if (!orderId || !email) return null;
  return { orderId: String(orderId), email: String(email), status: String(status).toLowerCase() };
}
