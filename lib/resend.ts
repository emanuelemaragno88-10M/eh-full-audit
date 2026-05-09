const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || 'ECOM HOUSE <audits@ecomhouse.com>';
export const resendConfigured = !!KEY;

export async function sendAuditEmail(to: string, auditId: string, firstName?: string): Promise<{ ok: boolean; error?: string }> {
  if (!resendConfigured) return { ok: true };
  const url = `${process.env.APP_URL || 'https://eh-full-audit.vercel.app'}/audit/${auditId}`;
  const html = `<!DOCTYPE html><html><body style="font-family:Inter,Arial,sans-serif;background:#1a1a2e;color:#fff;margin:0;padding:40px 20px">
<div style="max-width:560px;margin:0 auto;background:#2a2a3e;border-radius:14px;padding:32px;border:1px solid #3a3a52">
<div style="font-weight:800;letter-spacing:2px;font-size:14px;margin-bottom:24px">ECOM <span style="color:#c9a84c">HOUSE</span></div>
<h1 style="font-size:22px;margin:0 0 12px">${firstName ? firstName + ', your' : 'Your'} Full Funnel Audit is ready</h1>
<p style="color:#c4c4d4;font-size:14px;line-height:1.6;margin:0 0 24px">We analyzed your Shopify store and Meta Ads account across four pillars: Store Performance, Ad Creative Health, Funnel Optimization, and Retention Strategy.</p>
<a href="${url}" style="display:inline-block;background:#ff523f;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:8px">View your audit report</a>
<p style="color:#9a9ab0;font-size:12px;margin:32px 0 0;border-top:1px solid #3a3a52;padding-top:16px">© 2026 ECOM HOUSE GmbH — Full Funnel Audit</p>
</div></body></html>`;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject: 'Your ECOM HOUSE Full Funnel Audit is ready', html }),
  });
  if (!res.ok) {
    const err = await res.text();
    return { ok: false, error: err };
  }
  return { ok: true };
}
