import type { MultiTabItem } from "@/types";
type __VLS_Props = {
    open: boolean;
    tabs: MultiTabItem[];
    currentTabId: string | null;
    position: {
        x: number;
        y: number;
    };
};
declare var __VLS_5: {};
type __VLS_Slots = {} & {
    'menu-icon-close-all'?: (props: typeof __VLS_5) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    menuRef: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "close-all": () => any;
    keydown: (event: KeyboardEvent) => any;
    select: (tab: MultiTabItem) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onClose-all"?: () => any;
    onKeydown?: (event: KeyboardEvent) => any;
    onSelect?: (tab: MultiTabItem) => any;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
//# sourceMappingURL=MultiTabsDropdownMenu.vue.d.ts.map