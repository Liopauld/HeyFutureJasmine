import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../lib/api.js";

export default function Noticeboard() {
  const [letters, setLetters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadLetters = async () => {
      try {
        const { data } = await api.get("/letters/public");
        if (isMounted) {
          setLetters(data.letters || []);
        }
      } catch {
        toast.error("Taken by the sea...");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadLetters();
    return () => {
      isMounted = false;
    };
  }, []);

  const likeLetter = async (id) => {
    try {
      const { data } = await api.post(`/letters/${id}/like`);
      setLetters((current) => current.map((letter) => (letter._id === id ? { ...letter, likes: data.likes } : letter)));
    } catch {
      toast.error("The tide blocked that trident strike.");
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="font-display text-3xl text-gold">Pirate's Noticeboard</h1>
        <p className="text-text-secondary">Anonymous treasures shared by fellow captains.</p>
      </header>

      {isLoading ? (
        <p className="text-text-secondary">Charting the course...</p>
      ) : (
        <div className="columns-1 gap-4 md:columns-2">
          {letters.map((letter) => (
            <article
              key={letter._id}
              className="map-card mb-4 break-inside-avoid rounded-3xl border border-grand-line p-6"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-text-muted">From: {letter.publicAuthor}</p>
              <h3 className="mt-2 font-display text-xl text-gold">{letter.subject}</h3>
              <p className="mt-3 text-sm text-text-secondary">{letter.preview}</p>
              <button
                type="button"
                onClick={() => likeLetter(letter._id)}
                className="mt-4 rounded-full border border-gold px-4 py-2 text-sm text-gold transition hover:bg-gold hover:text-ocean"
              >
                🔱 {letter.likes || 0}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
