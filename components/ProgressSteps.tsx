type Step = 'verify' | 'shopify' | 'meta' | 'audit';

const STEPS: { key: Step; label: string }[] = [
  { key: 'verify', label: 'Verify' },
  { key: 'shopify', label: 'Shopify' },
  { key: 'meta', label: 'Meta' },
  { key: 'audit', label: 'Audit' },
];

export default function ProgressSteps({ current }: { current: Step }) {
  const idx = STEPS.findIndex(s => s.key === current);
  return (
    <ol className="flex items-center justify-center gap-2 sm:gap-3 mb-10 flex-wrap">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        const dotClass = done ? 'bg-gold border-gold text-bg' : active ? 'bg-accent border-accent text-white' : 'bg-card border-border text-muted';
        const labelClass = done || active ? 'text-white' : 'text-muted';
        return (
          <li key={s.key} className="flex items-center gap-2 sm:gap-3">
            <div className={`w-7 h-7 rounded-full border flex items-center justify-center text-xs font-bold ${dotClass}`}>
              {done ? '✓' : i + 1}
            </div>
            <span className={`text-xs sm:text-sm font-medium ${labelClass}`}>{s.label}</span>
            {i < STEPS.length - 1 && <div className={`w-6 sm:w-10 h-px ${done ? 'bg-gold' : 'bg-border'}`} />}
          </li>
        );
      })}
    </ol>
  );
}
