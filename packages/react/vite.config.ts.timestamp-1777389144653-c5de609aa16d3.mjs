// vite.config.ts
import { defineConfig } from "file:///media/diovi/DATOS/PROJECTS/MINE/GitHub/libraries/drm-multitabs-component/node_modules/.pnpm/vite@5.4.21_less@4.6.4_sass@1.99.0/node_modules/vite/dist/node/index.js";
import react from "file:///media/diovi/DATOS/PROJECTS/MINE/GitHub/libraries/drm-multitabs-component/node_modules/.pnpm/@vitejs+plugin-react@4.7.0_vite@5.4.21_less@4.6.4_sass@1.99.0_/node_modules/@vitejs/plugin-react/dist/index.js";
import dts from "file:///media/diovi/DATOS/PROJECTS/MINE/GitHub/libraries/drm-multitabs-component/node_modules/.pnpm/vite-plugin-dts@3.9.1_rollup@4.60.1_typescript@5.9.3_vite@5.4.21_less@4.6.4_sass@1.99.0_/node_modules/vite-plugin-dts/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "/media/diovi/DATOS/PROJECTS/MINE/GitHub/libraries/drm-multitabs-component/packages/react";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src/**/*.ts", "src/**/*.tsx"],
      outDir: "dist",
      tsconfigPath: "./tsconfig.json"
    })
  ],
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "DrmMultitabsReact",
      formats: ["es", "cjs"],
      fileName: (format) => `index.${format === "es" ? "es" : "cjs"}.js`
    },
    rollupOptions: {
      external: ["react", "react-dom", "react-router-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react-router-dom": "ReactRouterDom"
        },
        assetFileNames: "style.css"
      }
    },
    cssCodeSplit: false
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbWVkaWEvZGlvdmkvREFUT1MvUFJPSkVDVFMvTUlORS9HaXRIdWIvbGlicmFyaWVzL2RybS1tdWx0aXRhYnMtY29tcG9uZW50L3BhY2thZ2VzL3JlYWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvbWVkaWEvZGlvdmkvREFUT1MvUFJPSkVDVFMvTUlORS9HaXRIdWIvbGlicmFyaWVzL2RybS1tdWx0aXRhYnMtY29tcG9uZW50L3BhY2thZ2VzL3JlYWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9tZWRpYS9kaW92aS9EQVRPUy9QUk9KRUNUUy9NSU5FL0dpdEh1Yi9saWJyYXJpZXMvZHJtLW11bHRpdGFicy1jb21wb25lbnQvcGFja2FnZXMvcmVhY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IGR0cyBmcm9tIFwidml0ZS1wbHVnaW4tZHRzXCI7XG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSBcInBhdGhcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgZHRzKHtcbiAgICAgIGluY2x1ZGU6IFtcInNyYy8qKi8qLnRzXCIsIFwic3JjLyoqLyoudHN4XCJdLFxuICAgICAgb3V0RGlyOiBcImRpc3RcIixcbiAgICAgIHRzY29uZmlnUGF0aDogXCIuL3RzY29uZmlnLmpzb25cIixcbiAgICB9KSxcbiAgXSxcbiAgYnVpbGQ6IHtcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgXCJzcmMvaW5kZXgudHNcIiksXG4gICAgICBuYW1lOiBcIkRybU11bHRpdGFic1JlYWN0XCIsXG4gICAgICBmb3JtYXRzOiBbXCJlc1wiLCBcImNqc1wiXSxcbiAgICAgIGZpbGVOYW1lOiAoZm9ybWF0KSA9PiBgaW5kZXguJHtmb3JtYXQgPT09IFwiZXNcIiA/IFwiZXNcIiA6IFwiY2pzXCJ9LmpzYCxcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiLCBcInJlYWN0LXJvdXRlci1kb21cIiwgXCJyZWFjdC9qc3gtcnVudGltZVwiXSxcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgcmVhY3Q6IFwiUmVhY3RcIixcbiAgICAgICAgICBcInJlYWN0LWRvbVwiOiBcIlJlYWN0RE9NXCIsXG4gICAgICAgICAgXCJyZWFjdC1yb3V0ZXItZG9tXCI6IFwiUmVhY3RSb3V0ZXJEb21cIixcbiAgICAgICAgfSxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IFwic3R5bGUuY3NzXCIsXG4gICAgICB9LFxuICAgIH0sXG4gICAgY3NzQ29kZVNwbGl0OiBmYWxzZSxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBcIkBcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwic3JjXCIpLFxuICAgIH0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMGIsU0FBUyxvQkFBb0I7QUFDdmQsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sU0FBUztBQUNoQixTQUFTLGVBQWU7QUFIeEIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sSUFBSTtBQUFBLE1BQ0YsU0FBUyxDQUFDLGVBQWUsY0FBYztBQUFBLE1BQ3ZDLFFBQVE7QUFBQSxNQUNSLGNBQWM7QUFBQSxJQUNoQixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUN4QyxNQUFNO0FBQUEsTUFDTixTQUFTLENBQUMsTUFBTSxLQUFLO0FBQUEsTUFDckIsVUFBVSxDQUFDLFdBQVcsU0FBUyxXQUFXLE9BQU8sT0FBTyxLQUFLO0FBQUEsSUFDL0Q7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxTQUFTLGFBQWEsb0JBQW9CLG1CQUFtQjtBQUFBLE1BQ3hFLFFBQVE7QUFBQSxRQUNOLFNBQVM7QUFBQSxVQUNQLE9BQU87QUFBQSxVQUNQLGFBQWE7QUFBQSxVQUNiLG9CQUFvQjtBQUFBLFFBQ3RCO0FBQUEsUUFDQSxnQkFBZ0I7QUFBQSxNQUNsQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLGNBQWM7QUFBQSxFQUNoQjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxJQUMvQjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
