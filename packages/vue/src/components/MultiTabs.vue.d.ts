import type { MultiTabCloseGuard, MultiTabMoveEvent, MultiTabItem, MultiTabsTheme, MultiTabResolver } from "@/types";
import "@/styles/multitabs.css";
type __VLS_Props = {
    /** Custom theme overrides via CSS custom properties */
    theme?: MultiTabsTheme;
    /** Controlled tab list for host-managed state */
    tabs?: MultiTabItem[];
    /** Controlled active tab ID for host-managed state */
    activeTabId?: string | null;
    /** localStorage key used by the internal multitabs store */
    storageKey?: string;
    /** Default icon used when no icon can be resolved */
    defaultIcon?: string;
    /** Maximum number of tabs allowed */
    maxTabs?: number;
    /** Optional route-to-tab resolver */
    resolveTab?: MultiTabResolver;
    /** Return false to block a close action */
    onBeforeClose?: MultiTabCloseGuard;
};
declare var __VLS_1: {}, __VLS_7: {
    tab: MultiTabItem;
}, __VLS_9: {}, __VLS_11: {}, __VLS_24: {}, __VLS_26: {}, __VLS_39: {};
type __VLS_Slots = {} & {
    'launcher-icon'?: (props: typeof __VLS_1) => any;
} & {
    'tab-icon'?: (props: typeof __VLS_7) => any;
} & {
    'close-icon'?: (props: typeof __VLS_9) => any;
} & {
    'dropdown-icon'?: (props: typeof __VLS_11) => any;
} & {
    'menu-icon-reload'?: (props: typeof __VLS_24) => any;
} & {
    'menu-icon-close'?: (props: typeof __VLS_26) => any;
} & {
    'menu-icon-close-all'?: (props: typeof __VLS_39) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    close: (tab: MultiTabItem) => any;
    "close-all": (tabs: MultiTabItem[]) => any;
    reload: (tab: MultiTabItem) => any;
    open: (tab: MultiTabItem) => any;
    activate: (tab: MultiTabItem) => any;
    move: (event: MultiTabMoveEvent) => any;
    "update:tabs": (tabs: MultiTabItem[]) => any;
    "update:activeTabId": (tabId: string | null) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClose?: (tab: MultiTabItem) => any;
    "onClose-all"?: (tabs: MultiTabItem[]) => any;
    onReload?: (tab: MultiTabItem) => any;
    onOpen?: (tab: MultiTabItem) => any;
    onActivate?: (tab: MultiTabItem) => any;
    onMove?: (event: MultiTabMoveEvent) => any;
    "onUpdate:tabs"?: (tabs: MultiTabItem[]) => any;
    "onUpdate:activeTabId"?: (tabId: string | null) => any;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
//# sourceMappingURL=MultiTabs.vue.d.ts.map