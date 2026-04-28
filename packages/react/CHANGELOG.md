# @drm/multitabs-react

## 0.2.0

### Minor Changes

- Improve the React tabs package with SSR-safe persistence, shared provider
  controller access, close guards, lifecycle callbacks, baseline tests, React 19
  peer support, and expanded React documentation.

### Patch Changes

- b48a1be: Update the React package metadata and publishing flow for the `@drobinetm`
  scope, hide the default `circle` icon fallback from visible tabs, and build the
  package during `prepack` so npm publishes always include the generated `dist`
  artifacts.

## 0.1.1

### Patch Changes

- Fix menu positioning so tab context menus and tab list dropdowns render above
  overflow-clipped containers. This updates both React and Vue packages to use
  viewport-positioned overlays for those menus.
