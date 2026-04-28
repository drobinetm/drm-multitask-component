# @drm/multitabs-vue

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
