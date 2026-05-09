'use client';
import { useState } from 'react';

export default function ShopifyForm({ auditId, initialShop, error }: { auditId: string; initialShop: string; error?: string }) {
  const [shop, setShop] = useState(initialShop);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(error || null);

  function connect(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    let normalized = shop.trim().toLowerCase();
    if (!normalized.endsWith('.myshopify.com')) {
      normalized = normalized.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (!normalized.endsWith('.myshopify.com')) normalized += '.myshopify.com';
    }
    if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(normalized)) {
      setLocalError('Please enter a valid Shopify store URL (e.g. my-store.myshopify.com)');
      return;
    }
    setBusy(true);
    window.location.href = `/api/auth/shopify?shop=${encodeURIComponent(normalized)}&audit_id=${encodeURIComponent(auditId)}`;
  }

  return (
    <form onSubmit={connect} className="space-y-4">
      <div>
        <label className="label">Shopify store URL</label>
        <input
          className="input"
          placeholder="my-store.myshopify.com"
          value={shop}
          onChange={e => setShop(e.target.value)}
          autoFocus
        />
      </div>
      {localError && <div className="text-sm text-critical">{localError}</div>}
      <button type="submit" disabled={busy} className="btn-primary w-full">
        {busy ? 'Redirecting to Shopify…' : 'Connect Shopify'}
      </button>
    </form>
  );
}
