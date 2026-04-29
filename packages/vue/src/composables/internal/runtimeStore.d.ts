import type { Ref } from "vue";
import type { MultiTabItem } from "../../types";
interface MultiTabsStore {
    tabs: Ref<MultiTabItem[]>;
}
export declare function getRuntimeStore(storageKey: string): MultiTabsStore;
export declare function resetMultiTabsRuntime(storageKey?: string): void;
export declare function createScopedStorageKey(baseKey: string, ...segments: Array<string | number | null | undefined>): string;
export {};
//# sourceMappingURL=runtimeStore.d.ts.map