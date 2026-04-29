import { effectScope, ref, watch } from "vue";
import type { Ref } from "vue";
import type { RouteLocationRaw } from "vue-router";
import type { MultiTabItem } from "../../types";

interface MultiTabsStore {
  tabs: Ref<MultiTabItem[]>;
}

type SerializedTab = Omit<MultiTabItem, "to"> & { to: string };

const persistenceScope = effectScope(true);
const stores = new Map<string, MultiTabsStore>();

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
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return [];
  }

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
  if (typeof window === "undefined" || !("localStorage" in window)) {
    return;
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(tabs.map(serializeTab)));
  } catch {
    // localStorage may be unavailable in SSR or private browsing
  }
}

export function getRuntimeStore(storageKey: string): MultiTabsStore {
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
      (value) => {
        writeStoredTabs(storageKey, value);
      },
      { deep: true },
    );
  });

  stores.set(storageKey, store);
  return store;
}

export function resetMultiTabsRuntime(storageKey?: string): void {
  if (storageKey === undefined) {
    for (const store of stores.values()) {
      store.tabs.value = [];
    }
    stores.clear();
    return;
  }

  const store = stores.get(storageKey);
  if (!store) {
    return;
  }

  store.tabs.value = [];
  stores.delete(storageKey);
}

export function createScopedStorageKey(
  baseKey: string,
  ...segments: Array<string | number | null | undefined>
): string {
  const normalizedSegments = segments
    .filter(
      (segment) => segment !== null && segment !== undefined && segment !== "",
    )
    .map((segment) => String(segment).trim())
    .filter(Boolean)
    .map((segment) => segment.replace(/:/g, "-"));

  return [baseKey, ...normalizedSegments].join(":");
}
