import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Faq from '@/components/Faq';

const PRICE = '€49';
const CHECKOUT_URL = process.env.COPECART_CHECKOUT_URL || 'https://www.ecomhouse.com';

const FEATURES = [
  { title: 'Store Performance', body: 'Product catalog depth, AOV, conversion signals, and product page quality.' },
  { title: 'Ad Creative Health', body: 'Ad variety, spend distribution, format mix, and creative fatigue.' },
  { title: 'Funnel Optimization', body: 'Traffic → cart → purchase flow with bottleneck identification.' },
  { title: 'Retention Strategy', body: 'Repeat purchase rate, lifetime signals, email and SMS program signals.' },
];

const STEPS = [
  { n: '1', title: 'Pay', body: 'Secure checkout via CopeCart.' },
  { n: '2', title: 'Connect accounts', body: 'Read-only access to Shopify and Meta Ads.' },
  { n: '3', title: 'Get your audit', body: '5-page AI-powered report — delivered in under 24 hours.' },
];

const TESTIMONIALS = [
  { name: 'Founder, DTC Skincare', stars: 5, body: 'Found €4K/month of leakage we did not know about. The post-purchase recommendations alone paid back the audit on day 3.' },
  { name: 'Marketing Lead, Apparel Brand', stars: 5, body: 'More specific than reports we have paid 10x for from agencies. Referenced our actual SKUs and campaigns.' },
  { name: 'Operator, Home Goods', stars: 5, body: 'The retention section was a wake-up call. We had no post-purchase flow. 6 weeks later, repeat rate is up 40%.' },
];

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-5 pt-16 sm:pt-24 pb-16 text-center">
          <div className="inline-block bg-card border border-border rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-gold mb-6">
            Powered by ECOM HOUSE
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight max-w-4xl mx-auto">
            Your E-Commerce Business <span className="text-gold">Deserves a Full Audit</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-strong max-w-2xl mx-auto leading-relaxed">
            We analyze your Shopify store + Meta Ads and deliver a 5-page AI-powered audit with specific, actionable recommendations in under 24 hours.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={CHECKOUT_URL} className="btn-primary text-base px-8 py-4">
              Get Your Full Audit — {PRICE}
            </a>
            <a href="#what" className="text-sm text-muted hover:text-white transition-colors">See what's included →</a>
          </div>
          <div className="mt-6 text-xs text-muted">One-time payment · Delivered to your email · No subscription</div>
        </section>

        {/* What's included */}
        <section id="what" className="max-w-6xl mx-auto px-5 py-16">
          <div className="text-center mb-12">
            <div className="text-gold uppercase text-xs font-semibold tracking-[3px] mb-3">What's included</div>
            <h2 className="text-2xl sm:text-4xl font-bold">Four pillars of the ECOM HOUSE method</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="card p-6 hover:border-gold/40 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-bg border border-border flex items-center justify-center mb-4">
                  <span className="text-gold font-bold">{i + 1}</span>
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-strong leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sample audit teaser */}
        <section className="max-w-6xl mx-auto px-5 py-16">
          <div className="text-center mb-12">
            <div className="text-gold uppercase text-xs font-semibold tracking-[3px] mb-3">Sample report</div>
            <h2 className="text-2xl sm:text-4xl font-bold">A glimpse of what you'll receive</h2>
          </div>
          <div className="card p-6 sm:p-10 relative overflow-hidden">
            <div className="grid sm:grid-cols-3 gap-6 items-center">
              <div>
                <div className="w-32 h-32 rounded-full border-[6px] border-gold/40 flex flex-col items-center justify-center mx-auto sm:mx-0">
                  <div className="text-5xl font-extrabold text-gold">B</div>
                  <div className="text-xs text-muted">72 / 100</div>
                </div>
              </div>
              <div className="sm:col-span-2 select-none">
                <h3 className="text-lg font-semibold mb-2">Solid foundation with concentrated upside</h3>
                <div className="space-y-2 mt-4">
                  {['Store Performance — 78', 'Ad Creative Health — 64', 'Funnel Optimization — 75', 'Retention Strategy — 51'].map((line, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-bg/50 px-4 py-2 rounded-lg blur-[1px] hover:blur-0 transition-all">
                      <span className="text-muted-strong">{line}</span>
                      <span className="text-gold">●●●○○</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted">↓ Full report unlocked after audit ↓</div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="max-w-6xl mx-auto px-5 py-16">
          <div className="text-center mb-12">
            <div className="text-gold uppercase text-xs font-semibold tracking-[3px] mb-3">How it works</div>
            <h2 className="text-2xl sm:text-4xl font-bold">Three steps to your audit</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="card p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-accent text-white font-bold flex items-center justify-center mx-auto mb-4">{s.n}</div>
                <h3 className="font-semibold text-base mb-2">{s.title}</h3>
                <p className="text-sm text-muted-strong leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Social proof */}
        <section className="max-w-6xl mx-auto px-5 py-16">
          <div className="text-center mb-12">
            <div className="text-gold uppercase text-xs font-semibold tracking-[3px] mb-3">From operators like you</div>
            <h2 className="text-2xl sm:text-4xl font-bold">What founders are saying</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-6">
                <div className="text-gold mb-3">{'★'.repeat(t.stars)}</div>
                <p className="text-sm text-muted-strong leading-relaxed mb-4">{t.body}</p>
                <div className="text-xs text-muted">— {t.name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing CTA */}
        <section className="max-w-3xl mx-auto px-5 py-16 text-center">
          <div className="card p-8 sm:p-12 bg-gradient-to-b from-card to-bg border-gold/30">
            <div className="text-gold uppercase text-xs font-semibold tracking-[3px] mb-3">One-time payment</div>
            <h2 className="text-3xl sm:text-5xl font-extrabold mb-3">{PRICE}</h2>
            <p className="text-muted-strong mb-8 max-w-md mx-auto">Full Funnel Audit — Shopify + Meta Ads analysis with 5-page AI-powered report and prioritized action list.</p>
            <a href={CHECKOUT_URL} className="btn-primary text-base px-10 py-4">Get Your Full Audit</a>
            <div className="mt-4 text-xs text-muted">Secure checkout via CopeCart · Delivered in under 24 hours</div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-5 py-16">
          <div className="text-center mb-10">
            <div className="text-gold uppercase text-xs font-semibold tracking-[3px] mb-3">FAQ</div>
            <h2 className="text-2xl sm:text-4xl font-bold">Common questions</h2>
          </div>
          <Faq />
        </section>
      </main>
      <Footer />
    </>
  );
}
