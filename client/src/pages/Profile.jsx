export default function Profile() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-gold">Wanted Poster</h1>
        <p className="text-text-secondary">Customize your pirate title and bounty.</p>
      </header>
      <div className="wanted-poster rounded-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-ink">WANTED</p>
        <h2 className="mt-2 font-display text-4xl text-ink">Captain Jasmine</h2>
        <p className="mt-2 text-ink">Pirate Title: Rookie Pirate</p>
        <p className="text-ink">Bounty: 0</p>
        <div className="mt-4 rounded-2xl border border-parchment-dark bg-parchment p-4">
          <p className="text-sm text-ink">Profile settings and crew management will appear here.</p>
        </div>
      </div>
    </section>
  );
}
