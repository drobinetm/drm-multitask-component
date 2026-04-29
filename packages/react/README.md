# @drobinetm/multitabs-react

`@drobinetm/multitabs-react` adds browser-tab-style workspace navigation to
React applications. It uses a provider-based state model with hooks for tab
state, router sync, persistence, and reload signals.

## Install

Install the package together with `react-router-dom`.

```bash
pnpm add @drobinetm/multitabs-react react-router-dom
```

## Basic usage

Wrap your app shell in `MultiTabsProvider`, then render `MultiTabs` above the
rest of the routed content. Import the package styles once in your app.

```tsx
import { Outlet } from "react-router-dom";
import { MultiTabs, MultiTabsProvider } from "@drobinetm/multitabs-react";
import "@drobinetm/multitabs-react/styles";

export function AppShell() {
  return (
    <MultiTabsProvider>
      <MultiTabs />
      <Outlet />
    </MultiTabsProvider>
  );
}
```

`MultiTabsProvider` and `MultiTabs` must render inside a React Router context
such as `BrowserRouter`, `MemoryRouter`, or `RouterProvider`.

## Route contract

The React package creates a tab from the active `react-router-dom` location.
The default tab ID comes from `location.pathname`, so query strings do not
create a separate tab identity unless you override that behavior in
`resolveTab()`.

These rules drive the default route sync.

- `location.pathname` provides the stable tab identity.
- `resolveTitle(pathname, search)` can replace the default humanized label.
- `resolveTab(location, context)` can replace the ID, title, icon, target, and
  metadata.
- Navigating to the same pathname with a different `search` or `hash` keeps the
  same tab identity but still updates the tab payload and navigation target.

If your product needs separate tabs for query-driven states, return a custom ID
from `resolveTab()`.

## Hooks

Use `useMultiTabsController()` to inspect or change the shared tab state from
any component inside `MultiTabsProvider`.

```tsx
import { useMultiTabsController } from "@drobinetm/multitabs-react";

function TabInspector() {
  const { tabs, currentTabId, moveTab } = useMultiTabsController();

  return (
    <pre>{JSON.stringify({ currentTabId, count: tabs.length }, null, 2)}</pre>
  );
}
```

Use `useTabContainerReload(tabId)` in content areas that need to react to tab
reload actions.

```tsx
import { useEffect } from "react";
import { useTabContainerReload } from "@drobinetm/multitabs-react";

function CasePanel({ tabId }: { tabId: string }) {
  const nonce = useTabContainerReload(tabId);

  useEffect(() => {
    // Refetch whenever the user reloads this tab.
  }, [nonce]);

  return null;
}
```

Use `useMultiTabs()` only when you want a standalone controller instance rather
than the state managed by `MultiTabsProvider`.

## Provider options

Pass `options` to `MultiTabsProvider` to customize persistence, titles, close
guards, and lifecycle callbacks.

```tsx
<MultiTabsProvider
  options={{
    storageKey: "crm-tabs",
    maxTabs: 12,
    resolveTab: (location, context) => {
      if (!location.pathname.startsWith("/customers/")) {
        return undefined;
      }

      const customerId = location.pathname.split("/").pop();
      const params = new URLSearchParams(location.search);

      return {
        id: `customer:${customerId}`,
        title: params.get("name") ?? `Customer ${customerId}`,
        icon: "user",
        metadata: {
          ...context.defaultTab.metadata,
          area: "crm",
          customerId,
        },
      };
    },
    onBeforeClose: (tab, context) => !tab.metadata?.unsaved,
    onTabOpen: (tab) => console.log("opened", tab.id),
    onTabClose: (tab) => console.log("closed", tab.id),
    onTabChange: (tab) => console.log("active", tab.id),
  }}
>
  <MultiTabs />
</MultiTabsProvider>
```

Supported options:

- `storageKey`: custom `localStorage` key used for persistence.
- `defaultIcon`: fallback icon label used for resolved tabs.
- `maxTabs`: maximum number of stored tabs before the oldest non-active tab is
  removed.
- `resolveTab`: route-aware tab resolver for titles, icons, IDs, targets, and
  metadata.
- `resolveTitle`: maps router locations to human-readable tab labels when the
  default pathname-based tab identity is still the desired identity.
- `onBeforeClose`: blocks `closeTab()` and `closeAllTabs()` when it returns
  `false`.
- `onTabOpen`: fires when a new tab is added.
- `onTabClose`: fires when a tab is removed.
- `onTabChange`: fires when the active tab changes.

## Component props

`MultiTabs` supports container styling plus visual slots for icon overrides.

- `theme?: MultiTabsTheme`
- `className?: string`
- `style?: CSSProperties`
- `launcherIcon?: ReactNode`
- `tabIcon?: (tab: MultiTabItem) => ReactNode`
- `closeIcon?: ReactNode`
- `dropdownIcon?: ReactNode`
- `menuIconReload?: ReactNode`
- `menuIconClose?: ReactNode`

The `theme` prop writes scoped CSS custom properties on the component root.
When both the `theme` prop and global `--drm-tabs-*` variables are set, the
component-level `theme` prop wins because it is applied inline on the same
element.

## TypeScript API

Public types:

- `MultiTabItem`: tab identity, title, router target, icon, and optional
  `metadata` for consumer-defined values.
- `MultiTabsTheme`: token map for height, shell background, tab colors, border
  radius, and width constraints.
- `MultiTabCloseContext`: reason, current tab ID, and remaining tabs for
  `onBeforeClose`.
- `ResolveTabContext`: current default tab plus the existing tab for the same
  route identity.
- `ResolveTabResult`: partial tab model returned by `resolveTab`.
- `MultiTabResolver`: function type used by `resolveTab`.
- `UseMultiTabsOptions`: provider and standalone hook configuration.
- `UseMultiTabsReturn`: tab state plus `openTab`, `closeTab`, `closeAllTabs`,
  `moveTab`, and `reloadTab` actions.

## Reload helpers

Use `bumpTabContainerReload(tabId)` when code outside the tabs controller needs
to trigger a tab content remount or refetch.

```tsx
import { bumpTabContainerReload } from "@drobinetm/multitabs-react";

function handleExternalRefresh(tabId: string) {
  bumpTabContainerReload(tabId);
}
```

Reload notifications are scoped per `tabId`. Reloading one tab does not force
other `useTabContainerReload()` subscribers to re-render.

## Behavior details

The package keeps the current router location represented as a tab and persists
the tab list whenever it changes.

- Visiting a new route appends a new tab unless the tab identity already exists.
- Revisiting an existing tab identity reuses that tab and refreshes its payload.
- Closing the active tab navigates to the next tab, previous tab, or first tab.
- Closing the last remaining tab is ignored so one valid tab always remains.
- Closing all tabs keeps the active tab and any tabs blocked by
  `onBeforeClose`.
- Drag-and-drop reorders tabs and persists the updated order.
- Invalid persisted JSON falls back to an empty stored tab list.

## Styling with Tailwind or other CSS frameworks

The package ships plain class names and a single stylesheet. Import
`@drobinetm/multitabs-react/styles` once, then override the exported
`--drm-tabs-*` custom properties or append your own class with `className`.

```tsx
<MultiTabs className="workspace-tabs" />
```

```css
.workspace-tabs {
  --drm-tabs-active-bg: theme(colors.sky.700);
  --drm-tabs-active-color: white;
}
```

## SSR and compatibility notes

- The package reads `localStorage` only in the browser. During SSR it starts
  with an empty tab list and hydrates on the client.
- React 18 and React 19 are supported peer dependency targets.
- `react-router-dom@6` and `react-router-dom@7` are validated peer dependency
  targets for the current declarative-router integration surface.
- In React Server Components environments, render `MultiTabsProvider` and
  `MultiTabs` from a client component boundary.
- In Astro, mount the React shell from a client island such as
  `client:only="react"`, `client:load`, or `client:visible` because the tabs
  depend on router state and browser storage.

For application shells in Astro, prefer `client:only="react"` or
`client:load` so the router-backed workspace is ready immediately. Reserve
`client:visible` for demos or non-critical surfaces.

## Accessibility

The tab rail uses `role="tablist"` and tab buttons use `role="tab"` with
`aria-selected`. Close actions remain separate labeled buttons, which keeps the
main tab activation target and the destructive close action distinct.

Keyboard support:

- `ArrowLeft`: move focus and activation to the previous tab.
- `ArrowRight`: move focus and activation to the next tab.
- `Home`: jump to the first tab.
- `End`: jump to the last tab.
- `Delete`: close the focused tab when another tab is available.
- `Escape`: close the open tab menu or the dropdown list.

## Testing

The package includes route sync, keyboard interaction, drag-and-drop, menu
portals, and persistence. Test both the package and your shell integration.

Run the package checks with:

```bash
pnpm --filter @drobinetm/multitabs-react test
pnpm --filter @drobinetm/multitabs-react build
```

Recommended integration coverage:

- Open a tab when navigation reaches a new route.
- Reuse the same tab when the route identity already exists.
- Close the active tab and assert the fallback navigation.
- Verify your `resolveTab()` rules for custom IDs and query-driven labels.
- Verify keyboard flows including `Escape` for menus.
- Watch `useTabContainerReload()` inside routed pages that support reload.

## Troubleshooting

Use these checks when the shell behavior does not match your route model.

- If tabs do not navigate, verify that `MultiTabsProvider` renders inside a
  React Router provider.
- If a query-driven view reuses the wrong tab, return a custom ID from
  `resolveTab()` instead of relying on `pathname` alone.
- If you mount the shell in Astro, keep it inside a client island because the
  tabs depend on router context and browser storage.
- If a reload action appears global, pass the active tab ID into
  `useTabContainerReload(tabId)` and trigger refreshes with the matching
  `bumpTabContainerReload(tabId)`.

## Public API

The package exports the component, provider, hooks, and related types.

- `MultiTabs`
- `MultiTabsProvider`
- `useMultiTabsController`
- `useMultiTabs`
- `useTabContainerReload`
- `bumpTabContainerReload`
- `generateTabId`
- `MultiTabCloseContext`
- `MultiTabItem`
- `MultiTabsTheme`
- `UseMultiTabsOptions`
- `UseMultiTabsReturn`

## Documentation

Read the full React guide at
https://drm-multitabs-docs.netlify.app/docs/react.
