import type { MultiTabsTheme } from "@/types";
import "@/styles/multitabs.css";
type __VLS_Props = {
    /** Custom theme overrides via CSS custom properties */
    theme?: MultiTabsTheme;
};
declare var __VLS_1: {}, __VLS_7: {
    tab: {
        id: string;
        title: string;
        icon: string;
        to: string | {
            name?: import("vue-router").RouteRecordNameGeneric;
            params?: import("vue-router").RouteParamsRawGeneric;
            path?: undefined | undefined;
            query?: import("vue-router").LocationQueryRaw;
            hash?: string;
            replace?: boolean;
            force?: boolean;
            state?: import("vue-router").HistoryState;
        } | {
            path: string;
            query?: import("vue-router").LocationQueryRaw;
            hash?: string;
            replace?: boolean;
            force?: boolean;
            state?: import("vue-router").HistoryState;
        };
        isMenuItem: boolean;
        routeName?: string | null;
        caseNumber?: string | null;
        caseTitle?: string | null;
    };
}, __VLS_9: {}, __VLS_11: {}, __VLS_17: {}, __VLS_19: {}, __VLS_25: {};
type __VLS_Slots = {} & {
    'launcher-icon'?: (props: typeof __VLS_1) => any;
} & {
    'tab-icon'?: (props: typeof __VLS_7) => any;
} & {
    'close-icon'?: (props: typeof __VLS_9) => any;
} & {
    'dropdown-icon'?: (props: typeof __VLS_11) => any;
} & {
    'menu-icon-reload'?: (props: typeof __VLS_17) => any;
} & {
    'menu-icon-close'?: (props: typeof __VLS_19) => any;
} & {
    'menu-icon-close-all'?: (props: typeof __VLS_25) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
//# sourceMappingURL=MultiTabs.vue.d.ts.map