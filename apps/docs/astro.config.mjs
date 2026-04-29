import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://drm-multitabs.dev",
  output: "static",
  integrations: [vue(), react()],
  vite: {
    resolve: {
      dedupe: ["react", "react-dom", "react-router-dom"],
    },
    optimizeDeps: {
      include: ["react-router-dom", "@drobinetm/multitabs-vue", "vue-router"],
      exclude: ["@drobinetm/multitabs-react"],
    },
  },
});
