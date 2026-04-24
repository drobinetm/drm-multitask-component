# @drobinetm/multitabs-vue

`@drobinetm/multitabs-vue` adds browser-tab-style workspace navigation to
Vue 3 applications. It combines a `MultiTabs` component with composables for
tab state, router sync, persistence, and reload signals.

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

## Composables

Use `useMultiTabs()` when you need direct access to the current tab list and
actions.

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
- `MultiTabItem`
- `MultiTabsTheme`
- `UseMultiTabsOptions`
- `UseMultiTabsReturn`

## Documentation

Read the full Vue guide at
https://drm-multitabs-docs.netlify.app/docs/vue.
