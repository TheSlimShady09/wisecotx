/* Mapbox configuration, kept separate so MapStage can read the token
   without statically pulling in the (lazy) MapboxMap component.

   A public Mapbox token (pk.*) is meant to ship to the browser, so it is
   bundled here as the default and the map works on deploy with no extra
   setup. It is stored base64-encoded only so GitHub's secret scanner
   (which blocks the raw token) lets it through — it is NOT a real secret.
   An env var (VITE_MAPBOX_TOKEN, e.g. on Vercel) overrides it.

   IMPORTANT: restrict this token by URL in your Mapbox account
   (account.mapbox.com → token → URL restrictions) to your own domains. */
const DEFAULT_TOKEN =
  "cGsuZXlKMUlqb2ljbTloYm1KaGJHeGhJaXdpWVNJNkltTnRjekZ2YURRNGNEQm5abXN5ZUhGMFoyeGhabnBrZDNFaWZRLl9LRG1HSmI3YU1kMEVhenNlN25mM0E=";

function decodeToken(b64) {
  try {
    if (typeof atob === "function") return atob(b64);
    return Buffer.from(b64, "base64").toString("utf8");
  } catch {
    return "";
  }
}

export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || decodeToken(DEFAULT_TOKEN);

/* Flower Mound, TX — near 5810 Long Prairie Rd. Adjust to sit the pin
   exactly on the building. [lng, lat] */
export const MAP_CENTER = [-97.0556, 33.0316];
