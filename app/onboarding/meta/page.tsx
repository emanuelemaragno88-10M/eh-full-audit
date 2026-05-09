import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressSteps from '@/components/ProgressSteps';
import { getAudit } from '@/lib/audit';
import MetaConnect from './MetaConnect';

export const dynamic = 'force-dynamic';

export default async function MetaConnectPage({ searchParams }: { searchParams: { audit_id?: string; error?: string } }) {
  const auditId = searchParams.audit_id;
  const audit = auditId ? await getAudit(auditId) : null;

  if (!audit) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-5 py-16 text-center">
          <ProgressSteps current="meta" />
          <div className="card p-8">
            <h1 className="text-2xl font-bold mb-3">Session not found</h1>
            <p className="text-muted-strong mb-6">Please complete the previous steps first.</p>
            <a href="/" className="btn-primary">Start over</a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-5 py-12">
        <ProgressSteps current="meta" />
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Connect your Meta Ads account</h1>
          <p className="text-sm text-muted-strong mb-6">Read-only access to your campaigns, ads, and insights from the last 30 days.</p>
          <MetaConnect auditId={audit.id} hasToken={!!audit.metaToken} error={searchParams.error} />
          <ul className="mt-8 space-y-2 text-xs text-muted">
            <li>✓ Read-only — we never modify your ads</li>
            <li>✓ Permissions: ads_read, business_management</li>
            <li>✓ Disconnect anytime in your Facebook settings</li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
