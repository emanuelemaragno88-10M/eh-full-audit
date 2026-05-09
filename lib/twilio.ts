import { kvIncr } from './kv';

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const SERVICE = process.env.TWILIO_VERIFY_SERVICE_SID;

function basic() {
  return 'Basic ' + Buffer.from(`${SID}:${TOKEN}`).toString('base64');
}

export const twilioConfigured = !!(SID && TOKEN && SERVICE);

export async function rateLimitOk(phone: string): Promise<boolean> {
  const n = await kvIncr(`sms-rl:${phone}`, 3600);
  return n <= 3;
}

export async function sendVerification(phone: string): Promise<{ ok: boolean; error?: string }> {
  if (!twilioConfigured) return { ok: true }; // dev stub
  const url = `https://verify.twilio.com/v2/Services/${SERVICE}/Verifications`;
  const body = new URLSearchParams({ To: phone, Channel: 'sms' });
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: basic(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) return { ok: false, error: `Twilio ${res.status}` };
  return { ok: true };
}

export async function checkVerification(phone: string, code: string): Promise<{ ok: boolean; error?: string }> {
  if (!twilioConfigured) return { ok: code === '000000' || code === '123456' };
  const url = `https://verify.twilio.com/v2/Services/${SERVICE}/VerificationCheck`;
  const body = new URLSearchParams({ To: phone, Code: code });
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: basic(), 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) return { ok: false, error: `Twilio ${res.status}` };
  const json = await res.json();
  return { ok: json.status === 'approved' };
}
