import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressSteps from '@/components/ProgressSteps';
import { getAudit } from '@/lib/audit';
import GeneratingClient from './GeneratingClient';

export const dynamic = 'force-dynamic';

export default async function GeneratingPage({ searchParams }: { searchParams: { audit_id?: string } }) {
  const auditId = searchParams.audit_id;
  const audit = auditId ? await getAudit(auditId) : null;
  if (!audit) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-5 py-16 text-center">
          <ProgressSteps current="audit" />
          <div className="card p-8">
            <h1 className="text-2xl font-bold mb-3">Session not found</h1>
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
        <ProgressSteps current="audit" />
        <GeneratingClient auditId={audit.id} initialStatus={audit.status} />
      </main>
      <Footer />
    </>
  );
}
