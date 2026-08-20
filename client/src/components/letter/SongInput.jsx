import { Music, X } from "lucide-react";
import { detectProvider, PROVIDER_LABEL } from "../../lib/song.js";

export default function SongInput({ song, onChange }) {
  const url = song?.url || "";
  const provider = url ? detectProvider(url) : null;

  const update = (patch) => {
    const next = { url, title: song?.title || "", artist: song?.artist || "", ...patch };
    if (!next.url) return onChange(null);
    onChange({ ...next, provider: detectProvider(next.url) });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-xl border border-grand-line bg-ocean/50 px-3 py-2">
        <Music className="h-4 w-4 shrink-0 text-text-muted" />
        <input
          value={url}
          onChange={(e) => update({ url: e.target.value })}
          placeholder="Paste a Spotify, YouTube, or Apple Music link…"
          className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        {url ? (
          <>
            <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-medium text-gold">
              {PROVIDER_LABEL[provider]}
            </span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="shrink-0 text-text-muted hover:text-straw-red"
              aria-label="Clear song"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : null}
      </div>
      {url ? (
        <div className="grid grid-cols-2 gap-2">
          <input
            value={song?.title || ""}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="Song title (optional)"
            className="rounded-lg border border-grand-line bg-ocean/50 px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-gold/50 focus:outline-none"
          />
          <input
            value={song?.artist || ""}
            onChange={(e) => update({ artist: e.target.value })}
            placeholder="Artist (optional)"
            className="rounded-lg border border-grand-line bg-ocean/50 px-3 py-1.5 text-sm text-text-primary placeholder:text-text-muted focus:border-gold/50 focus:outline-none"
          />
        </div>
      ) : null}
    </div>
  );
}
