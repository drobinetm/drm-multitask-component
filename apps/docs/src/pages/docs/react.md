---
layout: ../../layouts/DocsLayout.astro
title: React | @drm/multitabs
description: Use @drm/multitabs-react with React and React Router.
demo: react
---

# React

`@drm/multitabs-react` exposes a hook-driven model with a provider so your tab
state can live at the application shell level.

## Install

Install the package together with `react-router-dom`.

```bash
pnpm add @drm/multitabs-react react-router-dom
```

## Basic usage

Wrap your app shell in `MultiTabsProvider`, then mount `MultiTabs` above the
rest of the routed content.

```tsx
import { Outlet } from "react-router-dom";
import { MultiTabs, MultiTabsProvider } from "@drm/multitabs-react";
import "@drm/multitabs-react/styles";

export function AppShell() {
  return (
    <MultiTabsProvider>
      <MultiTabs />
      <Outlet />
    </MultiTabsProvider>
  );
}
```

## Hook access

Use `useMultiTabs()` to read or manipulate the current workspace tab state.

```tsx
import { useMultiTabs } from "@drm/multitabs-react";

function TabInspector() {
  const { tabs, currentTabId, moveTab } = useMultiTabs();

  return (
    <pre>{JSON.stringify({ currentTabId, count: tabs.length }, null, 2)}</pre>
  );
}
```

## Tab reloads

Use `useTabContainerReload(tabId)` in content areas that need to react to tab
reload actions.

```tsx
import { useEffect } from "react";
import { useTabContainerReload } from "@drm/multitabs-react";

function CasePanel({ tabId }: { tabId: string }) {
  const nonce = useTabContainerReload(tabId);

  useEffect(() => {
    // refetch whenever the user hits reload on this tab
  }, [nonce]);

  return null;
}
```

## Next steps

- Review the [getting started guide](/docs/getting-started/).
- Compare the [Angular API](/docs/angular/).
