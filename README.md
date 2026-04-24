# @drm/multitabs

`@drm/multitabs` is a monorepo for browser-tab-style navigation components in
Vue, React, and Angular applications. It is designed for dense application shells such as
claims systems, CRMs, internal dashboards, and admin tools where users keep
multiple live records open at once.

[![Monorepo](https://img.shields.io/badge/monorepo-pnpm-F69220?logo=pnpm&logoColor=white)](./pnpm-workspace.yaml)
[![Build](https://img.shields.io/badge/build-turborepo-111827?logo=turborepo&logoColor=white)](./turbo.json)
[![Docs](https://img.shields.io/badge/docs-Astro-FF5D01?logo=astro&logoColor=white)](./apps/docs)
[![Vue](https://img.shields.io/npm/v/%40drm%2Fmultitabs-vue?logo=vue.js&label=vue)](https://www.npmjs.com/package/@drm/multitabs-vue)
[![React](https://img.shields.io/npm/v/%40drm%2Fmultitabs-react?logo=react&label=react)](https://www.npmjs.com/package/@drm/multitabs-react)
[![Angular](https://img.shields.io/npm/v/%40drm%2Fmultitabs-angular?logo=angular&label=angular)](https://www.npmjs.com/package/@drm/multitabs-angular)

## What this repo contains

This repository holds the publishable packages, the docs site, and the shared
tooling needed to build and release the project.

| Path               | Purpose                                        |
| ------------------ | ---------------------------------------------- |
| `packages/vue`     | `@drm/multitabs-vue`                           |
| `packages/react`   | `@drm/multitabs-react`                         |
| `packages/angular` | `@drm/multitabs-angular`                       |
| `apps/docs`        | Astro landing page and documentation site      |
| `configs`          | Shared TypeScript, ESLint, and Prettier config |
| `.github`          | CI, release automation, and funding metadata   |

## Core capabilities

The packages share the same product intent even though each one follows the
native conventions of its stack.

- Router-native tab identity and navigation.
- Browser-style tab bar behavior for SPAs.
- Drag and drop tab ordering.
- Close, close all, and reload actions.
- Local persistence for open tabs.
- Theme-ready styling with CSS custom properties.
- Zero UI library dependency.

## Installation

You install the package that matches your stack. All packages can be
installed with `pnpm`, `npm`, or `yarn`.

```bash
pnpm add @drm/multitabs-vue
npm install @drm/multitabs-react
yarn add @drm/multitabs-angular
```

## Development

This repo uses `pnpm` workspaces and Turborepo. Install dependencies once from
the repository root, then run workspace scripts as needed.

```bash
pnpm install
pnpm build
pnpm lint
pnpm test
```

For package-specific work, filter the workspace.

```bash
pnpm --filter @drm/multitabs-vue build
pnpm --filter @drm/multitabs-react dev
pnpm --filter @drm/multitabs-docs dev
```

## Documentation

The public docs and landing page live in `apps/docs`. The site is built with
Astro and styled around the blue palette defined for the brand.

The repository includes a docs-only validation workflow and a separate Netlify
deployment workflow for production publishes from `main`.

- Landing page: `apps/docs/src/pages/index.astro`
- Support page: `apps/docs/src/pages/support.astro`
- Stack-specific docs: `apps/docs/src/pages/docs/*`

## Release policy

Package releases currently use a manual versioning model.

- Bump the target package version manually in that package's `package.json`.
- Add a Changeset for the package you want to release.
- Let the package-specific workflow publish to npm.
- Treat the global `release.yml` workflow as a manual fallback, not the default
  publication path.

The source of truth for the release version is the package's `package.json`.
Changesets communicate release intent and release notes, but they do not derive
the package version automatically in the current workflow model.

## Funding

The project supports multiple funding channels so individuals and teams can use
the method that fits them best.

- Crypto wallets: see `apps/docs/src/pages/support.astro`

## License

This project is released under the MIT license.
