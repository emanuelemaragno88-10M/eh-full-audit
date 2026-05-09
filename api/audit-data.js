const { verifySessionToken, extractBearerToken, shopFromSessionToken } = require('../lib/verify-session-token');

const MOCK = {
  generatedAt: '2026-05-09T12:00:00Z',
  overall: {
    grade: 'B',
    score: 78,
    label: 'Solid foundation with focused upside',
  },
  categories: [
    {
      key: 'store_performance',
      title: 'Store Performance',
      status: 'good',
      score: 82,
      summary: 'Conversion rate is above the 2.1% benchmark. Mobile speed needs attention.',
    },
    {
      key: 'ad_creative',
      title: 'Ad Creative Health',
      status: 'warning',
      score: 64,
      summary: 'Hook rate is 18% (benchmark 25%). Only 8 active creatives at current spend level.',
    },
    {
      key: 'funnel',
      title: 'Funnel Optimization',
      status: 'good',
      score: 79,
      summary: 'Cart-to-checkout drop-off is healthy at 28%. Add-to-cart could be lifted with social proof.',
    },
    {
      key: 'retention',
      title: 'Retention Strategy',
      status: 'critical',
      score: 51,
      summary: 'Repeat purchase rate is 14% — well below the 25% benchmark for your category.',
    },
  ],
  actionItems: [
    { id: 1, priority: 'high', title: 'Add 8-12 new ad creatives in the next 14 days', area: 'Ad Creative Health', impact: 'Combat creative fatigue at current spend.' },
    { id: 2, priority: 'high', title: 'Launch a post-purchase email sequence', area: 'Retention Strategy', impact: 'Lift repeat purchase rate from 14% toward 25%.' },
    { id: 3, priority: 'high', title: 'Test pattern-interrupt hooks on top 3 video ads', area: 'Ad Creative Health', impact: 'Move hook rate from 18% to 25%+.' },
    { id: 4, priority: 'medium', title: 'Diversify budget across 3-4 campaigns', area: 'Ad Creative Health', impact: 'Reduce concentration risk (currently 68% in one campaign).' },
    { id: 5, priority: 'medium', title: 'Add product video to top 5 PDPs', area: 'Store Performance', impact: 'Lift PDP conversion 8-15%.' },
    { id: 6, priority: 'medium', title: 'Compress hero images on mobile', area: 'Store Performance', impact: 'Improve LCP from 3.4s toward sub-2.5s.' },
    { id: 7, priority: 'low', title: 'Add UGC carousel to homepage', area: 'Funnel Optimization', impact: 'Improve add-to-cart rate via social proof.' },
    { id: 8, priority: 'low', title: 'A/B test trust-badge placement at checkout', area: 'Funnel Optimization', impact: 'Marginal lift to checkout completion.' },
  ],
};

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = extractBearerToken(req);
  const payload = verifySessionToken(token, process.env.SHOPIFY_API_SECRET, process.env.SHOPIFY_API_KEY);

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or missing session token' });
  }

  const shop = shopFromSessionToken(payload);
  if (!shop) {
    return res.status(401).json({ error: 'Session token missing shop destination' });
  }

  return res.status(200).json({
    shop,
    user: payload.sub,
    ...MOCK,
  });
};
