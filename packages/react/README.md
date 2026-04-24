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

## Hooks

Use `useMultiTabs()` to inspect or change the current tab state from any
component inside `MultiTabsProvider`.

```tsx
import { useMultiTabs } from "@drobinetm/multitabs-react";

function TabInspector() {
  const { tabs, currentTabId, moveTab } = useMultiTabs();

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

## Provider options

Pass `options` to `MultiTabsProvider` to customize persistence, default icons,
tab limits, or title resolution.

```tsx
<MultiTabsProvider
  options={{
    storageKey: "crm-tabs",
    maxTabs: 12,
    resolveTitle: (pathname) =>
      pathname.startsWith("/customers/") ? "Customer detail" : null,
  }}
>
  <MultiTabs />
</MultiTabsProvider>
```

## Public API

The package exports the component, provider, hooks, and related types.

- `MultiTabs`
- `MultiTabsProvider`
- `useMultiTabs`
- `useTabContainerReload`
- `bumpTabContainerReload`
- `generateTabId`
- `MultiTabItem`
- `MultiTabsTheme`
- `UseMultiTabsOptions`
- `UseMultiTabsReturn`

## Documentation

Read the full React guide at
https://drm-multitabs-docs.netlify.app/docs/react.
