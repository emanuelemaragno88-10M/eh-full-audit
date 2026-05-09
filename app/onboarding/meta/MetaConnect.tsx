'use client';
import { useState } from 'react';

export default function MetaConnect({ auditId, hasToken, error }: { auditId: string; hasToken: boolean; error?: string }) {
  const [busy, setBusy] = useState(false);
  function start() {
    setBusy(true);
    window.location.href = `/api/auth/meta?audit_id=${encodeURIComponent(auditId)}`;
  }
  function skip() {
    setBusy(true);
    window.location.href = `/onboarding/generating?audit_id=${encodeURIComponent(auditId)}`;
  }
  return (
    <div>
      {hasToken && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-success/10 border border-success/30 text-sm text-success">
          ✓ Meta account already connected
        </div>
      )}
      {error && <div className="mb-4 px-4 py-3 rounded-lg bg-critical/10 border border-critical/30 text-sm text-critical">{error}</div>}
      <button onClick={start} disabled={busy} className="w-full btn font-semibold text-base px-5 py-4 bg-[#1877F2] text-white hover:bg-[#166FE5]">
        {busy ? 'Redirecting…' : hasToken ? 'Reconnect Meta Ads' : 'Connect Meta Ads'}
      </button>
      <button onClick={skip} className="mt-3 w-full text-xs text-muted hover:text-white">
        Skip for now (limited audit only) →
      </button>
    </div>
  );
}
