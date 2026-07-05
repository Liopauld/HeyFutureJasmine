/**
 * A sea route from port (⚓) to destination island (🏝️) with a ship at `progress`
 * (0 = just sealed, 1 = arrived). Reused on the compose preview and the dashboard.
 */
export default function GrandLineRoute({ progress = 0, label }) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <div>
      <div className="relative h-12">
        <div className="absolute left-3 right-5 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-gold/25" />
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 border-t-2 border-gold/80"
          style={{ width: `calc(${pct}% - 12px)` }}
        />
        {[25, 50, 75].map((m) => (
          <span
            key={m}
            className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-grand-line"
            style={{ left: `${m}%` }}
          />
        ))}
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm">⚓</span>
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-lg">🏝️</span>
        <span
          className="absolute top-1/2 -translate-x-1/2 -translate-y-[135%] text-lg animate-bob"
          style={{ left: `${pct}%` }}
          aria-hidden="true"
        >
          ⛵
        </span>
      </div>
      {label ? <p className="text-center text-xs text-text-secondary">{label}</p> : null}
    </div>
  );
}
