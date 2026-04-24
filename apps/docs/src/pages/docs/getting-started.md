---
layout: ../../layouts/DocsLayout.astro
title: Getting started | @drobinetm/multitabs
description: Install and start using @drobinetm/multitabs in Vue, React, or Angular applications.
---

# Getting started

`@drobinetm/multitabs` gives your SPA a browser-style tab layer with router-aware
navigation, persistence, drag and drop, close actions, and reload hooks.

## Choose a package

Pick the package that matches your stack.

| Framework | Package                  |
| --------- | ------------------------ |
| Vue 3     | `@drobinetm/multitabs-vue`     |
| React     | `@drobinetm/multitabs-react`   |
| Angular   | `@drobinetm/multitabs-angular` |

## Install with your package manager

Install one of the packages with `pnpm`, `npm`, or `yarn`.

```bash
pnpm add @drobinetm/multitabs-vue
npm install @drobinetm/multitabs-vue
yarn add @drobinetm/multitabs-vue
```

Replace the package name with the React or Angular variant when needed.

## What the library provides

The API shape stays conceptually aligned across the supported stacks.

- A visual `MultiTabs` component.
- A state layer tied to the router used by each stack.
- A tab reload primitive so tab content can remount or refetch.
- CSS custom properties for theming.

## Theme the component

The packages use CSS custom properties instead of a hard dependency on a UI
library. Override the tokens in your app CSS.

```css
:root {
  --drm-tabs-active-bg: #184e6c;
  --drm-tabs-active-color: #ffffff;
  --drm-tabs-border-radius: 14px;
  --drm-tabs-tab-max-width: 16rem;
}
```

## Recommended use case

This component works best in long-lived application shells such as claims
systems, back-office dashboards, CRMs, and internal admin tools where users
switch between multiple live records.

## Next steps

- Read the [Vue guide](/docs/vue/).
- Read the [React guide](/docs/react/).
- Read the [Angular guide](/docs/angular/).
