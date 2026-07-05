import { Music } from "lucide-react";
import { songEmbedUrl, detectProvider, PROVIDER_LABEL } from "../../lib/song.js";

/** Renders a saved song as an embedded player (Spotify/YouTube) or a link chip. */
export default function SongEmbed({ song }) {
  if (!song?.url) return null;
  const embed = songEmbedUrl(song);
  const provider = song.provider || detectProvider(song.url);

  if (embed) {
    const isSpotify = provider === "spotify";
    return (
      <iframe
        src={embed}
        title="A song for this moment"
        loading="lazy"
        className="w-full rounded-xl border border-grand-line"
        height={isSpotify ? 152 : 200}
        allow="encrypted-media; clipboard-write; autoplay; fullscreen; picture-in-picture"
      />
    );
  }

  return (
    <a
      href={song.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-xl border border-grand-line bg-ocean/50 px-4 py-3 text-sm text-text-secondary transition hover:border-gold hover:text-gold"
    >
      <Music className="h-4 w-4 text-gold" />
      <span className="truncate">
        {song.title || "Play the song"}
        {song.artist ? ` · ${song.artist}` : ""}
      </span>
      <span className="ml-auto shrink-0 text-xs text-text-muted">{PROVIDER_LABEL[provider]}</span>
    </a>
  );
}
