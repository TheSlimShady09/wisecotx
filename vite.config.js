import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // three.js and mapbox-gl are large, but both are dynamically imported
    // (the 3D houses and the map load on demand, not on first paint), so
    // the size warning is noise. Lift it above the mapbox-gl chunk.
    chunkSizeWarningLimit: 2000,
  },
});
