import { useState, useCallback, useEffect } from "react";

// Module-level singleton: tabId → nonce
const tabReloadNonceState: Record<string, number> = {};
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

/**
 * Increment the reload nonce for a given tab.
 * Called by useMultiTabs when reloadTab() is triggered.
 */
export function bumpTabContainerReload(tabId: string): void {
  tabReloadNonceState[tabId] = (tabReloadNonceState[tabId] ?? 0) + 1;
  notify();
}

/**
 * Hook used by tab content container components.
 * Returns a nonce that increments when the tab is reloaded.
 *
 * @example
 * const nonce = useTabContainerReload(tabId)
 * // Use as key to force remount: <Content key={nonce} />
 */
export function useTabContainerReload(tabId: string): number {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => {
    setTick((value) => value + 1);
  }, []);

  useEffect(() => {
    listeners.add(forceUpdate);
    return () => {
      listeners.delete(forceUpdate);
    };
  }, [forceUpdate]);

  return tabReloadNonceState[tabId] ?? 0;
}
