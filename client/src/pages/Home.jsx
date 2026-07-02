import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="grid gap-10 lg:grid-cols-2">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-text-muted">Seal your treasure</p>
        <h1 className="mt-4 font-display text-5xl text-gold md:text-6xl">Seal your words. Let the tides carry them.</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Write a letter to your future self or a nakama. Lock it. Set your destination. We will deliver it when the time is right.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 items-center">
          <Link to="/write" className="wax-seal pulse text-white">
            SEAL & SET SAIL
          </Link>
          <Link to="/noticeboard" className="rounded-full border border-gold px-6 py-3 text-gold transition hover:bg-gold hover:text-ocean">
            Explore the Noticeboard
          </Link>
        </div>
      </div>

      <div className="relative rounded-3xl border border-grand-line treasure-hero p-8 shadow-glow">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(245,197,24,0.4),_transparent_60%)]" />
        <div className="relative">
          <h2 className="font-display text-3xl text-gold">Treasure Letters</h2>
          <p className="mt-3 text-text-secondary">
            Each letter becomes a locked chest traveling the Grand Line of time. When the date arrives, the chest washes ashore and opens.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {["Write", "Seal & Set Sail", "Discover Your Treasure"].map((title) => (
              <div key={title} className="rounded-2xl border border-grand-line/80 bg-deep-sea/70 p-4">
                <p className="text-sm text-text-muted">{title}</p>
                <p className="mt-2 text-sm text-text-secondary">Chart your destination and let the tides deliver your message.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
