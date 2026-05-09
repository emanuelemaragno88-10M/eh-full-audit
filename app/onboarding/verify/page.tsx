import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressSteps from '@/components/ProgressSteps';
import { getAuditByOrderId, createAudit } from '@/lib/audit';
import { redirect } from 'next/navigation';
import VerifyForm from './VerifyForm';

export const dynamic = 'force-dynamic';

export default async function VerifyPage({ searchParams }: { searchParams: { order_id?: string; email?: string; audit_id?: string } }) {
  const { order_id, email, audit_id } = searchParams;

  let audit = null;
  if (audit_id) {
    const { getAudit } = await import('@/lib/audit');
    audit = await getAudit(audit_id);
  } else if (order_id) {
    audit = await getAuditByOrderId(order_id);
    // Dev fallback: if no CopeCart webhook fired yet but we have order_id+email, create a placeholder
    if (!audit && email && process.env.COPECART_IPN_SECRET == null) {
      audit = await createAudit(email, order_id);
    }
  }

  if (!audit) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-5 py-16 text-center">
          <ProgressSteps current="verify" />
          <div className="card p-8">
            <h1 className="text-2xl font-bold mb-3">Order not found</h1>
            <p className="text-muted-strong mb-6">We could not find a paid order with that reference. Please complete your purchase first.</p>
            <a href="/" className="btn-primary">Back to checkout</a>
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
        <ProgressSteps current="verify" />
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Verify your contact details</h1>
          <p className="text-sm text-muted-strong mb-6">We will send a 6-digit code to your phone to confirm before connecting your accounts.</p>
          <VerifyForm
            auditId={audit.id}
            initialEmail={audit.email || email || ''}
            initialFirstName={audit.firstName || ''}
            initialLastName={audit.lastName || ''}
            initialPhone={audit.phone || ''}
          />
        </div>
      </main>
      <Footer />
    </>
  );
}
