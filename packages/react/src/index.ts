// Public API for @drm/multitabs-react
export { MultiTabs, MultiTabsProvider } from "./components/MultiTabs";
export { useMultiTabs, generateTabId } from "./hooks/useMultiTabs";
export {
  useTabContainerReload,
  bumpTabContainerReload,
} from "./hooks/useTabContainerReload";
export type {
  MultiTabItem,
  MultiTabsTheme,
  UseMultiTabsOptions,
} from "./types";
export type { UseMultiTabsReturn } from "./hooks/useMultiTabs";
