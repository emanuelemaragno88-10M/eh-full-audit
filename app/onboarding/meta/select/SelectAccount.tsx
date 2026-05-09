'use client';
import { useState } from 'react';

export default function SelectAccount({ auditId, accounts }: { auditId: string; accounts: Array<{ id: string; name: string }> }) {
  const [selected, setSelected] = useState(accounts[0]?.id || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!selected) { setError('Pick an ad account.'); return; }
    setBusy(true); setError(null);
    try {
      const res = await fetch('/api/auth/meta/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditId, adAccountId: selected }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to save selection');
      }
      window.location.href = `/onboarding/generating?audit_id=${encodeURIComponent(auditId)}`;
    } catch (e: any) {
      setError(e.message); setBusy(false);
    }
  }

  if (!accounts.length) {
    return <div className="text-sm text-muted-strong">No ad accounts found on this Facebook account.</div>;
  }

  return (
    <div>
      <div className="space-y-2 mb-5">
        {accounts.map(a => (
          <label key={a.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${selected === a.id ? 'border-accent bg-accent/10' : 'border-border bg-bg hover:border-muted'}`}>
            <input type="radio" name="ad-account" checked={selected === a.id} onChange={() => setSelected(a.id)} className="accent-accent" />
            <div className="flex-1">
              <div className="text-sm font-semibold">{a.name}</div>
              <div className="text-xs text-muted">{a.id}</div>
            </div>
          </label>
        ))}
      </div>
      {error && <div className="mb-4 text-sm text-critical">{error}</div>}
      <button onClick={submit} disabled={busy} className="btn-primary w-full">
        {busy ? 'Saving…' : 'Continue'}
      </button>
    </div>
  );
}
