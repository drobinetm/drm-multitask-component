---
layout: ../../layouts/DocsLayout.astro
title: Vue | @drobinetm/multitabs
description: Use @drobinetm/multitabs-vue with Vue 3 and Vue Router.
demo: vue
---

# Vue

`@drobinetm/multitabs-vue` is the closest implementation to the original component.
It uses a visual component plus two composables.

## Install

Install the package together with `vue-router` if your project does not already
include it.

```bash
pnpm add @drobinetm/multitabs-vue vue-router
```

## Basic usage

Mount the component in your app shell so it can stay visible while routed pages
change below it.

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

Use `useMultiTabs()` when you need the tab state and actions directly.

```ts
import { useMultiTabs } from "@drobinetm/multitabs-vue";

const { tabs, currentTabId, closeTab, reloadTab } = useMultiTabs();
```

Use `useTabContainerReload()` inside routed content when a tab reload should
trigger a refetch or remount.

```ts
import { computed, watch } from "vue";
import { useTabContainerReload } from "@drobinetm/multitabs-vue";

const { getReloadNonce } = useTabContainerReload();
const nonce = computed(() => getReloadNonce("case-tab-id"));

watch(nonce, () => {
  // refetch data or rebuild local state
});
```

## Theme overrides

Pass the `theme` prop for local overrides, or redefine the CSS variables at the
application level.

```vue
<MultiTabs
  :theme="{
    activeTabBg: '#184E6C',
    activeTabColor: '#ffffff',
    borderRadius: '18px',
  }"
/>
```

## Next steps

- Review the [getting started guide](/docs/getting-started/).
- Compare the [React API](/docs/react/).
