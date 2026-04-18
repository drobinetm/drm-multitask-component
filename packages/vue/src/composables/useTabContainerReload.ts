import { reactive } from "vue";

/**
 * Module-level reactive record: tabId → reload nonce.
 * Lives outside any component instance — acts as a cross-instance singleton.
 */
const tabReloadNonceState = reactive<Record<string, number>>({});

/**
 * Increment the reload nonce for a given tab.
 * Called by useMultiTabs when reloadTab() is triggered.
 */
export function bumpTabContainerReload(tabId: string): void {
  tabReloadNonceState[tabId] = (tabReloadNonceState[tabId] ?? 0) + 1;
}

/**
 * Composable used by tab content container components.
 * Watch the returned nonce to react when a tab is reloaded.
 *
 * @example
 * const { getReloadNonce } = useTabContainerReload()
 * const nonce = computed(() => getReloadNonce(props.tabId))
 * // Use as :key to force remount, or watch() to re-fetch data
 */
export function useTabContainerReload() {
  function getReloadNonce(tabId: string): number {
    return tabReloadNonceState[tabId] ?? 0;
  }

  return { getReloadNonce };
}
