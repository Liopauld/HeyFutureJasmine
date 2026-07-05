import { Anchor } from "lucide-react";

/** Centered parchment card for the auth screens. */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-var(--nav-h)-8rem)] w-full max-w-md animate-fade-up flex-col justify-center">
      <header className="mb-8 text-center">
        <h1 className="font-display text-3xl text-gold">{title}</h1>
        {subtitle ? <p className="mt-1 text-text-secondary">{subtitle}</p> : null}
      </header>
      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute -top-5 left-1/2 z-10 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_32%_30%,#ff6b6b,#c92a2a_62%)] shadow-[0_4px_14px_rgba(201,42,42,0.45),inset_0_2px_0_rgba(255,255,255,0.18)]"
        >
          <Anchor className="h-5 w-5 text-white/90" />
        </div>
        <div className="parchment rounded-3xl p-6 pt-9">{children}</div>
      </div>
      {footer ? <div className="mt-4 text-center text-sm text-text-secondary">{footer}</div> : null}
    </div>
  );
}

/** Primary submit button for auth forms. */
export function AuthSubmit({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 w-full rounded-full bg-straw-red px-5 py-3 font-medium text-white transition hover:brightness-110 disabled:opacity-60"
    >
      {loading ? "Charting the course…" : children}
    </button>
  );
}
