import EmptyState from "../components/common/EmptyState.jsx";

export default function CaptainsLog() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-gold">Captain's Log</h1>
        <p className="text-text-secondary">Track sealed letters and treasures that have washed ashore.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        {["Sealed", "Delivered", "Bounty"].map((label) => (
          <div key={label} className="map-card rounded-3xl border border-grand-line p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-text-muted">{label}</p>
            <p className="mt-2 font-display text-2xl text-gold">--</p>
            <p className="text-xs text-text-secondary">Log updates once your letters sail.</p>
          </div>
        ))}
      </div>
      <EmptyState
        title="Your log is empty, Captain."
        description="Set sail on your first adventure by sealing a treasure letter."
      />
    </section>
  );
}
