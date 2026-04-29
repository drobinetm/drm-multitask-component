import type { ComputedRef } from "vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import type { MultiTabItem, UseMultiTabsOptions } from "../../types";
export declare function buildDefaultTabFromRoute(route: RouteLocationNormalizedLoaded, tabs: MultiTabItem[], defaultIcon: string): MultiTabItem;
export declare function resolveTabFromRoute(route: RouteLocationNormalizedLoaded, tabs: MultiTabItem[], defaultIcon: string, tabResolver: ComputedRef<NonNullable<UseMultiTabsOptions["resolveTab"]>>): MultiTabItem;
//# sourceMappingURL=routeTabResolver.d.ts.map