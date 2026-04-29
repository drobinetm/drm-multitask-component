// Public API for @drobinetm/multitabs-vue
export { default as MultiTabs } from "./components/MultiTabs.vue";
export {
  useMultiTabs,
  createScopedStorageKey,
  generateTabId,
  resetMultiTabsRuntime,
} from "./composables/useMultiTabs";
export {
  useTabContainerReload,
  bumpTabContainerReload,
} from "./composables/useTabContainerReload";
export type {
  CreateScopedStorageKey,
  MultiTabCloseContext,
  MultiTabCloseGuard,
  MultiTabCloseReason,
  MultiTabResolver,
  MultiTabItem,
  MultiTabsTheme,
  MultiTabMoveEvent,
  ResolveTabContext,
  ResolveTabResult,
  UseMultiTabsOptions,
} from "./types";
export type { UseMultiTabsReturn } from "./composables/useMultiTabs";
