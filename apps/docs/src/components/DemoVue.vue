<script setup lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  h,
  onMounted,
  onUnmounted,
  computed,
  ref,
} from "vue";
import {
  createMemoryHistory,
  createRouter,
  RouterView,
  type RouteRecordRaw,
} from "vue-router";
import {
  MultiTabs,
  createScopedStorageKey as createTabsStorageKey,
  resetMultiTabsRuntime,
  type MultiTabResolver,
} from "@drobinetm/multitabs-vue";
import "@drobinetm/multitabs-vue/styles";

export type ScenarioId =
  | "default"
  | "overflow"
  | "limit"
  | "labels"
  | "resolver"
  | "slots";

interface DemoVueProps {
  scenario?: ScenarioId;
}

type DemoRoute = {
  name: string;
  path: string;
  label: string;
  title?: string;
  body: string;
  icon:
    | "home"
    | "info"
    | "report"
    | "settings"
    | "calendar"
    | "users"
    | "billing"
    | "shield"
    | "receipt"
    | "briefcase"
    | "check";
};

const props = withDefaults(defineProps<DemoVueProps>(), {
  scenario: "default",
});

const vueTheme = {
  shellBg: "rgba(65, 184, 131, 0.08)",
  tabBg: "rgba(255, 255, 255, 0.05)",
  tabColor: "#dbfff1",
  activeTabBg: "#41b883",
  activeTabColor: "#081610",
  activeTabBorderColor: "#41b883",
  closeHoverColor: "#41b883",
  dragOverColor: "#41b883",
} as const;

const customTheme = {
  shellBg: "rgba(65, 184, 131, 0.12)",
  tabBg: "rgba(30, 41, 59, 0.94)",
  tabColor: "#d1fae5",
  activeTabBg: "#41b883",
  activeTabColor: "#081610",
  activeTabBorderColor: "#6ee7b7",
  closeHoverColor: "#6ee7b7",
  dragOverColor: "#41b883",
  borderRadius: "18px",
} as const;

const defaultRoutes: DemoRoute[] = [
  {
    name: "home",
    path: "/",
    label: "Welcome",
    title: "Home",
    body: "Navigate using the links below to open new tabs.",
    icon: "home",
  },
  {
    name: "about",
    path: "/about",
    label: "About",
    title: "About",
    body: "Each route visit opens a new persistent tab in the workspace.",
    icon: "info",
  },
  {
    name: "reports",
    path: "/reports",
    label: "Reports",
    title: "Reports",
    body: "This tab stays open while you navigate to other sections.",
    icon: "report",
  },
  {
    name: "settings",
    path: "/settings",
    label: "Settings",
    title: "Settings",
    body: "Tabs can be reordered by dragging.",
    icon: "settings",
  },
];

const overflowRoutes: DemoRoute[] = [
  {
    name: "overflow-inbox",
    path: "/inbox",
    label: "Inbox",
    title: "Inbox",
    body: "Open all routes to force overflow and review the dropdown menu.",
    icon: "home",
  },
  {
    name: "overflow-calendar",
    path: "/calendar",
    label: "Calendar",
    title: "Calendar",
    body: "Opens another persistent tab.",
    icon: "calendar",
  },
  {
    name: "overflow-analytics",
    path: "/analytics",
    label: "Analytics",
    title: "Analytics",
    body: "Keeps growing the workspace.",
    icon: "report",
  },
  {
    name: "overflow-customers",
    path: "/customers",
    label: "Customers",
    title: "Customers",
    body: "Useful for overflow and dropdown review.",
    icon: "users",
  },
  {
    name: "overflow-billing",
    path: "/billing",
    label: "Billing",
    title: "Billing",
    body: "Continue opening tabs to test the rail.",
    icon: "billing",
  },
  {
    name: "overflow-security",
    path: "/security",
    label: "Security",
    title: "Security",
    body: "The dropdown stays usable with many tabs.",
    icon: "shield",
  },
];

const limitRoutes: DemoRoute[] = [
  {
    name: "limit-alpha",
    path: "/alpha",
    label: "Alpha",
    title: "Alpha",
    body: "Tab one of the limited workspace.",
    icon: "briefcase",
  },
  {
    name: "limit-beta",
    path: "/beta",
    label: "Beta",
    title: "Beta",
    body: "Tab two of the limited workspace.",
    icon: "users",
  },
  {
    name: "limit-gamma",
    path: "/gamma",
    label: "Gamma",
    title: "Gamma",
    body: "Third tab fills the configured cap.",
    icon: "report",
  },
  {
    name: "limit-delta",
    path: "/delta",
    label: "Delta",
    title: "Delta",
    body: "Opening this route removes the oldest non-active tab.",
    icon: "settings",
  },
];

const labelRoutes: DemoRoute[] = [
  {
    name: "labels-enterprise",
    path: "/accounts/enterprise-east-region",
    label: "Enterprise account",
    title:
      "Enterprise account review for East Region and cross-team approval workflows",
    body: "Long titles should truncate cleanly without breaking the layout.",
    icon: "briefcase",
  },
  {
    name: "labels-claims",
    path: "/claims/pending-medical-exceptions",
    label: "Pending claims",
    title: "Pending medical exceptions queue with manual reviewer escalation",
    body: "This state highlights max-width handling and tooltips.",
    icon: "billing",
  },
  {
    name: "labels-audit",
    path: "/audit/monthly-compliance-summary",
    label: "Audit summary",
    title:
      "Monthly compliance summary with unresolved deviations and note history",
    body: "Useful to review clipping, hover title, and dropdown readability.",
    icon: "report",
  },
];

const resolverRoutes: DemoRoute[] = [
  {
    name: "order-detail",
    path: "/orders/1001",
    label: "Order 1001",
    title: "Order 1001 workspace",
    body: "The resolver maps params to richer record labels.",
    icon: "receipt",
  },
  {
    name: "order-detail-1002",
    path: "/orders/1002",
    label: "Order 1002",
    title: "Order 1002 workspace",
    body: "Each order opens its own tab because route params differ.",
    icon: "receipt",
  },
  {
    name: "order-detail-1003",
    path: "/orders/1003",
    label: "Order 1003",
    title: "Order 1003 workspace",
    body: "This sandbox isolates resolveTab logic for QA review.",
    icon: "receipt",
  },
];

const slotsRoutes: DemoRoute[] = [
  {
    name: "slots-workspace",
    path: "/workspace",
    label: "Workspace",
    title: "Workspace",
    body: "Custom slots let teams replace the neutral default icons.",
    icon: "briefcase",
  },
  {
    name: "slots-operations",
    path: "/operations",
    label: "Operations",
    title: "Operations",
    body: "Theme tokens stay scoped to this Vue instance only.",
    icon: "settings",
  },
  {
    name: "slots-approvals",
    path: "/approvals",
    label: "Approvals",
    title: "Approvals",
    body: "Good for design review without affecting the standard demo.",
    icon: "check",
  },
];

function renderIcon(icon: DemoRoute["icon"] | string) {
  const attrs = {
    width: 12,
    height: 12,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  } as const;

  switch (icon) {
    case "home":
      return h("svg", attrs, [
        h("path", { d: "M3 10.5 12 3l9 7.5" }),
        h("path", { d: "M5 9.5V21h14V9.5" }),
      ]);
    case "info":
      return h("svg", attrs, [
        h("circle", { cx: 12, cy: 12, r: 9 }),
        h("path", { d: "M12 10v6" }),
        h("path", { d: "M12 7h.01" }),
      ]);
    case "report":
      return h("svg", attrs, [
        h("path", { d: "M4 19h16" }),
        h("path", { d: "M7 16V9" }),
        h("path", { d: "M12 16V5" }),
        h("path", { d: "M17 16v-4" }),
      ]);
    case "settings":
      return h("svg", attrs, [
        h("circle", { cx: 12, cy: 12, r: 3 }),
        h("path", {
          d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.01a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9A1.65 1.65 0 0 0 20.91 10H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
        }),
      ]);
    case "calendar":
      return h("svg", attrs, [
        h("rect", { x: 3, y: 4, width: 18, height: 17, rx: 2 }),
        h("path", { d: "M8 2v4" }),
        h("path", { d: "M16 2v4" }),
        h("path", { d: "M3 10h18" }),
      ]);
    case "users":
      return h("svg", attrs, [
        h("path", { d: "M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" }),
        h("circle", { cx: 9, cy: 7, r: 4 }),
        h("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
        h("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" }),
      ]);
    case "billing":
      return h("svg", attrs, [
        h("rect", { x: 3, y: 5, width: 18, height: 14, rx: 2 }),
        h("path", { d: "M3 10h18" }),
        h("path", { d: "M7 15h4" }),
      ]);
    case "shield":
      return h("svg", attrs, [
        h("path", { d: "M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" }),
      ]);
    case "receipt":
      return h("svg", attrs, [
        h("path", { d: "M6 3h12v18l-2-1-2 1-2-1-2 1-2-1-2 1V3" }),
        h("path", { d: "M9 8h6" }),
        h("path", { d: "M9 12h6" }),
      ]);
    case "briefcase":
      return h("svg", attrs, [
        h("rect", { x: 3, y: 7, width: 18, height: 13, rx: 2 }),
        h("path", { d: "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }),
      ]);
    case "check":
      return h("svg", attrs, [h("path", { d: "M20 6 9 17l-5-5" })]);
    default:
      return h("span", { class: "demo-square-icon" }, String(icon).slice(0, 1));
  }
}

const scenarioConfigs: Record<
  ScenarioId,
  {
    storageKey: string;
    initialPath: string;
    routes: DemoRoute[];
    maxTabs?: number;
    theme?: typeof vueTheme;
    resolveTab?: MultiTabResolver;
    slots?: Record<string, () => ReturnType<typeof h>>;
    compact?: boolean;
  }
> = {
  default: {
    storageKey: "drm-multitabs-demo-vue-default",
    initialPath: "/",
    routes: defaultRoutes,
  },
  overflow: {
    storageKey: "drm-multitabs-demo-vue-overflow",
    initialPath: "/inbox",
    routes: overflowRoutes,
    compact: true,
  },
  limit: {
    storageKey: "drm-multitabs-demo-vue-limit",
    initialPath: "/alpha",
    routes: limitRoutes,
    maxTabs: 3,
    compact: true,
  },
  labels: {
    storageKey: "drm-multitabs-demo-vue-labels",
    initialPath: "/accounts/enterprise-east-region",
    routes: labelRoutes,
    compact: true,
  },
  resolver: {
    storageKey: "drm-multitabs-demo-vue-resolver",
    initialPath: "/orders/1001",
    routes: resolverRoutes,
    compact: true,
    resolveTab: (route) => ({
      title: `Order ${String(route.path.split("/").pop())} workspace`,
      icon: "receipt",
    }),
  },
  slots: {
    storageKey: "drm-multitabs-demo-vue-slots",
    initialPath: "/workspace",
    routes: slotsRoutes,
    theme: customTheme,
    compact: true,
    slots: {
      "launcher-icon": () => h("span", { class: "demo-square-icon" }, "AP"),
      "tab-icon": () => h("span", { class: "demo-square-icon" }, "T"),
      "close-icon": () => h("span", { class: "demo-square-icon" }, "X"),
      "dropdown-icon": () => h("span", { class: "demo-square-icon" }, "M"),
      "menu-icon-reload": () => h("span", { class: "demo-square-icon" }, "R"),
      "menu-icon-close": () => h("span", { class: "demo-square-icon" }, "C"),
      "menu-icon-close-all": () =>
        h("span", { class: "demo-square-icon" }, "CA"),
    },
  },
};

const scopedConfig = computed(() => {
  const baseConfig = scenarioConfigs[props.scenario];
  const runtimeScope =
    typeof window === "undefined"
      ? props.scenario
      : window.location.pathname.replace(/[^a-z0-9]+/gi, "-");

  return {
    ...baseConfig,
    storageKey: createTabsStorageKey(baseConfig.storageKey, runtimeScope),
  };
});

const compactScenarioNote = computed(() => {
  switch (props.scenario) {
    case "overflow":
      return "Open all routes to force tab overflow and review the dropdown menu.";
    case "limit":
      return "This sandbox is capped at three tabs. Opening Delta removes the oldest non-active tab.";
    case "labels":
      return "Use this state to review truncation, hover titles, and dropdown readability.";
    case "resolver":
      return "This sandbox isolates resolveTab behavior with route params mapped to richer workspace labels.";
    case "slots":
      return "This sandbox isolates custom slots and scoped theme tokens for visual review.";
    default:
      return "Navigate using the links below to open new tabs in this workspace.";
  }
});

const compactStatus = computed(() => {
  if (!scopedConfig.value.compact) {
    return [] as string[];
  }

  return [
    compactScenarioNote.value,
    `Routes: ${scopedConfig.value.routes.length}`,
    `Storage: ${scopedConfig.value.storageKey}`,
    `Active: ${scopedConfig.value.routes.find((route) => route.path === scopedConfig.value.initialPath)?.title ?? scopedConfig.value.routes.find((route) => route.path === scopedConfig.value.initialPath)?.label ?? scopedConfig.value.initialPath}`,
  ];
});

function buildRoutes() {
  const push = (path: string) => router.push(path);

  return scopedConfig.value.routes.map<RouteRecordRaw>((route) => ({
    name: route.name,
    path: route.path,
    component: defineComponent({
      name: `${route.name}-view`,
      render: () =>
        h(
          "div",
          {
            class: [
              "demo-page",
              scopedConfig.value.compact && "demo-page--compact",
            ],
          },
          [
            ...(scopedConfig.value.compact
              ? [
                  h(
                    "div",
                    { class: "demo-status" },
                    compactStatus.value.map((item) => h("span", item)),
                  ),
                ]
              : []),
            h(
              "nav",
              {
                class: [
                  "demo-nav",
                  scopedConfig.value.compact && "demo-nav--compact",
                ],
              },
              scopedConfig.value.routes.map((item) =>
                h(
                  "a",
                  {
                    href: "#",
                    onClick: (event: Event) => {
                      event.preventDefault();
                      push(item.path);
                    },
                  },
                  item.label,
                ),
              ),
            ),
            h(
              "div",
              {
                class: [
                  "demo-panel",
                  scopedConfig.value.compact && "demo-panel--compact",
                ],
              },
              [
                h("h3", route.title ?? route.label),
                h(
                  "p",
                  route.body ||
                    "Use the buttons above to open tabs inside this sandbox.",
                ),
              ],
            ),
          ],
        ),
    }),
    meta: { title: route.title ?? route.label },
  }));
}

const router = createRouter({
  history: createMemoryHistory(),
  routes: buildRoutes(),
});

const ready = ref(false);
const app = getCurrentInstance()?.appContext.app ?? null;

app?.use(router);

const Shell = defineComponent({
  name: "DemoVueShell",
  render: () => [
    h(
      MultiTabs,
      {
        theme: scopedConfig.value.theme ?? vueTheme,
        storageKey: scopedConfig.value.storageKey,
        ...(scopedConfig.value.maxTabs !== undefined
          ? { maxTabs: scopedConfig.value.maxTabs }
          : {}),
        ...(scopedConfig.value.resolveTab
          ? { resolveTab: scopedConfig.value.resolveTab }
          : {}),
      },
      {
        "tab-icon": ({ tab }: { tab: { icon: string } }) =>
          renderIcon(tab.icon),
        ...(scopedConfig.value.slots ?? {}),
      },
    ),
    h(RouterView),
  ],
});

onMounted(async () => {
  resetMultiTabsRuntime(scopedConfig.value.storageKey);
  localStorage.removeItem(scopedConfig.value.storageKey);
  await router.replace(scopedConfig.value.initialPath);
  await router.isReady();
  ready.value = true;
});

onUnmounted(() => {
  resetMultiTabsRuntime(scopedConfig.value.storageKey);
});
</script>

<template>
  <div
    class="demo-shell-outer"
    :class="{ 'demo-shell-outer--compact': scopedConfig.compact }"
  >
    <div v-if="ready" class="demo-shell-inner">
      <component :is="Shell" />
    </div>
  </div>
</template>

<style scoped>
.demo-shell-outer {
  width: 100%;
  min-height: 420px;
  background: #0a1628;
  border-radius: 12px;
}

.demo-shell-outer--compact {
  min-height: 340px;
}

.demo-shell-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

<style>
.demo-page {
  padding: 2rem;
  color: #e2e8f0;
  font-family: system-ui, sans-serif;
}

.demo-page--compact {
  padding: 1rem 1rem 1.3rem;
}

.demo-status {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.9rem;
  font-size: 0.76rem;
  color: #86efac;
}

.demo-status span {
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.demo-page h2 {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #f7f9ff;
}

.demo-page p {
  color: #94a3b8;
  line-height: 1.6;
}

.demo-nav {
  margin-top: 1.5rem;
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.demo-nav--compact {
  margin-top: 1rem;
  gap: 0.65rem;
}

.demo-nav a {
  display: inline-block;
  padding: 0.42rem 0.88rem;
  background: linear-gradient(180deg, #41b883 0%, #1f8f61 100%);
  color: #07150e;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.82rem;
  border-radius: 999px;
  text-decoration: none;
  transition: opacity 0.15s;
}

.demo-nav a:hover {
  opacity: 0.85;
}

.demo-panel {
  margin-top: 1.4rem;
  border-radius: 14px;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.58);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.demo-panel--compact {
  margin-top: 0.9rem;
}

.demo-panel h3 {
  margin: 0 0 0.55rem;
  font-size: 1.05rem;
  color: #f8fafc;
}

.demo-panel p {
  margin: 0;
  line-height: 1.6;
  color: #94a3b8;
}

.demo-square-icon {
  width: 1.15rem;
  height: 1.15rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.35rem;
  color: #d1fae5;
  background: rgba(65, 184, 131, 0.18);
  border: 1px solid rgba(110, 231, 183, 0.42);
  font-size: 0.6rem;
  font-weight: 700;
}
</style>
