# @drobinetm/multitabs-vue

`@drobinetm/multitabs-vue` adds browser-tab-style workspace navigation to Vue 3
applications. It combines a `MultiTabs` component with composables for tab
state, router sync, persistence, reload signals, and route-to-tab resolution.

## Install

Install the package together with `vue-router`.

```bash
pnpm add @drobinetm/multitabs-vue vue-router
```

## Basic usage

Mount `MultiTabs` in your app shell so it stays visible while the routed page
changes below it. Import the package styles once in your app.

```vue
<script setup lang="ts">
import { MultiTabs } from "@drobinetm/multitabs-vue";
import "@drobinetm/multitabs-vue/styles";
</script>

<template>
  <MultiTabs />
  <RouterView />
</template>
```

## Route mapping

By default, the package builds tabs from the active Vue Router route using
`route.name`, `route.params`, `route.meta.title`, `route.meta.icon`, and a few
legacy query fields such as `caseNumber`.

Use `resolveTab` to provide a domain-specific mapping and avoid depending on
those default conventions.

```vue
<script setup lang="ts">
import { MultiTabs, type MultiTabResolver } from "@drobinetm/multitabs-vue";

const resolveTab: MultiTabResolver = (route, { defaultTab }) => {
  if (route.name === "users-detail") {
    return {
      title: `User ${String(route.params.id)}`,
      icon: "person",
      caseTitle: defaultTab.title,
    };
  }
};
</script>

<template>
  <MultiTabs storage-key="crm-tabs" :resolve-tab="resolveTab" />
</template>
```

## Composables

Use `useMultiTabs()` when you need direct access to the current tab list and
actions. Calls that use the same `storageKey` share the same reactive tab
store in the current runtime.

```ts
import { createScopedStorageKey, useMultiTabs } from "@drobinetm/multitabs-vue";

const storageKey = createScopedStorageKey("crm-tabs", "tenant-acme", "user-42");

const { tabs, currentTabId, closeTab, closeAllTabs, moveTab, reloadTab } =
  useMultiTabs({ storageKey });
```

If your app clears persisted tabs during logout or test teardown, also clear the
runtime store:

```ts
import { resetMultiTabsRuntime } from "@drobinetm/multitabs-vue";

resetMultiTabsRuntime("crm-tabs");
```

Use `createScopedStorageKey()` when your app renders multiple shells in the same
browser runtime, such as tenant-aware dashboards, Astro previews, or docs
sandboxes.

```ts
import { createScopedStorageKey } from "@drobinetm/multitabs-vue";

const storageKey = createScopedStorageKey(
  "crm-tabs",
  tenantId,
  userId,
  "main-shell",
);
```

## Component events

`MultiTabs` emits `open`, `activate`, `close`, `move`, `reload`, and
`close-all` so host shells can connect analytics, telemetry, and close guards.

```vue
<MultiTabs
  storage-key="crm-tabs"
  @activate="(tab) => console.log('active', tab.id)"
  @close="(tab) => console.log('closed', tab.id)"
/>
```

## Controlled mode

Pass `tabs` and `activeTabId` when your shell owns the workspace state. Listen
to `update:tabs` and `update:activeTabId` to keep the host source of truth in
sync. When the host changes `activeTabId`, the component navigates to that
tab's `to` target so router state stays aligned with the controlled selection.

The component also reacts to runtime changes in `storageKey`, `defaultIcon`, and
`maxTabs`, so a host shell can swap workspace namespaces or limits without
remounting the tab rail.

```vue
<MultiTabs
  :tabs="tabs"
  :active-tab-id="activeTabId"
  :on-before-close="onBeforeClose"
  @update:tabs="tabs = $event"
  @update:activeTabId="activeTabId = $event"
/>
```

Use `onBeforeClose` to block close flows for unsaved or protected tabs.
The guard can return a boolean or a `Promise<boolean>`. During `close-all`, tabs
that fail the guard stay open.

Keep `tabs` and `activeTabId` consistent when you control the rail from the
host. If `activeTabId` points to a tab that is not present in `tabs`, the
component has no navigation target for that external selection.

Use `useTabContainerReload()` inside routed content when a tab reload should
trigger a refetch or remount.

```ts
import { computed, watch } from "vue";
import { useTabContainerReload } from "@drobinetm/multitabs-vue";

const { getReloadNonce } = useTabContainerReload();
const nonce = computed(() => getReloadNonce("case-tab-id"));

watch(nonce, () => {
  // Refetch or reset local state here.
});
```

## Theme overrides

Pass the `theme` prop for local overrides, or redefine the CSS variables in
your application styles.

```vue
<MultiTabs
  :theme="{
    activeTabBg: '#184E6C',
    activeTabColor: '#ffffff',
    borderRadius: '18px',
  }"
/>
```

## Public API

The package exports the component, composables, and related types.

- `MultiTabs`
- `useMultiTabs`
- `useTabContainerReload`
- `bumpTabContainerReload`
- `createScopedStorageKey`
- `resetMultiTabsRuntime`
- `generateTabId`
- `MultiTabResolver`
- `MultiTabItem`
- `MultiTabCloseContext`
- `MultiTabCloseGuard`
- `MultiTabCloseReason`
- `MultiTabMoveEvent`
- `MultiTabsTheme`
- `ResolveTabContext`
- `ResolveTabResult`
- `UseMultiTabsOptions`
- `UseMultiTabsReturn`

## Compatibility

The current Vue package targets Vue 3 and `vue-router@4`. In Astro, mount the
tabs shell from a Vue island because the component depends on browser router
context. If your page renders multiple previews or tenant shells, use a distinct
`storageKey` per island, preferably with `createScopedStorageKey()`, and call
`resetMultiTabsRuntime(storageKey)` when you clear persisted state inside the
same browser runtime.

## Documentation

Read the full Vue guide at
https://drm-multitabs-docs.netlify.app/docs/vue.
