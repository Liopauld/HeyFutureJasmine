export function detectProvider(url = "") {
  const u = url.toLowerCase();
  if (u.includes("spotify.com") || u.startsWith("spotify:")) return "spotify";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("music.apple.com")) return "apple";
  return "other";
}

export function spotifyEmbed(url) {
  const m = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}` : null;
}

export function youtubeId(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.searchParams.get("v")) return u.searchParams.get("v");
    const m = u.pathname.match(/\/embed\/([A-Za-z0-9_-]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

/** An embeddable iframe URL for a saved song, or null if not embeddable. */
export function songEmbedUrl(song) {
  if (!song?.url) return null;
  const provider = song.provider || detectProvider(song.url);
  if (provider === "spotify") return spotifyEmbed(song.url);
  if (provider === "youtube") {
    const id = youtubeId(song.url);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  return null;
}

export const PROVIDER_LABEL = {
  spotify: "Spotify",
  youtube: "YouTube",
  apple: "Apple Music",
  other: "Link"
};
