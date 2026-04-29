import { useSyncExternalStore } from "react";

// Module-level singleton: tabId → nonce
const tabReloadNonceState: Record<string, number> = {};
const listenersByTabId = new Map<string, Set<() => void>>();

function notify(tabId: string) {
  listenersByTabId.get(tabId)?.forEach((listener) => {
    listener();
  });
}

function subscribe(tabId: string, listener: () => void): () => void {
  const listeners = listenersByTabId.get(tabId) ?? new Set<() => void>();
  listeners.add(listener);
  listenersByTabId.set(tabId, listeners);

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      listenersByTabId.delete(tabId);
    }
  };
}

function getSnapshot(tabId: string): number {
  return tabReloadNonceState[tabId] ?? 0;
}

/**
 * Increment the reload nonce for a given tab.
 * Called by useMultiTabs when reloadTab() is triggered.
 */
export function bumpTabContainerReload(tabId: string): void {
  tabReloadNonceState[tabId] = getSnapshot(tabId) + 1;
  notify(tabId);
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
  return useSyncExternalStore(
    (onStoreChange) => subscribe(tabId, onStoreChange),
    () => getSnapshot(tabId),
    () => 0,
  );
}
