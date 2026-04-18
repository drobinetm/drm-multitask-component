import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { Location } from "react-router-dom";
import type { MultiTabItem, UseMultiTabsOptions } from "@/types";
import { bumpTabContainerReload } from "./useTabContainerReload";

const DEFAULT_OPTIONS: Required<Omit<UseMultiTabsOptions, "resolveTitle">> = {
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
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MultiTabItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStoredTabs(storageKey: string, tabs: MultiTabItem[]): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tabs));
  } catch {
    // localStorage may be unavailable
  }
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
export function useMultiTabs(options: UseMultiTabsOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const location = useLocation();
  const navigate = useNavigate();

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

      return {
        id,
        title,
        icon: opts.defaultIcon,
        to: { pathname: loc.pathname, search: loc.search, hash: loc.hash },
        isMenuItem: false,
        routePath: loc.pathname,
        caseNumber: getSearchParam(loc.search, "caseNumber"),
        caseTitle: getSearchParam(loc.search, "caseTitle"),
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [opts.resolveTitle, opts.defaultIcon],
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

        const next = prev.filter((t) => t.id !== tab.id);

        if (tab.id === currentTabId) {
          const nextTab = next[index] ?? next[index - 1] ?? next[0];
          if (nextTab) navigate(nextTab.to);
        }

        return next;
      });
    },
    [currentTabId, navigate],
  );

  const closeAllTabs = useCallback(() => {
    setTabs((prev) => {
      const active = prev.find((t) => t.id === currentTabId);
      return active ? [active] : prev.slice(0, 1);
    });
  }, [currentTabId]);

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

export type UseMultiTabsReturn = ReturnType<typeof useMultiTabs>;
