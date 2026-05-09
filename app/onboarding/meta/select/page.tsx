import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressSteps from '@/components/ProgressSteps';
import { getAudit } from '@/lib/audit';
import { fetchAdAccounts } from '@/lib/meta';
import SelectAccount from './SelectAccount';

export const dynamic = 'force-dynamic';

export default async function SelectAdAccount({ searchParams }: { searchParams: { audit_id?: string } }) {
  const auditId = searchParams.audit_id;
  const audit = auditId ? await getAudit(auditId) : null;
  if (!audit || !audit.metaToken) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-5 py-16 text-center">
          <ProgressSteps current="meta" />
          <div className="card p-8">
            <h1 className="text-2xl font-bold mb-3">Meta not connected</h1>
            <a href={`/onboarding/meta?audit_id=${auditId || ''}`} className="btn-primary">Connect Meta first</a>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  let accounts: any[] = [];
  let loadError: string | null = null;
  try { accounts = await fetchAdAccounts(audit.metaToken); }
  catch (e: any) { loadError = e.message; }

  return (
    <>
      <Header />
      <main className="max-w-xl mx-auto px-5 py-12">
        <ProgressSteps current="meta" />
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Select an ad account</h1>
          <p className="text-sm text-muted-strong mb-6">Choose the Meta Ads account you want audited.</p>
          {loadError && <div className="mb-4 px-4 py-3 rounded-lg bg-critical/10 border border-critical/30 text-sm text-critical">{loadError}</div>}
          <SelectAccount auditId={audit.id} accounts={accounts} />
        </div>
      </main>
      <Footer />
    </>
  );
}
