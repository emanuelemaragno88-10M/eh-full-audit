'use client';
import { useEffect, useRef, useState } from 'react';

const STEPS = [
  'Pulling Shopify data…',
  'Pulling Meta Ads data…',
  'Analyzing performance…',
  'Generating recommendations…',
  'Building your report…',
  'Sending to your email…',
];

export default function GeneratingClient({ auditId, initialStatus }: { auditId: string; initialStatus: string }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // Kick off generation (idempotent server-side if already running)
    fetch('/api/audit/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auditId }),
    }).catch(e => setError(e.message));

    // Poll status
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/audit/${auditId}/status`);
        if (!res.ok) return;
        const j = await res.json();
        setStatus(j.status);
        if (typeof j.step === 'number') setStepIndex(Math.min(j.step, STEPS.length - 1));
        if (j.status === 'complete') {
          clearInterval(t);
          setStepIndex(STEPS.length - 1);
          setTimeout(() => { window.location.href = `/audit/${auditId}`; }, 1200);
        } else if (j.status === 'failed') {
          clearInterval(t);
          setError(j.error || 'Generation failed');
        }
      } catch {}
    }, 1500);

    return () => clearInterval(t);
  }, [auditId]);

  if (error) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-bold mb-3 text-critical">Something went wrong</h1>
        <p className="text-muted-strong mb-6">{error}</p>
        <a href={`/onboarding/shopify?audit_id=${auditId}`} className="btn-primary">Try again</a>
      </div>
    );
  }

  const complete = status === 'complete';

  return (
    <div className="card p-6 sm:p-10 text-center">
      <div className="flex justify-center mb-6">
        {complete ? (
          <div className="w-16 h-16 rounded-full bg-success text-white text-3xl flex items-center justify-center">✓</div>
        ) : (
          <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4 }} />
        )}
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">
        {complete ? 'Your audit is ready!' : 'Generating your Full Funnel Audit…'}
      </h1>
      <p className="text-sm text-muted-strong mb-8">
        {complete ? 'Redirecting to your report.' : 'This usually takes 1–3 minutes. We will email you when it is done.'}
      </p>
      <ol className="text-left max-w-sm mx-auto space-y-2 mb-6">
        {STEPS.map((s, i) => {
          const done = i < stepIndex || complete;
          const active = i === stepIndex && !complete;
          return (
            <li key={i} className={`flex items-center gap-3 text-sm ${done ? 'text-muted line-through' : active ? 'text-white' : 'text-muted/60'}`}>
              <span className={`w-5 inline-flex justify-center ${done ? 'text-success' : active ? 'text-accent' : ''}`}>
                {done ? '✓' : active ? '●' : '○'}
              </span>
              <span>{s}</span>
            </li>
          );
        })}
      </ol>
      {complete && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={`/audit/${auditId}`} className="btn-primary">View Audit Report</a>
          <a href="#" className="btn-secondary">Check your email</a>
        </div>
      )}
    </div>
  );
}
