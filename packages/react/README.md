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
      if (location.pathname.startsWith("/customers/")) {
        return {
          title: "Customer detail",
          icon: "user",
          metadata: {
            ...context.defaultTab.metadata,
            area: "crm",
          },
        };
      }

      return undefined;
    },
    resolveTitle: (pathname) =>
      pathname.startsWith("/customers/") ? "Customer detail" : null,
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
- `resolveTitle`: maps router locations to human-readable tab labels.
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
- In React Server Components environments, render `MultiTabsProvider` and
  `MultiTabs` from a client component boundary.

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
