import type { MultiTabItem, UseMultiTabsOptions } from "@/types";
import { createScopedStorageKey, resetMultiTabsRuntime } from "./internal/runtimeStore";
import { generateTabId } from "./internal/tabId";
/**
 * Core composable for the MultiTabs system.
 *
 * Manages the list of open tabs, syncs with Vue Router, and persists
 * to localStorage. Place this composable in a shared singleton context
 * (e.g. a Pinia store, provide/inject, or a module-level call) to share
 * state across components.
 *
 * @example
 * // In a layout component or a provide/inject setup:
 * const multiTabs = useMultiTabs()
 * provide('multiTabs', multiTabs)
 *
 * // In MultiTabs.vue or any child:
 * const { tabs, currentTabId, openTab, closeTab } = inject('multiTabs')
 */
export declare function useMultiTabs(options?: UseMultiTabsOptions): {
    tabs: import("vue").WritableComputedRef<MultiTabItem[], MultiTabItem[]>;
    currentTabId: import("vue").ComputedRef<string>;
    currentTab: import("vue").ComputedRef<MultiTabItem | null>;
    openTab: (tab: MultiTabItem) => void;
    closeTab: (tab: MultiTabItem) => Promise<boolean>;
    closeAllTabs: () => Promise<MultiTabItem[]>;
    moveTab: (sourceId: string, targetId: string) => void;
    reloadTab: (tab: MultiTabItem) => void;
    generateTabId: typeof generateTabId;
};
export type UseMultiTabsReturn = ReturnType<typeof useMultiTabs>;
export { createScopedStorageKey, resetMultiTabsRuntime, generateTabId };
//# sourceMappingURL=useMultiTabs.d.ts.map