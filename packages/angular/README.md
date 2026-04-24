# @drobinetm/multitabs-angular

`@drobinetm/multitabs-angular` adds browser-tab-style workspace navigation to
Angular applications. It provides a standalone component, a tab state service,
and a dedicated reload service for routed tab content.

## Install

Install the package in your Angular application.

```bash
pnpm add @drobinetm/multitabs-angular
```

## Basic usage

Import `MultiTabsComponent` into your shell component and render it above the
router outlet. Import the shared stylesheet once in your global styles.

```css
@import "@drobinetm/multitabs-angular/styles";
```

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

Use `MultiTabsService` when you need to inspect tabs or trigger tab actions
from elsewhere in the shell.

```ts
import { inject } from "@angular/core";
import { MultiTabsService } from "@drobinetm/multitabs-angular";

const tabs = inject(MultiTabsService);

tabs.closeAllTabs();
```

Use `TabReloadService` to subscribe to reload signals for a specific tab.

```ts
import { inject } from "@angular/core";
import { TabReloadService } from "@drobinetm/multitabs-angular";

const reloads = inject(TabReloadService);

reloads.getNonce$("case-tab-id").subscribe(() => {
  // Refetch or rebuild local state here.
});
```

## Configuration

Provide `MULTI_TABS_OPTIONS` when you want to customize persistence, default
icons, or the maximum number of open tabs.

```ts
import { ApplicationConfig } from "@angular/core";
import {
  MULTI_TABS_OPTIONS,
  MultiTabsService,
} from "@drobinetm/multitabs-angular";

export const appConfig: ApplicationConfig = {
  providers: [
    MultiTabsService,
    {
      provide: MULTI_TABS_OPTIONS,
      useValue: { storageKey: "crm-tabs", maxTabs: 12 },
    },
  ],
};
```

## Theme overrides

Pass the `theme` input for local overrides, or redefine the CSS custom
properties in your application styles.

```html
<drm-multi-tabs
  [theme]="{
    activeTabBg: '#184E6C',
    activeTabColor: '#ffffff',
    borderRadius: '18px'
  }"
/>
```

## Public API

The package exports the standalone component, services, tokens, and related
types.

- `MultiTabsComponent`
- `MultiTabsService`
- `MULTI_TABS_OPTIONS`
- `TabReloadService`
- `MultiTabItem`
- `MultiTabsTheme`
- `MultiTabsOptions`

## Documentation

Read the full Angular guide at
https://drm-multitabs-docs.netlify.app/docs/angular.
