# @drm/multitabs-vue

## 0.1.6

### Patch Changes

- Fix controlled-mode router synchronization so host-driven `activeTabId`
  updates navigate correctly, and make `storageKey`, `defaultIcon`, and
  `maxTabs` reactive even when they start undefined.
- Refactor the Vue tabs controller into smaller internal modules for tab ID
  generation, route-to-tab resolution, and runtime persistence.
- Add `createScopedStorageKey()` for isolating persisted tab state across user
  sessions, Astro islands, and docs previews, plus development warnings for an
  invalid controlled `activeTabId`.
- Update the Vue docs, README, and Astro demos to document scoped persistence,
  richer icon integration patterns, and more representative island hydration.

## 0.1.5

### Patch Changes

- Improve the Vue multitabs package with a shared store per `storageKey`, a
  configurable `resolveTab` API for route-to-tab mapping, and better keyboard
  accessibility for tabs and menus. Expand the Vue docs and tests to cover the
  new contract and persistence edge cases. Build the package during `prepack` so
  npm publishes always include the generated `dist` artifacts.

## 0.1.1

### Patch Changes

- Fix menu positioning so tab context menus and tab list dropdowns render above
  overflow-clipped containers. This updates both React and Vue packages to use
  viewport-positioned overlays for those menus.
