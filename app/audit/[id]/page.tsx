import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getAudit } from '@/lib/audit';
import { mockAudit } from '@/lib/claude';
import Gauge from './Gauge';

export const dynamic = 'force-dynamic';

const BOOKING_URL = process.env.BOOKING_URL || 'https://ecom.house/call';

const SEVERITY_DOT = { good: 'bg-success', warning: 'bg-warning', critical: 'bg-critical' } as const;
const PRIORITY_BADGE = {
  high: 'bg-critical/20 text-critical border-critical/40',
  medium: 'bg-warning/20 text-warning border-warning/40',
  low: 'bg-success/20 text-success border-success/40',
} as const;

export default async function AuditReport({ params }: { params: { id: string } }) {
  const audit = await getAudit(params.id);
  // Always show something — fall back to mock if record not found or not yet generated
  const result = audit?.auditResult || mockAudit({ shop: audit?.shopifyStore });
  const storeName = audit?.shopifyStore || result.storeName || 'Sample Store';
  const generatedAt = audit?.completedAt || result.generatedAt || new Date().toISOString();

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-5 py-10">
        {/* Report header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-border">
          <div>
            <div className="text-gold uppercase text-xs font-semibold tracking-[3px] mb-1.5">Full Funnel Audit</div>
            <h1 className="text-3xl sm:text-4xl font-extrabold">{storeName}</h1>
            <div className="text-sm text-muted mt-1">Generated {new Date(generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
          </div>
          <div className="flex gap-2">
            <a href={`/api/audit/${params.id}/pdf`} className="btn-secondary text-sm">↓ Download PDF</a>
          </div>
        </div>

        {/* Overall score */}
        <section className="card p-6 sm:p-10 mb-6">
          <div className="grid sm:grid-cols-[auto_1fr] gap-8 items-center">
            <Gauge grade={result.overallGrade} score={result.overallScore} />
            <div>
              <div className="text-gold uppercase text-xs font-semibold tracking-[3px] mb-2">Overall account health</div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">{result.headline}</h2>
              <div className="grid sm:grid-cols-2 gap-2 mt-4">
                {result.sections.map((s: any) => (
                  <div key={s.key} className="flex items-center justify-between bg-bg/60 px-4 py-2 rounded-lg text-sm">
                    <span className="text-muted-strong">{s.name}</span>
                    <span className="text-white font-semibold">{s.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section breakdowns */}
        {result.sections.map((s: any, i: number) => (
          <section key={s.key} className="card p-6 sm:p-8 mb-4">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
              <div>
                <div className="text-gold uppercase text-xs font-semibold tracking-[3px] mb-1">Section {i + 1}</div>
                <h3 className="text-xl sm:text-2xl font-bold">{s.name}</h3>
              </div>
              <div className="text-right">
                <div className="text-3xl sm:text-4xl font-extrabold">{s.score}</div>
                <div className="text-xs text-muted">/ 100</div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-muted-strong font-semibold mb-3">Findings</h4>
                <ul className="space-y-3">
                  {s.findings.map((f: any, j: number) => (
                    <li key={j} className="flex gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${SEVERITY_DOT[f.severity as keyof typeof SEVERITY_DOT]}`} />
                      <div>
                        <div className="text-sm font-semibold">{f.title}</div>
                        <div className="text-xs text-muted-strong leading-relaxed mt-0.5">{f.detail}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-muted-strong font-semibold mb-3">Recommendations</h4>
                <ul className="space-y-3">
                  {s.recommendations.map((r: any, j: number) => (
                    <li key={j} className="bg-bg/60 rounded-lg p-3.5 border border-border/60">
                      <div className="text-sm font-semibold mb-1.5">{r.title}</div>
                      <div className="text-xs text-gold/90 leading-relaxed">→ {r.expectedImpact}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}

        {/* Top 5 actions */}
        <section className="card p-6 sm:p-8 mb-6 border-gold/30">
          <div className="text-gold uppercase text-xs font-semibold tracking-[3px] mb-2">Priority order</div>
          <h3 className="text-xl sm:text-2xl font-bold mb-5">Top 5 Actions</h3>
          <ol className="space-y-3">
            {result.topActions.map((a: any, i: number) => (
              <li key={i} className="grid grid-cols-[auto_auto_1fr] gap-4 items-start py-3 border-t border-border first:border-t-0 first:pt-0">
                <div className="text-2xl font-extrabold text-gold w-8">{i + 1}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${PRIORITY_BADGE[a.priority as keyof typeof PRIORITY_BADGE]}`}>
                  {a.priority}
                </div>
                <div>
                  <div className="text-sm sm:text-base font-semibold mb-1">{a.title}</div>
                  <div className="text-xs sm:text-sm text-muted-strong leading-relaxed">{a.impact}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted mt-1.5">{a.area}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="card p-8 sm:p-10 text-center bg-gradient-to-b from-card to-bg border-gold/30">
          <h3 className="text-2xl sm:text-3xl font-bold mb-2">Want help implementing these recommendations?</h3>
          <p className="text-muted-strong mb-6 max-w-xl mx-auto">Our team has helped 200+ brands scale from €5K to €100K+/month. Book a free 30-minute call and we will walk through your top 5 actions.</p>
          <a href={BOOKING_URL} className="btn-primary text-base px-8 py-4">Book a Free Strategy Call with ECOM HOUSE</a>
        </section>
      </main>
      <Footer />
    </>
  );
}
