import { useParams } from "react-router-dom";

export default function TreasureChest() {
  const { id, token } = useParams();

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-gold">Treasure Chest</h1>
        <p className="text-text-secondary">Unlocking {id || token}</p>
      </header>
      <div className="rounded-3xl parchment-area p-6 text-ink">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-ink">Chest status</p>
          <span className="rounded-full border border-gold px-3 py-1 text-xs text-gold">Sealed</span>
        </div>
        <p className="mt-4 font-serif text-lg">
          The reveal animation and letter content will appear here once unlocked.
        </p>
        <div className="mt-6 h-2 w-full rounded-full bg-parchment-dark">
          <div className="h-full w-1/4 rounded-full bg-gold" />
        </div>
      </div>
    </section>
  );
}
