import Anthropic from '@anthropic-ai/sdk';

const KEY = process.env.ANTHROPIC_API_KEY;
export const claudeConfigured = !!KEY;

const SYSTEM_PROMPT = `You are an e-commerce performance auditor for ECOM HOUSE. You analyze a Shopify store and a Meta Ads account and output a structured audit JSON. Be specific to the actual data — reference real product/campaign names and real spend amounts. Score each category 0-100. Map overall score to a letter grade: A (90+), B (75-89), C (60-74), D (40-59), F (<40).

Output strictly valid JSON matching this schema (no markdown, no commentary):
{
  "overallScore": number,
  "overallGrade": "A"|"B"|"C"|"D"|"F",
  "headline": string,
  "sections": [
    {
      "key": "store_performance"|"ad_creative"|"funnel"|"retention",
      "name": string,
      "score": number,
      "findings": [{ "severity": "good"|"warning"|"critical", "title": string, "detail": string }],
      "recommendations": [{ "title": string, "expectedImpact": string }]
    }
  ],
  "topActions": [{ "priority": "high"|"medium"|"low", "title": string, "impact": string, "area": string }]
}

Provide 3-5 findings and 2-3 recommendations per section, and exactly 5 top actions.`;

export async function generateAuditWithClaude(input: any): Promise<any> {
  if (!claudeConfigured) return mockAudit(input);
  const client = new Anthropic({ apiKey: KEY });
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8000,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: `Generate the audit JSON for this account.\n\n${JSON.stringify(input, null, 2)}` },
    ],
  });
  const text = message.content
    .filter(b => b.type === 'text')
    .map(b => (b as any).text)
    .join('\n');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Claude returned non-JSON');
  return JSON.parse(text.slice(start, end + 1));
}

export function mockAudit(input?: any) {
  const shop = input?.shop || 'your-store.myshopify.com';
  return {
    overallScore: 72,
    overallGrade: 'B',
    headline: 'Solid foundation with concentrated upside in retention and creative',
    sections: [
      {
        key: 'store_performance',
        name: 'Store Performance',
        score: 78,
        findings: [
          { severity: 'good', title: 'Healthy product depth', detail: '46 active products spanning 4 collections — sufficient catalog breadth for paid traffic.' },
          { severity: 'warning', title: 'AOV trailing benchmark', detail: 'AOV of €54 vs. €72 category benchmark. Suggests upsell/bundle gap on top sellers.' },
          { severity: 'good', title: 'Conversion signals trending up', detail: 'Repeat product page visits up week-over-week.' },
        ],
        recommendations: [
          { title: 'Add a 2-product bundle on the top 5 SKUs', expectedImpact: 'Lift AOV from €54 toward €68-€72.' },
          { title: 'Add a free-shipping threshold at €75', expectedImpact: 'Pulls AOV up via incentive anchor.' },
        ],
      },
      {
        key: 'ad_creative',
        name: 'Ad Creative Health',
        score: 64,
        findings: [
          { severity: 'critical', title: 'Only 8 active creatives at €4,150/month spend', detail: 'Recommend 15-20 active creatives at this spend level. Creative fatigue likely driving CTR decline.' },
          { severity: 'warning', title: 'Hook rate 18% (benchmark 25%)', detail: '6 of 8 video ads have 3-second view rate below 20%.' },
          { severity: 'good', title: 'CPM efficient at €14.20', detail: 'Below €16 benchmark — targeting is working.' },
        ],
        recommendations: [
          { title: 'Launch 8-12 new creatives in the next 14 days', expectedImpact: 'Recover from fatigue; lift ROAS 0.4-0.7x.' },
          { title: 'Test pattern-interrupt hooks on top 3 video ads', expectedImpact: 'Move hook rate from 18% toward 25%+.' },
        ],
      },
      {
        key: 'funnel',
        name: 'Funnel Optimization',
        score: 75,
        findings: [
          { severity: 'good', title: 'Cart-to-checkout drop healthy at 28%', detail: 'Comfortably below 35% warning threshold.' },
          { severity: 'warning', title: 'PDP add-to-cart could lift', detail: 'Estimated 6.4% ATC rate vs. 9% benchmark — likely social-proof gap.' },
          { severity: 'warning', title: 'Single landing page for 3 campaigns', detail: 'No campaign-specific LPs — message-match suffers.' },
        ],
        recommendations: [
          { title: 'Add a UGC carousel above the fold on top 5 PDPs', expectedImpact: 'Lift add-to-cart 8-15%.' },
          { title: 'Build 2 campaign-specific landing pages', expectedImpact: 'Lift LP CVR 10-25% on cold traffic.' },
        ],
      },
      {
        key: 'retention',
        name: 'Retention Strategy',
        score: 51,
        findings: [
          { severity: 'critical', title: 'Repeat purchase rate 14% (benchmark 25%)', detail: 'Well below category benchmark.' },
          { severity: 'critical', title: 'No post-purchase email sequence detected', detail: 'Largest retention lever currently unused.' },
          { severity: 'warning', title: 'No SMS program', detail: 'SMS typically delivers 7-12% of repeat revenue at this scale.' },
        ],
        recommendations: [
          { title: 'Launch a 5-email post-purchase sequence (D+1, D+7, D+14, D+30, D+60)', expectedImpact: 'Move repeat rate from 14% toward 22-25%.' },
          { title: 'Add SMS opt-in at checkout with first-order welcome flow', expectedImpact: 'Adds 5-8% incremental revenue within 60 days.' },
        ],
      },
    ],
    topActions: [
      { priority: 'high', title: 'Launch post-purchase email sequence', impact: 'Largest single retention lever — move repeat rate 14% → 22%+.', area: 'Retention Strategy' },
      { priority: 'high', title: 'Ship 8-12 new ad creatives in 14 days', impact: 'Recover from fatigue at current spend level.', area: 'Ad Creative Health' },
      { priority: 'high', title: 'Test pattern-interrupt hooks on top 3 video ads', impact: 'Lift hook rate 18% → 25%+.', area: 'Ad Creative Health' },
      { priority: 'medium', title: 'Add 2-product bundle on top 5 SKUs', impact: 'Lift AOV €54 → €68-72.', area: 'Store Performance' },
      { priority: 'medium', title: 'Add UGC carousel to top 5 PDPs', impact: 'Lift PDP ATC 8-15%.', area: 'Funnel Optimization' },
    ],
    storeName: shop,
    generatedAt: new Date().toISOString(),
  };
}
