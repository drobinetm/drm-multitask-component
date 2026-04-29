import { computed, ref, toValue, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import type {
  MultiTabCloseContext,
  MultiTabItem,
  UseMultiTabsOptions,
} from "@/types";
import { bumpTabContainerReload } from "./useTabContainerReload";
import {
  createScopedStorageKey,
  getRuntimeStore,
  resetMultiTabsRuntime,
} from "./internal/runtimeStore";
import { resolveTabFromRoute } from "./internal/routeTabResolver";
import { generateTabId } from "./internal/tabId";

interface ResolvedUseMultiTabsOptions {
  storageKey: string;
  defaultIcon: string;
  maxTabs: number;
  resolveTab: NonNullable<UseMultiTabsOptions["resolveTab"]>;
  tabs: UseMultiTabsOptions["tabs"];
  activeTabId: UseMultiTabsOptions["activeTabId"];
  onTabsChange: NonNullable<UseMultiTabsOptions["onTabsChange"]>;
  onActiveTabIdChange: NonNullable<UseMultiTabsOptions["onActiveTabIdChange"]>;
  onBeforeClose: NonNullable<UseMultiTabsOptions["onBeforeClose"]>;
  onTabOpen: NonNullable<UseMultiTabsOptions["onTabOpen"]>;
  onTabClose: NonNullable<UseMultiTabsOptions["onTabClose"]>;
  onTabChange: NonNullable<UseMultiTabsOptions["onTabChange"]>;
}

const DEFAULT_OPTIONS: ResolvedUseMultiTabsOptions = {
  storageKey: "drm-multitabs",
  defaultIcon: "circle",
  maxTabs: Infinity,
  resolveTab: () => undefined,
  tabs: undefined,
  activeTabId: undefined,
  onTabsChange: () => undefined,
  onActiveTabIdChange: () => undefined,
  onBeforeClose: () => true,
  onTabOpen: () => undefined,
  onTabClose: () => undefined,
  onTabChange: () => undefined,
};

const isDev = Boolean(
  (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV,
);

function buildCloseContext(
  tab: MultiTabItem,
  reason: MultiTabCloseContext["reason"],
  tabs: MultiTabItem[],
  currentTabId: string,
): MultiTabCloseContext {
  return {
    reason,
    currentTabId,
    remainingTabs: tabs.filter((item) => item.id !== tab.id),
  };
}

function canCloseTab(
  tab: MultiTabItem,
  reason: MultiTabCloseContext["reason"],
  tabs: MultiTabItem[],
  currentTabId: string,
  onBeforeClose?: UseMultiTabsOptions["onBeforeClose"],
): boolean | Promise<boolean> {
  if (!onBeforeClose) {
    return true;
  }

  return onBeforeClose(tab, buildCloseContext(tab, reason, tabs, currentTabId));
}

// ---------------------------------------------------------------------------
// useMultiTabs
// ---------------------------------------------------------------------------

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
export function useMultiTabs(options: UseMultiTabsOptions = {}) {
  const opts = {
    ...DEFAULT_OPTIONS,
    ...options,
  } satisfies UseMultiTabsOptions;
  const route = useRoute();
  const router = useRouter();
  const storageKey = computed<string>(
    () => toValue(opts.storageKey) ?? DEFAULT_OPTIONS.storageKey,
  );
  const resolvedDefaultIcon = computed<string>(
    () => toValue(opts.defaultIcon) ?? DEFAULT_OPTIONS.defaultIcon,
  );
  const resolvedMaxTabs = computed<number>(
    () => toValue(opts.maxTabs) ?? DEFAULT_OPTIONS.maxTabs,
  );
  const resolvedTabResolver = computed(() => opts.resolveTab);
  const store = computed(() => getRuntimeStore(storageKey.value));
  const previousOpenedTabIds = ref<string[]>([]);
  const previousActiveTabId = ref<string | null>(null);

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const uncontrolledTabs = computed<MultiTabItem[]>({
    get: () => store.value.tabs.value,
    set: (nextTabs) => {
      store.value.tabs.value = nextTabs;
    },
  });
  const controlledTabs = computed(() => toValue(opts.tabs));
  const isControlled = computed(() => controlledTabs.value !== undefined);

  const tabs = computed<MultiTabItem[]>({
    get: () => controlledTabs.value ?? uncontrolledTabs.value,
    set: (nextTabs) => {
      if (isControlled.value) {
        opts.onTabsChange(nextTabs);
        return;
      }

      uncontrolledTabs.value = nextTabs;
    },
  });

  // ---------------------------------------------------------------------------
  // Tab resolution helpers (override these via options for custom behavior)
  // ---------------------------------------------------------------------------

  const resolvedCurrentTab = computed(() =>
    resolveTabFromRoute(
      route,
      tabs.value,
      resolvedDefaultIcon.value,
      resolvedTabResolver,
    ),
  );

  const currentTabId = computed(() => {
    const controlledActiveTabId = toValue(opts.activeTabId);
    return controlledActiveTabId ?? resolvedCurrentTab.value.id;
  });

  const currentTab = computed<MultiTabItem | null>(
    () => tabs.value.find((t) => t.id === currentTabId.value) ?? null,
  );
  const currentControlledTab = computed<MultiTabItem | null>(() => {
    const controlledId = toValue(opts.activeTabId);
    if (controlledId === undefined) {
      return null;
    }

    return tabs.value.find((tab) => tab.id === controlledId) ?? null;
  });

  // ---------------------------------------------------------------------------
  // Route sync
  // ---------------------------------------------------------------------------

  function syncCurrentTab() {
    const resolved = resolvedCurrentTab.value;
    const id = resolved.id;
    const index = tabs.value.findIndex((t) => t.id === id);
    const nextTabs = [...tabs.value];

    if (index === -1) {
      // Respect maxTabs: remove oldest non-active tab if over limit
      while (
        resolvedMaxTabs.value !== Infinity &&
        nextTabs.length >= resolvedMaxTabs.value
      ) {
        const removeIdx = nextTabs.findIndex((t) => t.id !== id);
        if (removeIdx === -1) break;
        nextTabs.splice(removeIdx, 1);
      }
      nextTabs.push(resolved);
      tabs.value = nextTabs;
    } else {
      // Update metadata (title, caseNumber, etc.) in place
      nextTabs[index] = { ...nextTabs[index]!, ...resolved };
      tabs.value = nextTabs;
    }

    opts.onActiveTabIdChange(resolved.id);
  }

  watch(() => route.fullPath, syncCurrentTab, { immediate: true });

  watch(storageKey, () => {
    previousOpenedTabIds.value = [];
    previousActiveTabId.value = null;
    syncCurrentTab();
  });

  watch(
    currentControlledTab,
    async (tab) => {
      if (!isControlled.value || !tab) {
        return;
      }

      const currentRouteTab = resolvedCurrentTab.value;
      if (currentRouteTab.id === tab.id) {
        return;
      }

      await router.push(tab.to);
    },
    { flush: "post" },
  );

  watch(
    [isControlled, controlledTabs, () => toValue(opts.activeTabId)],
    ([controlled, nextTabs, activeId]) => {
      if (!controlled) {
        return;
      }

      if (!Array.isArray(nextTabs)) {
        return;
      }

      if (activeId === null) {
        return;
      }

      if (
        activeId !== undefined &&
        !nextTabs.some((tab) => tab.id === activeId)
      ) {
        if (isDev) {
          console.warn(
            `[drm-multitabs-vue] Controlled activeTabId "${activeId}" does not exist in the controlled tabs list.`,
          );
        }
      }
    },
    { immediate: true },
  );

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  function openTab(tab: MultiTabItem): void {
    if (tab.id === currentTabId.value) return;
    router.push(tab.to);
  }

  async function closeTab(tab: MultiTabItem): Promise<boolean> {
    if (tabs.value.length <= 1) return false;

    const index = tabs.value.findIndex((t) => t.id === tab.id);
    if (index === -1) return false;

    const canClose = await canCloseTab(
      tab,
      "close",
      tabs.value,
      currentTabId.value,
      opts.onBeforeClose,
    );

    if (!canClose) {
      return false;
    }

    const refreshedIndex = tabs.value.findIndex((t) => t.id === tab.id);
    if (refreshedIndex === -1) return false;

    const nextTabs = [...tabs.value];
    nextTabs.splice(refreshedIndex, 1);
    tabs.value = nextTabs;
    opts.onTabClose(tab);

    // If the closed tab was active, navigate to an adjacent tab
    if (tab.id === currentTabId.value) {
      const nextTab =
        nextTabs[refreshedIndex] ?? nextTabs[refreshedIndex - 1] ?? nextTabs[0];
      if (nextTab) {
        opts.onActiveTabIdChange(nextTab.id);
        await router.push(nextTab.to);
      }
    }

    return true;
  }

  async function closeAllTabs(): Promise<MultiTabItem[]> {
    const active = currentTab.value;
    if (!active) return [];

    const tabsToClose = tabs.value.filter((tab) => tab.id !== active.id);
    if (tabsToClose.length === 0) {
      return [];
    }

    const closableTabs: MultiTabItem[] = [];

    for (const tab of tabsToClose) {
      const canClose = await canCloseTab(
        tab,
        "close-all",
        tabs.value,
        currentTabId.value,
        opts.onBeforeClose,
      );

      if (canClose) {
        closableTabs.push(tab);
      }
    }

    if (closableTabs.length === 0) {
      return [];
    }

    const blockedIds = new Set(
      tabsToClose
        .filter(
          (tab) => !closableTabs.some((closable) => closable.id === tab.id),
        )
        .map((tab) => tab.id),
    );

    tabs.value = [
      active,
      ...tabsToClose.filter((tab) => blockedIds.has(tab.id)),
    ];
    closableTabs.forEach((tab) => {
      opts.onTabClose(tab);
    });

    return closableTabs;
  }

  function moveTab(sourceId: string, targetId: string): void {
    if (sourceId === targetId) return;
    const nextTabs = [...tabs.value];
    const sourceIndex = nextTabs.findIndex((t) => t.id === sourceId);
    const targetIndex = nextTabs.findIndex((t) => t.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const [moved] = nextTabs.splice(sourceIndex, 1);
    if (moved) nextTabs.splice(targetIndex, 0, moved);
    tabs.value = nextTabs;
  }

  function reloadTab(tab: MultiTabItem): void {
    bumpTabContainerReload(tab.id);
    if (tab.id !== currentTabId.value) {
      opts.onActiveTabIdChange(tab.id);
      router.push(tab.to);
    }
  }

  watch(
    tabs,
    (nextTabs) => {
      const previousIds = previousOpenedTabIds.value;
      const nextIds = nextTabs.map((tab) => tab.id);

      if (previousIds.length === 0) {
        previousOpenedTabIds.value = nextIds;
        return;
      }

      for (const tab of nextTabs) {
        if (!previousIds.includes(tab.id)) {
          opts.onTabOpen(tab);
        }
      }

      previousOpenedTabIds.value = nextIds;
    },
    { immediate: true },
  );

  watch(
    currentTab,
    (tab) => {
      if (!tab || previousActiveTabId.value === tab.id) {
        previousActiveTabId.value = tab?.id ?? null;
        return;
      }

      previousActiveTabId.value = tab.id;
      opts.onTabChange(tab);
    },
    { immediate: true },
  );

  return {
    // State
    tabs,
    currentTabId,
    currentTab,
    // Actions
    openTab,
    closeTab,
    closeAllTabs,
    moveTab,
    reloadTab,
    // Utilities
    generateTabId,
  };
}

export type UseMultiTabsReturn = ReturnType<typeof useMultiTabs>;

export { createScopedStorageKey, resetMultiTabsRuntime, generateTabId };
