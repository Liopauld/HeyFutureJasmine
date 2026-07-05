/** A slowly spinning compass rose — used for loading states ("Charting the course..."). */
export default function LoadingCompass({ label = "Charting the course…", full = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 text-text-muted ${
        full ? "min-h-[60vh]" : "py-16"
      }`}
    >
      <svg
        className="h-12 w-12 animate-spin-slow"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="46" stroke="var(--color-gold)" strokeWidth="1.5" opacity="0.5" />
        <circle cx="50" cy="50" r="34" stroke="var(--color-gold)" strokeWidth="0.6" opacity="0.3" />
        <polygon points="50,6 56,48 50,40 44,48" fill="var(--color-gold)" />
        <polygon points="50,94 56,52 50,60 44,52" fill="var(--color-text-secondary)" />
        <polygon points="6,50 48,44 40,50 48,56" fill="var(--color-text-secondary)" />
        <polygon points="94,50 52,44 60,50 52,56" fill="var(--color-gold)" />
        <circle cx="50" cy="50" r="4" fill="var(--color-gold)" />
      </svg>
      {label ? <p className="font-serif italic">{label}</p> : null}
    </div>
  );
}
