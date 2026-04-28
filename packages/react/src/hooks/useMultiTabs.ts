import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";
import type {
  MultiTabCloseContext,
  MultiTabItem,
  UseMultiTabsOptions,
  UseMultiTabsReturn,
} from "@/types";
import { bumpTabContainerReload } from "./useTabContainerReload";

const DEFAULT_OPTIONS: Required<
  Omit<
    UseMultiTabsOptions,
    | "resolveTitle"
    | "resolveTab"
    | "onBeforeClose"
    | "onTabOpen"
    | "onTabClose"
    | "onTabChange"
  >
> = {
  storageKey: "drm-multitabs",
  defaultIcon: "circle",
  maxTabs: Infinity,
};

// ---------------------------------------------------------------------------
// Tab ID generation
// ---------------------------------------------------------------------------

export function generateTabId(location: Location): string {
  // Use pathname as the stable ID (ignoring search/hash for tab identity)
  return location.pathname;
}

// ---------------------------------------------------------------------------
// Title helpers
// ---------------------------------------------------------------------------

function humanizePathname(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] ?? "Home";
  return last
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function getSearchParam(search: string, key: string): string | null {
  return new URLSearchParams(search).get(key);
}

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

function readStoredTabs(storageKey: string): MultiTabItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MultiTabItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredTabs(storageKey: string, tabs: MultiTabItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(tabs));
  } catch {
    // localStorage may be unavailable
  }
}

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
): boolean {
  if (!onBeforeClose) return true;
  return onBeforeClose(tab, buildCloseContext(tab, reason, tabs, currentTabId));
}

// ---------------------------------------------------------------------------
// useMultiTabs
// ---------------------------------------------------------------------------

/**
 * Core hook for the MultiTabs system.
 *
 * Must be used inside a component wrapped with React Router's context
 * (BrowserRouter, MemoryRouter, etc.).
 *
 * For shared state across components, lift the hook to a Context Provider
 * or use a state management library.
 *
 * @example
 * function Layout() {
 *   const multiTabs = useMultiTabs()
 *   return (
 *     <MultiTabsContext.Provider value={multiTabs}>
 *       <MultiTabs />
 *       <Outlet />
 *     </MultiTabsContext.Provider>
 *   )
 * }
 */
export function useMultiTabs(
  options: UseMultiTabsOptions = {},
): UseMultiTabsReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const location = useLocation();
  const navigate = useNavigate();
  const lastActiveTabIdRef = useRef<string | null>(null);
  const openedTabRef = useRef<MultiTabItem | null>(null);
  const closedTabsRef = useRef<MultiTabItem[]>([]);
  const pendingNavigationRef = useRef<MultiTabItem | null>(null);

  const [tabs, setTabs] = useState<MultiTabItem[]>(() =>
    readStoredTabs(opts.storageKey),
  );

  // Persist to localStorage on every change
  useEffect(() => {
    writeStoredTabs(opts.storageKey, tabs);
  }, [tabs, opts.storageKey]);

  // Current tab ID
  const currentTabId = useMemo(() => generateTabId(location), [location]);

  const currentTab = useMemo(
    () => tabs.find((t) => t.id === currentTabId) ?? null,
    [tabs, currentTabId],
  );

  // ---------------------------------------------------------------------------
  // Resolve tab from current location
  // ---------------------------------------------------------------------------

  const resolveTabFromLocation = useCallback(
    (loc: Location): MultiTabItem => {
      const id = generateTabId(loc);
      const existing = tabs.find((t) => t.id === id);

      let title =
        opts.resolveTitle?.(loc.pathname, loc.search) ??
        getSearchParam(loc.search, "staffTitle") ??
        getSearchParam(loc.search, "caseNumber") ??
        humanizePathname(loc.pathname);

      // Preserve previous title if new location lost it
      if (!title && existing?.title) title = existing.title;

      const defaultTab: MultiTabItem = {
        id,
        title,
        icon: opts.defaultIcon,
        to: { pathname: loc.pathname, search: loc.search, hash: loc.hash },
        routePath: loc.pathname,
        metadata: {
          searchParams: Object.fromEntries(
            new URLSearchParams(loc.search).entries(),
          ),
        },
      };

      const resolved =
        opts.resolveTab?.(loc, {
          existingTab: existing ?? null,
          defaultTab,
        }) ?? {};

      const mergedTab = {
        ...defaultTab,
        ...resolved,
        id: resolved.id ?? defaultTab.id,
        to: resolved.to ?? defaultTab.to,
        title: resolved.title ?? defaultTab.title,
        icon: resolved.icon ?? defaultTab.icon,
        ...(resolved.metadata !== undefined
          ? { metadata: resolved.metadata }
          : defaultTab.metadata !== undefined
            ? { metadata: defaultTab.metadata }
            : {}),
      } satisfies MultiTabItem;

      return mergedTab;
    },
    [opts.resolveTab, opts.resolveTitle, opts.defaultIcon, tabs],
  );

  // ---------------------------------------------------------------------------
  // Route sync — runs on every location change
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const id = generateTabId(location);
    const resolved = resolveTabFromLocation(location);

    setTabs((prev) => {
      const index = prev.findIndex((t) => t.id === id);

      if (index === -1) {
        let next = [...prev];
        if (opts.maxTabs !== Infinity && next.length >= opts.maxTabs) {
          const removeIdx = next.findIndex((t) => t.id !== id);
          if (removeIdx !== -1) next.splice(removeIdx, 1);
        }
        openedTabRef.current = resolved;
        return [...next, resolved];
      }

      const updated = [...prev];
      updated[index] = { ...updated[index]!, ...resolved };
      return updated;
    });
  }, [location, resolveTabFromLocation, opts.maxTabs]);

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  const openTab = useCallback(
    (tab: MultiTabItem) => {
      if (tab.id === currentTabId) return;
      navigate(tab.to);
    },
    [currentTabId, navigate],
  );

  const closeTab = useCallback(
    (tab: MultiTabItem) => {
      setTabs((prev) => {
        if (prev.length <= 1) return prev;
        const index = prev.findIndex((t) => t.id === tab.id);
        if (index === -1) return prev;
        if (
          !canCloseTab(tab, "close", prev, currentTabId, opts.onBeforeClose)
        ) {
          return prev;
        }

        const next = prev.filter((t) => t.id !== tab.id);

        if (tab.id === currentTabId) {
          const nextTab = next[index] ?? next[index - 1] ?? next[0];
          if (nextTab) pendingNavigationRef.current = nextTab;
        }

        closedTabsRef.current = [tab];

        return next;
      });
    },
    [currentTabId, opts.onBeforeClose],
  );

  const closeAllTabs = useCallback(() => {
    setTabs((prev) => {
      const active = prev.find((t) => t.id === currentTabId);
      if (!active) return prev.slice(0, 1);

      const tabsToClose = prev.filter((tab) => tab.id !== active.id);
      const closableTabs = tabsToClose.filter((tab) =>
        canCloseTab(tab, "close-all", prev, currentTabId, opts.onBeforeClose),
      );

      if (closableTabs.length === 0) return prev;

      closedTabsRef.current = closableTabs;

      const blockedIds = new Set(
        tabsToClose
          .filter(
            (tab) => !closableTabs.some((closable) => closable.id === tab.id),
          )
          .map((tab) => tab.id),
      );

      return [active, ...tabsToClose.filter((tab) => blockedIds.has(tab.id))];
    });
  }, [currentTabId, opts.onBeforeClose]);

  const moveTab = useCallback((sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setTabs((prev) => {
      const next = [...prev];
      const sourceIndex = next.findIndex((t) => t.id === sourceId);
      const targetIndex = next.findIndex((t) => t.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) return prev;
      const [moved] = next.splice(sourceIndex, 1);
      if (moved) next.splice(targetIndex, 0, moved);
      return next;
    });
  }, []);

  const reloadTab = useCallback(
    (tab: MultiTabItem) => {
      bumpTabContainerReload(tab.id);
      if (tab.id !== currentTabId) {
        navigate(tab.to);
      }
    },
    [currentTabId, navigate],
  );

  useEffect(() => {
    if (!currentTab || lastActiveTabIdRef.current === currentTab.id) return;
    lastActiveTabIdRef.current = currentTab.id;
    opts.onTabChange?.(currentTab);
  }, [currentTab, opts.onTabChange]);

  useEffect(() => {
    const openedTab = openedTabRef.current;
    if (!openedTab) return;

    openedTabRef.current = null;
    opts.onTabOpen?.(openedTab);
  }, [tabs, opts.onTabOpen]);

  useEffect(() => {
    const closedTabs = closedTabsRef.current;
    if (closedTabs.length === 0) return;

    closedTabsRef.current = [];
    closedTabs.forEach((tab) => {
      opts.onTabClose?.(tab);
    });
  }, [tabs, opts.onTabClose]);

  useEffect(() => {
    const nextTab = pendingNavigationRef.current;
    if (!nextTab) return;

    pendingNavigationRef.current = null;
    navigate(nextTab.to);
  }, [tabs, navigate]);

  return {
    tabs,
    currentTabId,
    currentTab,
    openTab,
    closeTab,
    closeAllTabs,
    moveTab,
    reloadTab,
  };
}
