/** The signature "seal & set sail" CTA — red wax seal, idle pulse, compass while loading. */
export default function WaxSealButton({ children, loading = false, className = "", ...props }) {
  const disabled = loading || props.disabled;
  return (
    <button
      {...props}
      disabled={disabled}
      className={`wax-seal justify-center text-sm uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-70 ${
        loading ? "cursor-wait" : "animate-wax-pulse"
      } ${className}`}
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin-slow" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="4" opacity="0.4" />
            <polygon points="50,8 58,50 50,42 42,50" fill="currentColor" />
          </svg>
          Charting the course…
        </>
      ) : (
        children
      )}
    </button>
  );
}
