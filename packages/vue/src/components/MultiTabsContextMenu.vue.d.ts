import type { MultiTabItem } from "@/types";
type __VLS_Props = {
    tab: MultiTabItem | null;
    position: {
        x: number;
        y: number;
    };
};
declare var __VLS_5: {}, __VLS_7: {};
type __VLS_Slots = {} & {
    'menu-icon-reload'?: (props: typeof __VLS_5) => any;
} & {
    'menu-icon-close'?: (props: typeof __VLS_7) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {
    menuRef: import("vue").Ref<HTMLElement | null, HTMLElement | null>;
}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    close: (tab: MultiTabItem) => any;
    keydown: (event: KeyboardEvent) => any;
    reload: (tab: MultiTabItem) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClose?: (tab: MultiTabItem) => any;
    onKeydown?: (event: KeyboardEvent) => any;
    onReload?: (tab: MultiTabItem) => any;
}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
//# sourceMappingURL=MultiTabsContextMenu.vue.d.ts.map