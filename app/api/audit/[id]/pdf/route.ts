import { NextRequest, NextResponse } from 'next/server';
import { getAudit } from '@/lib/audit';
import { mockAudit } from '@/lib/claude';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const audit = await getAudit(params.id);
  const result = audit?.auditResult || mockAudit({ shop: audit?.shopifyStore });
  const storeName = audit?.shopifyStore || result.storeName || 'Sample Store';

  // Print-ready HTML — browser "Save as PDF" yields a clean PDF.
  // (Server-side PDF rendering deferred — would require @react-pdf/renderer or puppeteer-core, both heavy.)
  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>ECOM HOUSE Audit — ${storeName}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  body { font-family: -apple-system, Inter, Segoe UI, sans-serif; color: #1a1a2e; line-height: 1.5; margin: 0; }
  h1, h2, h3 { color: #1a1a2e; margin: 0; }
  .brand { font-weight: 800; letter-spacing: 2px; font-size: 11px; color: #1a1a2e; }
  .gold { color: #c9a84c; }
  .header { display: flex; justify-content: space-between; align-items: end; padding-bottom: 14px; border-bottom: 2px solid #1a1a2e; margin-bottom: 24px; }
  h1 { font-size: 26px; font-weight: 800; }
  .sub { color: #6b7280; font-size: 11px; margin-top: 4px; }
  .gauge { display: flex; gap: 20px; align-items: center; padding: 18px; border: 2px solid #c9a84c; border-radius: 12px; margin-bottom: 24px; }
  .grade { font-size: 56px; font-weight: 800; color: #c9a84c; line-height: 1; }
  .score { font-size: 11px; color: #6b7280; }
  .headline { font-size: 16px; font-weight: 700; }
  .section { padding: 16px; border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 14px; page-break-inside: avoid; }
  .sec-head { display: flex; justify-content: space-between; align-items: end; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; margin-bottom: 12px; }
  .sec-head h2 { font-size: 16px; font-weight: 700; }
  .sec-score { font-size: 28px; font-weight: 800; }
  .col-title { text-transform: uppercase; letter-spacing: 1px; font-size: 9px; color: #9ca3af; font-weight: 700; margin-bottom: 6px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  ul { list-style: none; padding: 0; margin: 0; }
  li { margin-bottom: 8px; }
  .dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
  .dot.good { background: #34d399; } .dot.warning { background: #f59e0b; } .dot.critical { background: #ef4444; }
  .reco { background: #fafafa; padding: 8px 10px; border-radius: 6px; }
  .reco .imp { color: #c9a84c; font-size: 10px; margin-top: 4px; }
  .actions { padding: 16px; border: 2px solid #c9a84c; border-radius: 10px; }
  .action { display: grid; grid-template-columns: 24px 60px 1fr; gap: 10px; padding: 8px 0; border-top: 1px solid #e5e7eb; }
  .action:first-child { border-top: 0; }
  .action-num { font-weight: 800; color: #c9a84c; }
  .pri { display: inline-block; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
  .pri.high { background: #fee2e2; color: #b91c1c; } .pri.medium { background: #fef3c7; color: #92400e; } .pri.low { background: #d1fae5; color: #065f46; }
  .footer { text-align: center; font-size: 9px; color: #9ca3af; margin-top: 30px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
</style></head>
<body>
<div class="header">
  <div>
    <div class="brand">ECOM <span class="gold">HOUSE</span></div>
    <h1 style="margin-top:8px">${storeName}</h1>
    <div class="sub">Full Funnel Audit · Generated ${new Date(audit?.completedAt || result.generatedAt || Date.now()).toLocaleDateString()}</div>
  </div>
  <div style="text-align:right">
    <div class="grade">${result.overallGrade}</div>
    <div class="score">${result.overallScore} / 100</div>
  </div>
</div>

<div class="gauge"><div class="headline">${result.headline}</div></div>

${result.sections.map((s: any, i: number) => `
<div class="section">
  <div class="sec-head"><h2>${i + 1}. ${s.name}</h2><div class="sec-score">${s.score}</div></div>
  <div class="grid">
    <div>
      <div class="col-title">Findings</div>
      <ul>${s.findings.map((f: any) => `<li><span class="dot ${f.severity}"></span><strong>${f.title}</strong><br><span style="font-size:10px;color:#6b7280">${f.detail}</span></li>`).join('')}</ul>
    </div>
    <div>
      <div class="col-title">Recommendations</div>
      <ul>${s.recommendations.map((r: any) => `<li class="reco"><strong>${r.title}</strong><div class="imp">→ ${r.expectedImpact}</div></li>`).join('')}</ul>
    </div>
  </div>
</div>
`).join('')}

<div class="actions">
  <div class="col-title">Top 5 Priority Actions</div>
  ${result.topActions.map((a: any, i: number) => `
    <div class="action">
      <div class="action-num">${i + 1}</div>
      <div><span class="pri ${a.priority}">${a.priority}</span></div>
      <div><strong>${a.title}</strong><br><span style="font-size:10px;color:#6b7280">${a.impact}</span></div>
    </div>
  `).join('')}
</div>

<div class="footer">© 2026 ECOM HOUSE GmbH — Full Funnel Audit · ${process.env.APP_URL || 'eh-full-audit.vercel.app'}</div>
</body></html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="ECOM_HOUSE_Audit_${params.id}.html"`,
    },
  });
}
