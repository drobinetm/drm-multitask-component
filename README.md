# @drobinetm/multitabs

[![Vue](https://img.shields.io/badge/Vue-3-42B883?logo=vue.js&logoColor=white)](https://drm-multitabs-docs.netlify.app/docs/vue/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111827)](https://drm-multitabs-docs.netlify.app/docs/react/)
[![Angular](https://img.shields.io/badge/Angular-coming%20soon-DD0031?logo=angular&logoColor=white)](https://drm-multitabs-docs.netlify.app/)
[![Astro](https://img.shields.io/badge/Docs-Astro-FF5D01?logo=astro&logoColor=white)](https://drm-multitabs-docs.netlify.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/monorepo-pnpm-F69220?logo=pnpm&logoColor=white)](./pnpm-workspace.yaml)

`@drobinetm/multitabs` is a library-component multitabs solution for web
applications that need browser-style workspace navigation inside a single-page
application shell. It solves the common problem of keeping multiple routes,
records, or work contexts open at the same time without forcing users to leave
the application flow or duplicate browser tabs. The library is designed for
interfaces such as admin panels, internal tools, CRM screens, operations
dashboards, and other dense navigation environments where fast switching
between active views matters. It provides a consistent mental model across
frameworks while keeping each package implementation native to its ecosystem.
The current public packages target Vue and React, and the Angular package is in
progress and will be released soon. The documentation site centralizes usage
guides, package references, and project support information.

## Why this library

This library is built for applications that need persistent, high-density
navigation patterns beyond standard route switching. It helps keep open work
contexts visible and recoverable while preserving router-driven application
structure. Each package stays framework-native instead of introducing a shared
cross-framework runtime abstraction. The visual layer is design-system-neutral,
so teams can adapt it through CSS custom properties without depending on a UI
component framework.

## Installation

Install the package that matches your target framework.

### Vue

Package for Vue applications.

```bash
pnpm add @drobinetm/multitabs-vue
npm install @drobinetm/multitabs-vue
yarn add @drobinetm/multitabs-vue
```

### React

Package for React applications.

```bash
pnpm add @drobinetm/multitabs-react
npm install @drobinetm/multitabs-react
yarn add @drobinetm/multitabs-react
```

### Angular

The `@drobinetm/multitabs-angular` package will be available soon.

## Project site

The project site centralizes the public documentation and reference pages.

- Project site: https://drm-multitabs-docs.netlify.app/
- Vue documentation: https://drm-multitabs-docs.netlify.app/docs/vue/
- React documentation: https://drm-multitabs-docs.netlify.app/docs/react/

## Support

The support page lists the available project support options.

- Support: https://drm-multitabs-docs.netlify.app/support/
