/** Labeled input on the parchment surface, used across auth + profile forms. */
export default function Field({ label, className = "", ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink/70">{label}</span>
      <input
        {...props}
        className={`mt-1 w-full rounded-xl border border-parchment-dark bg-white/80 px-4 py-2.5 text-ink placeholder:text-ink/30 focus:border-gold-dark focus:outline-none focus:ring-2 focus:ring-gold/30 ${className}`}
      />
    </label>
  );
}
