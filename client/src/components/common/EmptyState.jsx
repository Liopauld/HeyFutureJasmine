export default function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-2xl border border-grand-line bg-deep-sea/60 p-8 text-center">
      <h3 className="font-display text-2xl text-gold">{title}</h3>
      <p className="mt-2 text-text-secondary">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
