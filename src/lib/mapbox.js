/* Mapbox configuration, kept separate so MapStage can read the token
   without statically pulling in the (lazy) MapboxMap component.

   Set the token in .env.local:  VITE_MAPBOX_TOKEN=pk.your_token_here
   A public Mapbox token is meant to ship to the browser — restrict it
   by URL in your Mapbox account. */
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || "";

/* Flower Mound, TX — near 5810 Long Prairie Rd. Adjust to sit the pin
   exactly on the building. [lng, lat] */
export const MAP_CENTER = [-97.0556, 33.0316];
