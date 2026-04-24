---
layout: ../../layouts/DocsLayout.astro
title: Angular | @drobinetm/multitabs
description: Use @drobinetm/multitabs-angular with Angular Router.
demo: angular
---

# Angular

`@drobinetm/multitabs-angular` follows Angular conventions with a standalone
component, a main service for tab state, and a dedicated reload service.

## Install

Install the Angular package in your app.

```bash
pnpm add @drobinetm/multitabs-angular
```

## Basic usage

Import the standalone component into your shell and render it above the router
outlet.

```ts
import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { MultiTabsComponent } from "@drobinetm/multitabs-angular";

@Component({
  selector: "app-shell",
  standalone: true,
  imports: [RouterOutlet, MultiTabsComponent],
  template: `
    <drm-multi-tabs />
    <router-outlet />
  `,
})
export class AppShellComponent {}
```

## Services

Use `MultiTabsService` to inspect tabs or trigger actions from elsewhere in the
shell.

```ts
import { inject } from "@angular/core";
import { MultiTabsService } from "@drobinetm/multitabs-angular";

const tabs = inject(MultiTabsService);

tabs.closeAllTabs();
```

Use `TabReloadService` to watch or bump reload signals for tab containers.

## Next steps

- Review the [getting started guide](/docs/getting-started/).
- Compare the [Vue API](/docs/vue/).
