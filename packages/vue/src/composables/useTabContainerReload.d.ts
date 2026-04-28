/**
 * Increment the reload nonce for a given tab.
 * Called by useMultiTabs when reloadTab() is triggered.
 */
export declare function bumpTabContainerReload(tabId: string): void;
/**
 * Composable used by tab content container components.
 * Watch the returned nonce to react when a tab is reloaded.
 *
 * @example
 * const { getReloadNonce } = useTabContainerReload()
 * const nonce = computed(() => getReloadNonce(props.tabId))
 * // Use as :key to force remount, or watch() to re-fetch data
 */
export declare function useTabContainerReload(): {
    getReloadNonce: (tabId: string) => number;
};
//# sourceMappingURL=useTabContainerReload.d.ts.map