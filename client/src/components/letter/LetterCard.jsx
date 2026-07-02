export default function LetterCard({ letter }) {
  return (
    <div className="map-card rounded-2xl border border-grand-line p-5 transition hover:border-gold">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text-muted">To: {letter.recipientName || letter.recipientEmail}</p>
          <h4 className="mt-1 font-display text-xl text-gold">{letter.subject}</h4>
        </div>
        <span className="rounded-full bg-sealed/20 px-3 py-1 text-xs uppercase text-sealed">
          {letter.status}
        </span>
      </div>
      <p className="mt-3 text-sm text-text-secondary">{letter.preview}</p>
    </div>
  );
}
