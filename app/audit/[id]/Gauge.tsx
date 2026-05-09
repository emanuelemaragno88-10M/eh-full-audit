const GRADE_COLOR: Record<string, string> = {
  A: '#34d399', B: '#34d399', C: '#fbbf24', D: '#ff9966', F: '#ef4444',
};

export default function Gauge({ grade, score }: { grade: string; score: number }) {
  const r = 70;
  const C = 2 * Math.PI * r;
  const offset = C * (1 - score / 100);
  const color = GRADE_COLOR[grade] || '#c9a84c';
  return (
    <div className="relative w-40 h-40 mx-auto sm:mx-0">
      <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
        <circle cx="80" cy="80" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-extrabold leading-none" style={{ color }}>{grade}</div>
        <div className="text-xs text-muted mt-1 font-medium">{score} / 100</div>
      </div>
    </div>
  );
}
