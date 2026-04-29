# @drm/multitabs-react

## Unreleased

### Patch Changes

- Respect custom `resolveTab()` IDs when deriving the active tab from the
  current router location, so provider state stays aligned with route-driven
  identities instead of always falling back to `location.pathname`.
- Expand the published React peer dependency range to validate declarative
  integrations on `react-router-dom@7` in addition to Router 6.
- Stabilize route-driven tab synchronization so the current tab is not rewritten
  when the resolved tab payload is semantically unchanged.
- Fix `openTab()` so it still navigates when the tab ID is reused but the
  target `search` or `hash` changes.
- Remove built-in React label formatting tied to `caseNumber` and `caseTitle`.
- Clarify the React docs around query-derived titles, Astro client islands, and
  the currently validated `react-router-dom` compatibility range.
- Scope `useTabContainerReload()` subscriptions per tab so reloads only notify
  the matching tab container.
- Support closing the React tab menus with `Escape` and document the keyboard
  behavior.

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
