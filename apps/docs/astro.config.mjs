import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://drm-multitabs.dev",
  output: "static",
  integrations: [vue(), react()],
  vite: {
    optimizeDeps: {
      include: [
        "react-router-dom",
        "@drm/multitabs-react",
        "@drm/multitabs-vue",
        "vue-router",
      ],
    },
  },
});
