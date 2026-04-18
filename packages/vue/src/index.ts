// Public API for @drm/multitabs-vue
export { default as MultiTabs } from "./components/MultiTabs.vue";
export { useMultiTabs, generateTabId } from "./composables/useMultiTabs";
export {
  useTabContainerReload,
  bumpTabContainerReload,
} from "./composables/useTabContainerReload";
export type {
  MultiTabItem,
  MultiTabsTheme,
  UseMultiTabsOptions,
} from "./types";
export type { UseMultiTabsReturn } from "./composables/useMultiTabs";
