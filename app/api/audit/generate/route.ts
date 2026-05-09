import { NextRequest, NextResponse } from 'next/server';
import { getAudit, updateAudit } from '@/lib/audit';
import { fetchShopifyAuditData } from '@/lib/shopify';
import { fetchMetaAuditData } from '@/lib/meta';
import { generateAuditWithClaude } from '@/lib/claude';
import { sendAuditEmail } from '@/lib/resend';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { auditId } = await req.json();
  if (!auditId) return NextResponse.json({ error: 'Missing auditId' }, { status: 400 });
  const audit = await getAudit(auditId);
  if (!audit) return NextResponse.json({ error: 'Audit not found' }, { status: 404 });

  // Idempotency: don't restart if already running or done
  if (audit.status === 'generating' || audit.status === 'complete') {
    return NextResponse.json({ ok: true, status: audit.status });
  }

  // Mark as generating immediately, then continue in the background
  await updateAudit(auditId, { status: 'generating', generatingProgress: { step: 0, label: 'Starting…' } });

  // Fire and forget — Vercel serverless will keep this running up to maxDuration
  runGeneration(auditId).catch(async err => {
    await updateAudit(auditId, { status: 'failed', errorMessage: String(err?.message || err) });
  });

  return NextResponse.json({ ok: true, status: 'generating' });
}

async function runGeneration(auditId: string) {
  const audit = await getAudit(auditId);
  if (!audit) throw new Error('Audit disappeared');

  await updateAudit(auditId, { generatingProgress: { step: 0, label: 'Pulling Shopify data…' } });
  const shopifyData = audit.shopifyStore && audit.shopifyToken
    ? await fetchShopifyAuditData(audit.shopifyStore, audit.shopifyToken).catch(() => ({ products: [], orders: [], customers: [] }))
    : { products: [], orders: [], customers: [] };

  await updateAudit(auditId, { generatingProgress: { step: 1, label: 'Pulling Meta Ads data…' } });
  const metaData = audit.metaToken && audit.metaAdAccountId
    ? await fetchMetaAuditData(audit.metaToken, audit.metaAdAccountId).catch(() => ({ campaigns: [], ads: [], insights: [] }))
    : { campaigns: [], ads: [], insights: [] };

  await updateAudit(auditId, { generatingProgress: { step: 2, label: 'Analyzing performance…' } });

  const result = await generateAuditWithClaude({
    shop: audit.shopifyStore,
    shopify: {
      productCount: shopifyData.products.length,
      products: shopifyData.products.slice(0, 50).map((p: any) => ({ title: p.title, vendor: p.vendor, productType: p.product_type })),
      orderCount: shopifyData.orders.length,
      orderTotals: shopifyData.orders.slice(0, 200).map((o: any) => ({ total: parseFloat(o.total_price || '0'), createdAt: o.created_at, customerId: o.customer?.id })),
      customerCount: shopifyData.customers.length,
    },
    meta: {
      campaignCount: metaData.campaigns.length,
      campaigns: metaData.campaigns.slice(0, 30).map((c: any) => ({ name: c.name, objective: c.objective, status: c.status })),
      adCount: metaData.ads.length,
      activeAdCount: metaData.ads.filter((a: any) => a.effective_status === 'ACTIVE').length,
      insights: metaData.insights.slice(0, 5),
    },
  });

  await updateAudit(auditId, { generatingProgress: { step: 4, label: 'Building your report…' } });

  await updateAudit(auditId, { generatingProgress: { step: 5, label: 'Sending to your email…' } });
  if (audit.email) await sendAuditEmail(audit.email, auditId, audit.firstName).catch(() => {});

  await updateAudit(auditId, {
    status: 'complete',
    auditResult: result,
    completedAt: new Date().toISOString(),
    generatingProgress: { step: 5, label: 'Complete' },
  });
}
