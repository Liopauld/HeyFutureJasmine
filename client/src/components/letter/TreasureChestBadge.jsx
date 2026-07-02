export default function TreasureChestBadge({ daysRemaining }) {
  const isSoon = daysRemaining <= 7;
  const label = isSoon ? "Opening soon!" : `Opens in ${daysRemaining} days`;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase ${
        isSoon ? "border-gold text-gold shadow-glow" : "border-sealed text-sealed"
      }`}
    >
      {label}
    </span>
  );
}
