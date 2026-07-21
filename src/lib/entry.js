const SEEN_KEY = "wcg:entered";

/**
 * Has the visitor already been through the entry gate this session?
 * Must be safe to call during SSR, and must not throw when storage is
 * blocked (private mode, embedded webviews).
 */
export function hasEnteredBefore() {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false; // storage blocked: show the gate, just do not remember
  }
}

export function rememberEntry() {
  try {
    window.sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* storage blocked — the gate simply shows again next visit */
  }
}
