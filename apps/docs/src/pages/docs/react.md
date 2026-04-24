---
layout: ../../layouts/DocsLayout.astro
title: React | @drobinetm/multitabs
description: Use @drobinetm/multitabs-react with React and React Router.
demo: react
---

# React

`@drobinetm/multitabs-react` exposes a hook-driven model with a provider so your tab
state can live at the application shell level.

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

## Hook access

Use `useMultiTabs()` to read or manipulate the current workspace tab state.

```tsx
import { useMultiTabs } from "@drobinetm/multitabs-react";

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
import { useTabContainerReload } from "@drobinetm/multitabs-react";

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
