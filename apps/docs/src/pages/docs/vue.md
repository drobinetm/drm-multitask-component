---
layout: ../../layouts/DocsLayout.astro
title: Vue | @drobinetm/multitabs
description: Integrate @drobinetm/multitabs-vue with Vue 3 and Vue Router.
demo: vue
---

# Vue

`@drobinetm/multitabs-vue` gives you a router-aware workspace tab bar for Vue 3
applications. Use it when your app needs to keep several routed work contexts
open in the same shell.

## Install

Install the package together with `vue-router` if your project does not already
include it.

```bash
pnpm add @drobinetm/multitabs-vue vue-router
```

Import the package stylesheet once in your application entry or shell.

```ts
import "@drobinetm/multitabs-vue/styles";
```

## Basic usage

Mount `MultiTabs` in your application shell so it stays visible while routed
content changes below it.

```vue
<script setup lang="ts">
import { MultiTabs } from "@drobinetm/multitabs-vue";
import { RouterView } from "vue-router";
import "@drobinetm/multitabs-vue/styles";
</script>

<template>
  <MultiTabs storage-key="crm-workspace-tabs" />
  <RouterView />
</template>
```

## Full example

Mount `MultiTabs` in your application shell so it stays visible while routed
content changes below it. Define route metadata up front so tab titles stay
predictable.

```ts
// router.ts
import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "dashboard",
      path: "/",
      component: () => import("./pages/DashboardPage.vue"),
      meta: { title: "Dashboard", icon: "home", isMenuItem: true },
    },
    {
      name: "users-detail",
      path: "/users/:id",
      component: () => import("./pages/UserDetailPage.vue"),
      meta: { title: "User" },
    },
    {
      name: "reports",
      path: "/reports",
      component: () => import("./pages/ReportsPage.vue"),
      meta: { title: "Reports", icon: "bar_chart" },
    },
  ],
});
```

```vue
<script setup lang="ts">
import { RouterView } from "vue-router";
import { MultiTabs, type MultiTabResolver } from "@drobinetm/multitabs-vue";
import "@drobinetm/multitabs-vue/styles";

const resolveTab: MultiTabResolver = (route, { defaultTab }) => {
  if (route.name === "users-detail") {
    return {
      title: route.query["label"]
        ? String(route.query["label"])
        : `User ${String(route.params.id)}`,
      icon: "person",
      caseTitle: defaultTab.title,
    };
  }
};
</script>

<template>
  <div class="app-shell">
    <header class="toolbar">Workspace</header>

    <MultiTabs
      storage-key="crm-workspace-tabs"
      :max-tabs="12"
      :resolve-tab="resolveTab"
      :theme="{
        activeTabBg: '#184E6C',
        activeTabColor: '#ffffff',
        borderRadius: '16px',
      }"
    />

    <main class="page-content">
      <RouterView />
    </main>
  </div>
</template>
```

```vue
<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useTabContainerReload, generateTabId } from "@drobinetm/multitabs-vue";

const route = useRoute();
const { getReloadNonce } = useTabContainerReload();
const tabId = computed(() => generateTabId(route));
const reloadNonce = computed(() => getReloadNonce(tabId.value));

watch(
  reloadNonce,
  () => {
    // Refetch data or rebuild local page state here.
  },
  { immediate: true },
);
</script>
```

## Route contract

The Vue package creates a tab from the active `vue-router` location. The tab ID
comes from the route name plus params when a name exists, or from the path when
it does not.

The default resolver reads route data in this order.

1. `route.query.staffTitle`
2. `route.query.caseNumber`
3. `route.meta.title`
4. A humanized route name
5. `route.path`

These route fields are supported by default.

| Field                    | Required | Purpose                                               |
| ------------------------ | -------- | ----------------------------------------------------- |
| `route.name`             | No       | Produces a stable tab ID with params.                 |
| `route.params`           | No       | Distinguishes dynamic routes such as `/users/42`.     |
| `route.meta.title`       | No       | Preferred default title for tabs.                     |
| `route.meta.icon`        | No       | Default icon string for the tab.                      |
| `route.meta.isMenuItem`  | No       | Marks the tab as coming from app navigation metadata. |
| `route.query.staffTitle` | No       | Overrides the default title.                          |
| `route.query.caseNumber` | No       | Supports case-based labels.                           |
| `route.query.caseTitle`  | No       | Supports case-style secondary labels.                 |

Dynamic routes open separate tabs when their route params differ. Navigating to
the same named route with the same params reuses the existing tab and refreshes
its metadata.

## Custom tab resolver

Use `resolveTab` when your app should not depend on the default route metadata
and query conventions. This is the main extension point for domain-specific tab
labels, icons, and targets.

```ts
import type { MultiTabResolver } from "@drobinetm/multitabs-vue";

export const resolveWorkspaceTab: MultiTabResolver = (route, context) => {
  if (route.name === "invoice-detail") {
    return {
      title: `Invoice ${String(route.params.id)}`,
      icon: "receipt",
      isMenuItem: true,
      caseTitle: context.defaultTab.title,
    };
  }

  return {
    title: context.defaultTab.title,
  };
};
```

The resolver receives the active route plus a context object.

| Name                  | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `route`               | The current `RouteLocationNormalizedLoaded` from Vue Router. |
| `context.defaultTab`  | The package's default tab model before overrides.            |
| `context.existingTab` | The currently stored tab with the same ID, if one exists.    |

Return a partial tab object to override fields such as `title`, `icon`, `to`,
or `isMenuItem`. If you return nothing, the default tab is used as-is.

Vue note: the package can already derive icon keys from `route.meta.icon` or
from `resolveTab()`, but you still need the `tab-icon` slot if you want those
keys to render as real icons instead of plain text.

## Component API

`MultiTabs` is a standalone visual component. It reads and updates the shared
tab store for the active router context.

### Props

| Prop          | Type               | Default         | Description                                           |
| ------------- | ------------------ | --------------- | ----------------------------------------------------- |
| `theme`       | `MultiTabsTheme`   | `undefined`     | Overrides the component CSS variables locally.        |
| `storageKey`  | `string`           | `drm-multitabs` | Namespaces persisted tabs in `localStorage`.          |
| `defaultIcon` | `string`           | `circle`        | Fallback icon string when a tab does not resolve one. |
| `maxTabs`     | `number`           | `Infinity`      | Caps the number of stored tabs.                       |
| `resolveTab`  | `MultiTabResolver` | `undefined`     | Custom route-to-tab resolver.                         |

### Slots

| Slot                  | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `launcher-icon`       | Replaces the launcher icon at the start of the rail. |
| `tab-icon`            | Customizes each tab icon. Receives `{ tab }`.        |
| `close-icon`          | Replaces the per-tab close icon.                     |
| `dropdown-icon`       | Replaces the all-tabs dropdown trigger icon.         |
| `menu-icon-reload`    | Replaces the context menu reload icon.               |
| `menu-icon-close`     | Replaces the context menu close icon.                |
| `menu-icon-close-all` | Replaces the dropdown close-all icon.                |

```vue
<script setup lang="ts">
function renderTabIcon(icon: string) {
  switch (icon) {
    case "home":
      return HomeIcon;
    case "bar_chart":
      return ReportIcon;
    default:
      return FallbackIcon;
  }
}
</script>

<template>
  <MultiTabs>
    <template #tab-icon="{ tab }">
      <component :is="renderTabIcon(tab.icon)" />
    </template>
  </MultiTabs>
</template>
```

## Composables and exports

Use `useMultiTabs()` when you need direct access to the shared tab state and
actions from layout code, page containers, or custom wrappers.

```ts
import { useMultiTabs } from "@drobinetm/multitabs-vue";

const {
  tabs,
  currentTabId,
  currentTab,
  openTab,
  closeTab,
  moveTab,
  reloadTab,
} = useMultiTabs({
  storageKey: "crm-workspace-tabs",
});
```

Use `bumpTabContainerReload(tabId)` when code outside the tabs controller needs
to trigger a tab content remount or refetch.

```ts
import { bumpTabContainerReload } from "@drobinetm/multitabs-vue";

function handleExternalRefresh(tabId: string) {
  bumpTabContainerReload(tabId);
}
```

The package exports the following runtime helpers and types.

| Export                   | Description                                                 |
| ------------------------ | ----------------------------------------------------------- |
| `MultiTabs`              | Visual tab bar component.                                   |
| `useMultiTabs`           | Shared tab state and actions for the active router context. |
| `useTabContainerReload`  | Reads reload nonces per tab ID.                             |
| `bumpTabContainerReload` | Manually triggers a reload nonce increment.                 |
| `generateTabId`          | Builds the stable tab ID from a Vue Router route.           |
| `MultiTabItem`           | Tab model type.                                             |
| `MultiTabsTheme`         | Theme prop type.                                            |
| `UseMultiTabsOptions`    | Options for the Vue composable.                             |
| `UseMultiTabsReturn`     | Return type of `useMultiTabs`.                              |
| `MultiTabResolver`       | Function type for custom route mapping.                     |
| `ResolveTabContext`      | Resolver context type.                                      |
| `ResolveTabResult`       | Resolver return type.                                       |

## Behavior details

The component keeps the current route represented as a tab and persists the tab
list whenever it changes.

These behaviors are important during integration.

| Scenario                     | Behavior                                                             |
| ---------------------------- | -------------------------------------------------------------------- |
| Open a new route             | A new tab is appended unless the route ID already exists.            |
| Revisit an existing route    | The existing tab is reused and its metadata is refreshed.            |
| Close the active tab         | The component navigates to the next tab, previous tab, or first tab. |
| Close the last remaining tab | The request is ignored so one valid tab always remains.              |
| Close all tabs               | Only the active tab remains.                                         |
| Reorder tabs                 | Dragging moves tab order and persists the new order.                 |
| Reload a tab                 | The tab reload nonce increments and the route opens if needed.       |
| Restore from storage         | Stored tabs are loaded on first use for the configured `storageKey`. |
| Invalid persisted JSON       | The package falls back to an empty stored state.                     |

## Persistence model

The Vue package persists tabs in `localStorage`. Use a distinct `storageKey`
per product, workspace, or signed-in scope when your app has more than one tab
surface.

Use these practices in production.

1. Namespace the key, for example `crm-workspace-tabs` or
   `acme-admin-tabs:${userId}`.
2. Prefer route names plus params for stable tab identity.
3. Clear or migrate stored tabs if your route map changes significantly.
4. Treat old stored payloads as optional state, not guaranteed state.

The package safely ignores malformed stored JSON, but it does not validate that
every stored route still exists in your app. If your route structure changes,
clear the old key or map old entries inside your own migration logic.

## Accessibility

`MultiTabs` includes semantic roles for tabs and menus, and it now supports a
basic keyboard interaction model.

Supported keyboard behavior:

| Key                                | Result                                                  |
| ---------------------------------- | ------------------------------------------------------- |
| `ArrowLeft` / `ArrowRight`         | Moves focus between tabs.                               |
| `Home` / `End`                     | Moves focus to the first or last tab.                   |
| `Enter` / `Space`                  | Activates the focused tab.                              |
| `Delete` / `Backspace`             | Closes the focused tab when closing is allowed.         |
| `Shift+F10` / `ContextMenu`        | Opens the tab context menu from the keyboard.           |
| `ArrowDown` on the dropdown button | Opens the all-tabs menu and focuses the first item.     |
| `Escape`                           | Closes the open menu and restores focus to the trigger. |

If your product has stricter accessibility requirements, verify the interaction
in your own shell with screen readers and your final icon slot content.

## Testing

The package includes interaction-heavy behavior, so you should verify both the
component and your integration.

For package-level checks, run:

```bash
pnpm --filter @drobinetm/multitabs-vue test
pnpm --filter @drobinetm/multitabs-vue build
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

## Theme overrides

Pass the `theme` prop for local overrides, or redefine the CSS variables at the
application level.

```vue
<MultiTabs
  :theme="{
    shellBg: 'rgba(24, 78, 108, 0.06)',
    activeTabBg: '#184E6C',
    activeTabColor: '#ffffff',
    activeTabBorderColor: '#184E6C',
    borderRadius: '18px',
  }"
/>
```

The `theme` prop maps directly to the `--drm-tabs-*` CSS variables on the
component root. If you set both global CSS variables and the `theme` prop, the
`theme` prop wins for that component instance.

## Styling and integration notes

The component ships plain CSS, so it works with utility-first and design-system
driven shells. Import the bundled stylesheet once, then override
`--drm-tabs-*` variables globally or on a wrapper around the component.

```css
.workspace-tabs {
  --drm-tabs-active-bg: #0f766e;
  --drm-tabs-active-color: #ffffff;
}
```

If you want icon keys such as `home`, `receipt`, or `person` to render as real
icons, provide the `tab-icon` slot and map those keys to your own icon
components.

## Troubleshooting

- If tabs do not navigate, verify that `MultiTabs` renders inside a Vue Router
  context.
- If restored tabs point to routes that no longer exist, clear the persisted
  `storageKey` or migrate old entries in your app.
- If icon labels render as plain text, provide the `tab-icon` slot with your
  own icon mapping.

## Next steps

- Review the [getting started guide](/docs/getting-started/).
- Compare the [React API](/docs/react/).
- Try the [live Vue demo](/demos/vue/).
