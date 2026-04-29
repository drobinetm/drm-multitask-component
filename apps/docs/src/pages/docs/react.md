---
layout: ../../layouts/DocsLayout.astro
title: React | @drobinetm/multitabs
description: Use @drobinetm/multitabs-react with React and React Router.
demo: react
---

# React

`@drobinetm/multitabs-react` exposes a hook-driven model with a provider so your tab
state can live at the application shell level.

Render the provider inside a React Router context and import the package styles
once in your shell entry.

## Install

Install the package together with `react-router-dom`.

```bash
pnpm add @drobinetm/multitabs-react react-router-dom
```

## Basic usage

Wrap your app shell in `MultiTabsProvider`, then mount `MultiTabs` above the
rest of the routed content.

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

`MultiTabsProvider` and `MultiTabs` must render inside `BrowserRouter`,
`MemoryRouter`, or another React Router provider.

## Route contract

The React package creates a tab from the active `react-router-dom` location.
The tab ID comes from `location.pathname`, so query strings do not create a new
tab identity by default.

The default resolver builds the title in this order.

1. `resolveTitle(pathname, search)` if you provide it.
2. A humanized version of the pathname.

These location fields are supported by default.

| Field                   | Required | Purpose                                                     |
| ----------------------- | -------- | ----------------------------------------------------------- |
| `location.pathname`     | Yes      | Produces the stable tab ID and default title seed.          |
| `location.search`       | No       | Lets `resolveTitle()` and `resolveTab()` inspect the route. |
| `resolveTab().icon`     | No       | Provides an icon key for your custom `tabIcon`.             |
| `resolveTab().metadata` | No       | Stores consumer-defined metadata on the tab.                |

Navigating to the same pathname with different search params reuses the same
tab and refreshes its metadata. If you need separate tabs for query-driven
state, return a custom `id` from `resolveTab()`.

## Hook access

Use `useMultiTabsController()` to read or manipulate the shared workspace tab
state managed by `MultiTabsProvider`.

```tsx
import { useMultiTabsController } from "@drobinetm/multitabs-react";

function TabInspector() {
  const { tabs, currentTabId, moveTab } = useMultiTabsController();

  return (
    <pre>{JSON.stringify({ currentTabId, count: tabs.length }, null, 2)}</pre>
  );
}
```

Use `useMultiTabs()` only when you need a standalone controller instance that
is not connected to the provider-managed state.

## Provider options

Pass `options` to `MultiTabsProvider` to control persistence, title resolution,
close guards, and lifecycle callbacks.

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
    onBeforeClose: (tab) => !tab.metadata?.unsaved,
    onTabOpen: (tab) => console.log("opened", tab.id),
    onTabClose: (tab) => console.log("closed", tab.id),
    onTabChange: (tab) => console.log("active", tab.id),
  }}
>
  <MultiTabs />
</MultiTabsProvider>
```

Option reference:

- `storageKey`: custom `localStorage` key for persisted tabs.
- `defaultIcon`: fallback icon string for resolved tabs.
- `maxTabs`: maximum number of stored tabs.
- `resolveTab`: route-aware resolver for titles, icons, IDs, targets, and
  metadata.
- `resolveTitle`: returns a custom title from the current location.
- `onBeforeClose`: return `false` to block `closeTab()` or `closeAllTabs()`.
- `onTabOpen`: fires when a new tab is added.
- `onTabClose`: fires when a tab is removed.
- `onTabChange`: fires when the active tab changes.

`resolveTab` is the main extension point when you need per-route icons, custom
tab IDs, or metadata. `resolveTitle` remains available as a lightweight
fallback when only the label changes and the default pathname-based tab ID is
still correct.

If you need query-driven titles, derive them explicitly in `resolveTitle()` or
`resolveTab()` instead of relying on reserved query keys.

## Component props and slots

`MultiTabs` supports layout props, scoped theming, and six visual slots.

```tsx
const routeIcons = new Map([
  ["/", "home"],
  ["/reports", "report"],
  ["/settings", "settings"],
]);

function renderTabIcon(icon: string) {
  switch (icon) {
    case "home":
      return <HomeIcon />;
    case "report":
      return <ReportIcon />;
    case "settings":
      return <SettingsIcon />;
    default:
      return <FallbackIcon />;
  }
}

<MultiTabs
  tabIcon={(tab) => renderTabIcon(tab.icon)}
  theme={{
    shellBg: "#0f1f35",
    activeTabBg: "#1d4ed8",
    activeTabColor: "#ffffff",
    borderRadius: "14px",
    tabMaxWidth: "18rem",
  }}
  launcherIcon={<span>Apps</span>}
  closeIcon={<span>Close</span>}
  dropdownIcon={<span>More</span>}
  menuIconReload={<span>Reload</span>}
  menuIconClose={<span>Close</span>}
/>;
```

When tabs are created from route changes, pair `tabIcon` with your own route
mapping logic so each pathname resolves to an icon key instead of falling back
to the plain default string.

Supported props:

- `theme`
- `className`
- `style`
- `launcherIcon`
- `tabIcon`
- `closeIcon`
- `dropdownIcon`
- `menuIconReload`
- `menuIconClose`

The `theme` prop maps directly to the `--drm-tabs-*` CSS variables on the
component root. If you set both global CSS variables and the `theme` prop, the
`theme` prop wins for that component instance.

## TypeScript types

The public React package exports these types:

- `MultiTabItem`: tab identity, `title`, `icon`, router target, and optional
  `metadata`.
- `MultiTabsTheme`: token object for height, shell background, tab colors,
  widths, and border radius.
- `MultiTabCloseContext`: close reason plus the current and remaining tabs.
- `ResolveTabContext`: current default tab plus the existing tab for the same
  route identity.
- `ResolveTabResult`: partial tab model returned by `resolveTab`.
- `MultiTabResolver`: function type used by `resolveTab`.
- `UseMultiTabsOptions`: options accepted by `MultiTabsProvider` and
  `useMultiTabs()`.
- `UseMultiTabsReturn`: state and actions returned by the tab controller.

## Public API

The package exports the following runtime helpers and types.

| Export                   | Description                                            |
| ------------------------ | ------------------------------------------------------ |
| `MultiTabs`              | Visual tab bar component.                              |
| `MultiTabsProvider`      | Shared provider for route-driven tab state.            |
| `useMultiTabsController` | Reads and updates provider-managed tab state.          |
| `useMultiTabs`           | Standalone hook for tab state and actions.             |
| `useTabContainerReload`  | Reads reload nonces per tab ID.                        |
| `bumpTabContainerReload` | Manually triggers a reload nonce increment.            |
| `generateTabId`          | Builds the stable tab ID from a React Router location. |
| `MultiTabItem`           | Tab model type.                                        |
| `MultiTabsTheme`         | Theme prop type.                                       |
| `MultiTabCloseContext`   | Close guard context type.                              |
| `UseMultiTabsOptions`    | Options for the provider and standalone hook.          |
| `UseMultiTabsReturn`     | Return type of the tab controller.                     |
| `MultiTabResolver`       | Function type for custom location-to-tab mapping.      |
| `ResolveTabContext`      | Resolver context type.                                 |
| `ResolveTabResult`       | Resolver return type.                                  |

## Behavior details

The package keeps the current router location represented as a tab and persists
the tab list whenever it changes.

These behaviors are important during integration.

| Scenario                     | Behavior                                                             |
| ---------------------------- | -------------------------------------------------------------------- |
| Open a new route             | A new tab is appended unless the route ID already exists.            |
| Revisit an existing route    | The existing tab is reused and its metadata is refreshed.            |
| Close the active tab         | The package navigates to the next tab, previous tab, or first tab.   |
| Close the last remaining tab | The request is ignored so one valid tab always remains.              |
| Close all tabs               | Only the active tab remains unless `onBeforeClose` blocks a tab.     |
| Reorder tabs                 | Dragging moves tab order and persists the new order.                 |
| Reload a tab                 | The tab reload nonce increments and the route opens if needed.       |
| Restore from storage         | Stored tabs are loaded on first use for the configured `storageKey`. |
| Invalid persisted JSON       | The package falls back to an empty stored state.                     |

## Persistence model

The React package persists tabs in `localStorage`. Use a distinct
`storageKey` per product, workspace, or signed-in scope when your app has more
than one tab surface.

Use these practices in production.

1. Namespace the key, for example `crm-workspace-tabs` or
   `acme-admin-tabs:${userId}`.
2. Prefer pathnames or explicit `resolveTab()` IDs that stay stable.
3. Clear or migrate stored tabs if your route map changes significantly.
4. Treat old stored payloads as optional state, not guaranteed state.

The package safely ignores malformed stored JSON, but it does not validate that
every stored route still exists in your app. If your route structure changes,
clear the old key or map old entries inside your own migration logic.

## Tab reloads

Use `useTabContainerReload(tabId)` in content areas that need to react to tab
reload actions.

```tsx
import { useEffect } from "react";
import { useTabContainerReload } from "@drobinetm/multitabs-react";

function CasePanel({ tabId }: { tabId: string }) {
  const nonce = useTabContainerReload(tabId);

  useEffect(() => {
    // refetch whenever the user hits reload on this tab
  }, [nonce]);

  return null;
}
```

If you need to trigger the same reload signal from code outside the tabs
controller, call `bumpTabContainerReload(tabId)`.

```tsx
import { bumpTabContainerReload } from "@drobinetm/multitabs-react";

function refreshCurrentTab(tabId: string) {
  bumpTabContainerReload(tabId);
}
```

## Integration notes

The component ships plain CSS, so it works with Tailwind and other utility
frameworks. Import the bundled stylesheet once, then override `--drm-tabs-*`
variables on `:root` or on a custom `className` wrapper.

```css
.workspace-tabs {
  --drm-tabs-active-bg: #0369a1;
  --drm-tabs-active-color: #ffffff;
}
```

## SSR and compatibility

The React package reads `localStorage` only in the browser. During SSR it
starts with an empty tab list and hydrates on the client.

Compatibility notes:

- React 18 and React 19 are supported peer dependency targets.
- `react-router-dom@6` and `react-router-dom@7` are validated for the current
  declarative-router API surface used by this package.
- `MultiTabsProvider` and `MultiTabs` must render inside a React Router
  context.
- In React Server Components environments, render the tabs shell from a client
  component boundary.
- In Astro, mount the React shell from a client island such as
  `client:only="react"`, `client:load`, or `client:visible` because the tabs
  depend on router context and browser storage.

## Accessibility

The tab rail uses `role="tablist"` and tab buttons use `role="tab"` with
`aria-selected`. Close actions are exposed as labeled buttons. If you build on
top of the component, keep icon replacements text-accessible and test keyboard
flows in your shell.

Keyboard support:

- `ArrowLeft`: move focus and activation to the previous tab.
- `ArrowRight`: move focus and activation to the next tab.
- `Home`: jump to the first tab.
- `End`: jump to the last tab.
- `Delete`: close the focused tab when another tab is available.
- `Escape`: close the open tab menu or the dropdown list.

## Testing

The package includes interaction-heavy behavior, so verify both the component
and your integration.

For package-level checks, run:

```bash
pnpm --filter @drobinetm/multitabs-react test
pnpm --filter @drobinetm/multitabs-react build
```

Recommended integration coverage:

1. Open a tab when navigation reaches a new route.
2. Reuse the same tab when the route ID already exists.
3. Close the active tab and assert the fallback navigation.
4. Persist tab order after drag and drop.
5. Restore tabs from `localStorage` safely.
6. Verify your custom `resolveTab` rules.
7. Verify keyboard navigation in your app shell.
8. Watch `useTabContainerReload()` in routed pages that support reload.

## Troubleshooting

- If tabs do not navigate, verify that `MultiTabsProvider` is rendered inside a
  React Router provider.
- If `openTab()` reuses the same tab ID, the package still navigates when the
  target `search` or `hash` changes. Return a custom `id` from `resolveTab()`
  only when query-driven states must become separate tabs.
- If your app uses React Router's newer package layout guidance, note that this
  package still imports from `react-router-dom`. That remains compatible with
  the validated declarative APIs in Router 7.
- If you use React Server Components, render the tabs shell from a client
  component boundary.
- During SSR, the tab list starts empty on the server and hydrates from
  `localStorage` in the browser.

## End-to-end example

This pattern works well in shells with nested routes and `Outlet` rendering.

```tsx
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import {
  MultiTabs,
  MultiTabsProvider,
  useMultiTabsController,
} from "@drobinetm/multitabs-react";
import "@drobinetm/multitabs-react/styles";

function Shell() {
  return (
    <MultiTabsProvider
      options={{
        resolveTitle: (pathname) =>
          pathname.startsWith("/projects/") ? "Project detail" : null,
      }}
    >
      <MultiTabs className="workspace-tabs" />
      <Outlet />
    </MultiTabsProvider>
  );
}

function OpenReportsButton() {
  const { openTab } = useMultiTabsController();

  return (
    <button
      type="button"
      onClick={() =>
        openTab({
          id: "/reports",
          title: "Reports",
          icon: "report",
          to: "/reports",
          routePath: "/reports",
        })
      }
    >
      Open reports
    </button>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route
            path="/projects/:projectId"
            element={<div>Project page</div>}
          />
          <Route path="/reports" element={<div>Reports page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

## Next steps

- Try the [live React demo](/demos/react/).
- Review the [getting started guide](/docs/getting-started/).
- Compare the [Angular API](/docs/angular/).
