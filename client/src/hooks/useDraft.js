import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Keeps an unfinished letter on the desk. A long letter lives only in component
 * state until it's sealed, so a stray back-button or a closed tab used to take it
 * with them. Saves are debounced and per-user; nothing is restored without asking.
 */
const PREFIX = "hfj:draft:";
const DEBOUNCE_MS = 800;

const keyFor = (userId) => `${PREFIX}${userId || "anon"}`;

function readDraft(userId) {
  try {
    const raw = window.localStorage.getItem(keyFor(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * @param {string} userId  scopes the draft to whoever is signed in
 * @param {boolean} enabled  false in edit mode — an existing chest isn't a draft
 * @returns {{ saved: object|null, save: Function, clear: Function, dismiss: Function }}
 *   `saved` is whatever was on disk at mount (null if nothing), for the restore strip.
 */
export function useDraft(userId, enabled = true) {
  // Read once at mount: later saves shouldn't retrigger the restore prompt.
  const [saved, setSaved] = useState(() => (enabled ? readDraft(userId) : null));
  const timer = useRef(null);

  const clear = useCallback(() => {
    window.clearTimeout(timer.current);
    try {
      window.localStorage.removeItem(keyFor(userId));
    } catch {
      /* storage disabled or full — nothing to clean up */
    }
    setSaved(null);
  }, [userId]);

  const save = useCallback(
    (draft) => {
      if (!enabled) return;
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => {
        try {
          window.localStorage.setItem(keyFor(userId), JSON.stringify(draft));
        } catch {
          /* over quota — the letter is still safe in component state */
        }
      }, DEBOUNCE_MS);
    },
    [enabled, userId]
  );

  // Hide the restore strip without throwing the draft away.
  const dismiss = useCallback(() => setSaved(null), []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return { saved, save, clear, dismiss };
}

/** Warn before a tab close while there are unsaved words. */
export function useUnloadGuard(active) {
  useEffect(() => {
    if (!active) return undefined;
    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [active]);
}
