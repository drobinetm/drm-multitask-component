// Public API for @drobinetm/multitabs-react
export {
  MultiTabs,
  MultiTabsProvider,
  useMultiTabsController,
} from "./components/MultiTabs";
export { useMultiTabs, generateTabId } from "./hooks/useMultiTabs";
export {
  useTabContainerReload,
  bumpTabContainerReload,
} from "./hooks/useTabContainerReload";
export type {
  MultiTabCloseContext,
  MultiTabResolver,
  MultiTabItem,
  MultiTabsTheme,
  ResolveTabContext,
  ResolveTabResult,
  UseMultiTabsOptions,
  UseMultiTabsReturn,
} from "./types";
