import { computed, effectScope, ref, watch } from "vue";
import type { Ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import type {
  RouteLocationRaw,
  RouteLocationNormalizedLoaded,
} from "vue-router";
import type { MultiTabItem, UseMultiTabsOptions } from "@/types";
import { bumpTabContainerReload } from "./useTabContainerReload";

const DEFAULT_OPTIONS: Required<UseMultiTabsOptions> = {
  storageKey: "drm-multitabs",
  defaultIcon: "circle",
  maxTabs: Infinity,
  resolveTab: () => undefined,
};

interface MultiTabsStore {
  tabs: Ref<MultiTabItem[]>;
}

const persistenceScope = effectScope(true);
const stores = new Map<string, MultiTabsStore>();

// ---------------------------------------------------------------------------
// Tab ID generation
// ---------------------------------------------------------------------------

function serializeParams(params: Record<string, string | string[]>): string {
  return Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:"${Array.isArray(v) ? v.join(",") : v}"`)
    .join("|");
}

export function generateTabId(route: RouteLocationNormalizedLoaded): string {
  const name = route.name ? String(route.name) : null;
  const params = route.params as Record<string, string | string[]>;

  if (name) {
    const serialized = serializeParams(params);
    return serialized ? `${name}::${serialized}` : name;
  }

  return route.path;
}

// ---------------------------------------------------------------------------
// Title helpers
// ---------------------------------------------------------------------------

function humanizeRouteName(name: string | null | undefined): string {
  if (!name) return "Page";
  return String(name)
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

type SerializedTab = Omit<MultiTabItem, "to"> & { to: string };

function serializeTab(tab: MultiTabItem): SerializedTab {
  return {
    ...tab,
    to: typeof tab.to === "string" ? tab.to : JSON.stringify(tab.to),
  };
}

function deserializeTab(raw: SerializedTab): MultiTabItem {
  let to: RouteLocationRaw;
  try {
    to =
      typeof raw.to === "string" && raw.to.startsWith("{")
        ? JSON.parse(raw.to)
        : raw.to;
  } catch {
    to = raw.to;
  }
  return { ...raw, to };
}

function readStoredTabs(storageKey: string): MultiTabItem[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SerializedTab[];
    return Array.isArray(parsed) ? parsed.map(deserializeTab) : [];
  } catch {
    return [];
  }
}

function writeStoredTabs(storageKey: string, tabs: MultiTabItem[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tabs.map(serializeTab)));
  } catch {
    // localStorage may be unavailable in SSR or private browsing
  }
}

function getStore(storageKey: string): MultiTabsStore {
  const existing = stores.get(storageKey);
  if (existing) {
    return existing;
  }

  const store: MultiTabsStore = {
    tabs: ref<MultiTabItem[]>(readStoredTabs(storageKey)),
  };

  persistenceScope.run(() => {
    watch(
      store.tabs,
      (val) => {
        writeStoredTabs(storageKey, val);
      },
      { deep: true },
    );
  });

  stores.set(storageKey, store);
  return store;
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
  const opts: Required<UseMultiTabsOptions> = {
    ...DEFAULT_OPTIONS,
    ...options,
  };
  const route = useRoute();
  const router = useRouter();
  const store = getStore(opts.storageKey);

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const tabs = store.tabs;

  const currentTabId = computed(() => generateTabId(route));

  const currentTab = computed<MultiTabItem | null>(
    () => tabs.value.find((t) => t.id === currentTabId.value) ?? null,
  );

  // ---------------------------------------------------------------------------
  // Tab resolution helpers (override these via options for custom behavior)
  // ---------------------------------------------------------------------------

  function buildDefaultTabFromRoute(
    r: RouteLocationNormalizedLoaded,
  ): MultiTabItem {
    const id = generateTabId(r);
    const existing = tabs.value.find((t) => t.id === id);

    // Resolve title
    let title = "";
    if (r.query["staffTitle"]) {
      title = String(r.query["staffTitle"]);
    } else if (r.query["caseNumber"]) {
      title = String(r.query["caseNumber"]);
    } else if (r.meta?.["title"]) {
      title = String(r.meta["title"]);
    } else if (r.name) {
      title = humanizeRouteName(String(r.name));
    } else {
      title = r.path;
    }

    // Preserve previous title if the new route no longer carries it
    if (!title && existing?.title) {
      title = existing.title;
    }

    const icon = (r.meta?.["icon"] as string | undefined) ?? opts.defaultIcon;

    return {
      id,
      title,
      icon,
      to: { name: r.name ?? undefined, params: r.params, query: r.query },
      isMenuItem: Boolean(r.meta?.["isMenuItem"]),
      routeName: r.name ? String(r.name) : null,
      caseNumber: r.query["caseNumber"] ? String(r.query["caseNumber"]) : null,
      caseTitle: r.query["caseTitle"] ? String(r.query["caseTitle"]) : null,
    };
  }

  function resolveTabFromRoute(r: RouteLocationNormalizedLoaded): MultiTabItem {
    const defaultTab = buildDefaultTabFromRoute(r);
    const resolved =
      opts.resolveTab(r, {
        existingTab: tabs.value.find((t) => t.id === defaultTab.id) ?? null,
        defaultTab,
      }) ?? {};

    return {
      ...defaultTab,
      ...resolved,
      id: resolved.id ?? defaultTab.id,
      to: resolved.to ?? defaultTab.to,
      title: resolved.title ?? defaultTab.title,
      icon: resolved.icon ?? defaultTab.icon,
      isMenuItem: resolved.isMenuItem ?? defaultTab.isMenuItem,
    };
  }

  // ---------------------------------------------------------------------------
  // Route sync
  // ---------------------------------------------------------------------------

  function syncCurrentTab() {
    const id = generateTabId(route);
    const index = tabs.value.findIndex((t) => t.id === id);
    const resolved = resolveTabFromRoute(route);

    if (index === -1) {
      // Respect maxTabs: remove oldest non-active tab if over limit
      if (opts.maxTabs !== Infinity && tabs.value.length >= opts.maxTabs) {
        const removeIdx = tabs.value.findIndex((t) => t.id !== id);
        if (removeIdx !== -1) tabs.value.splice(removeIdx, 1);
      }
      tabs.value.push(resolved);
    } else {
      // Update metadata (title, caseNumber, etc.) in place
      tabs.value[index] = { ...tabs.value[index]!, ...resolved };
    }
  }

  watch(() => route.fullPath, syncCurrentTab, { immediate: true });

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  function openTab(tab: MultiTabItem): void {
    if (tab.id === currentTabId.value) return;
    router.push(tab.to);
  }

  function closeTab(tab: MultiTabItem): void {
    if (tabs.value.length <= 1) return;

    const index = tabs.value.findIndex((t) => t.id === tab.id);
    if (index === -1) return;

    tabs.value.splice(index, 1);

    // If the closed tab was active, navigate to an adjacent tab
    if (tab.id === currentTabId.value) {
      const nextTab =
        tabs.value[index] ?? tabs.value[index - 1] ?? tabs.value[0];
      if (nextTab) router.push(nextTab.to);
    }
  }

  function closeAllTabs(): void {
    const active = currentTab.value;
    if (!active) return;
    tabs.value = [active];
  }

  function moveTab(sourceId: string, targetId: string): void {
    if (sourceId === targetId) return;
    const sourceIndex = tabs.value.findIndex((t) => t.id === sourceId);
    const targetIndex = tabs.value.findIndex((t) => t.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const [moved] = tabs.value.splice(sourceIndex, 1);
    if (moved) tabs.value.splice(targetIndex, 0, moved);
  }

  function reloadTab(tab: MultiTabItem): void {
    bumpTabContainerReload(tab.id);
    if (tab.id !== currentTabId.value) {
      router.push(tab.to);
    }
  }

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
