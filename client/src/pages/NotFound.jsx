import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="space-y-6 text-center">
      <h1 className="font-display text-4xl text-gold">Lost at Sea</h1>
      <p className="text-text-secondary">This chart does not lead anywhere, Captain.</p>
      <Link to="/" className="inline-block rounded-full bg-gold px-6 py-2 text-ocean">
        Return to Port
      </Link>
    </section>
  );
}
