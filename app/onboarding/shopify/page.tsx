import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProgressSteps from '@/components/ProgressSteps';
import { getAudit } from '@/lib/audit';
import ShopifyForm from './ShopifyForm';

export const dynamic = 'force-dynamic';

export default async function ShopifyConnectPage({ searchParams }: { searchParams: { audit_id?: string; error?: string } }) {
  const auditId = searchParams.audit_id;
  const audit = auditId ? await getAudit(auditId) : null;

  if (!audit) {
    return (
      <>
        <Header />
        <main className="max-w-xl mx-auto px-5 py-16 text-center">
          <ProgressSteps current="shopify" />
          <div className="card p-8">
            <h1 className="text-2xl font-bold mb-3">Session not found</h1>
            <p className="text-muted-strong mb-6">Please complete the verification step first.</p>
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
        <ProgressSteps current="shopify" />
        <div className="card p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Connect your Shopify store</h1>
          <p className="text-sm text-muted-strong mb-6">Read-only access to your products, orders, and customers. We never write data back.</p>
          <ShopifyForm auditId={audit.id} initialShop={audit.shopifyStore || ''} error={searchParams.error} />
          <ul className="mt-8 space-y-2 text-xs text-muted">
            <li>✓ Read-only — we never modify your store</li>
            <li>✓ Standard Shopify OAuth — no app to install</li>
            <li>✓ Disconnect anytime in Shopify settings</li>
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
