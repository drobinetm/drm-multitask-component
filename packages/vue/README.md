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
store.

```ts
import { useMultiTabs } from "@drobinetm/multitabs-vue";

const { tabs, currentTabId, closeTab, closeAllTabs, moveTab, reloadTab } =
  useMultiTabs();
```

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
- `generateTabId`
- `MultiTabResolver`
- `MultiTabItem`
- `MultiTabsTheme`
- `ResolveTabContext`
- `ResolveTabResult`
- `UseMultiTabsOptions`
- `UseMultiTabsReturn`

## Documentation

Read the full Vue guide at
https://drm-multitabs-docs.netlify.app/docs/vue.
