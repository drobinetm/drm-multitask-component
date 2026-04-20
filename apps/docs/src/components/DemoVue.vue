<script setup lang="ts">
import {
  createApp,
  defineComponent,
  h,
  ref,
  onMounted,
  onUnmounted,
} from "vue";
import { createRouter, createMemoryHistory, RouterView } from "vue-router";
import { MultiTabs } from "@drm/multitabs-vue";
import "@drm/multitabs-vue/styles";

// ─── Page components ──────────────────────────────────────────────────────────

const push = (path: string) => router.push(path);

const HomeView = defineComponent({
  name: "HomeView",
  render: () =>
    h("div", { class: "demo-page" }, [
      h("h2", "Welcome"),
      h("p", "Navigate using the links below to open new tabs."),
      h("nav", { class: "demo-nav" }, [
        h(
          "a",
          {
            href: "#",
            onClick: (e: Event) => {
              e.preventDefault();
              push("/about");
            },
          },
          "About",
        ),
        h(
          "a",
          {
            href: "#",
            onClick: (e: Event) => {
              e.preventDefault();
              push("/reports");
            },
          },
          "Reports",
        ),
        h(
          "a",
          {
            href: "#",
            onClick: (e: Event) => {
              e.preventDefault();
              push("/settings");
            },
          },
          "Settings",
        ),
      ]),
    ]),
});

const AboutView = defineComponent({
  name: "AboutView",
  render: () =>
    h("div", { class: "demo-page" }, [
      h("h2", "About"),
      h("p", "Each route visit opens a new persistent tab in the workspace."),
      h(
        "p",
        { style: "margin-top:0.5rem;opacity:0.6;font-size:0.85rem" },
        "Right-click a tab for context menu options.",
      ),
    ]),
});

const ReportsView = defineComponent({
  name: "ReportsView",
  render: () =>
    h("div", { class: "demo-page" }, [
      h("h2", "Reports"),
      h("p", "This tab stays open while you navigate to other sections."),
    ]),
});

const SettingsView = defineComponent({
  name: "SettingsView",
  render: () =>
    h("div", { class: "demo-page" }, [
      h("h2", "Settings"),
      h("p", "Tabs can be reordered by dragging."),
    ]),
});

// ─── Router with memory history ───────────────────────────────────────────────

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { name: "home", path: "/", component: HomeView, meta: { title: "Home" } },
    {
      name: "about",
      path: "/about",
      component: AboutView,
      meta: { title: "About" },
    },
    {
      name: "reports",
      path: "/reports",
      component: ReportsView,
      meta: { title: "Reports" },
    },
    {
      name: "settings",
      path: "/settings",
      component: SettingsView,
      meta: { title: "Settings" },
    },
  ],
});

// ─── Shell ────────────────────────────────────────────────────────────────────

const Shell = defineComponent({
  name: "DemoShell",
  render: () => [
    h(MultiTabs, null, {
      "tab-icon": () =>
        h(
          "svg",
          {
            width: 8,
            height: 8,
            viewBox: "0 0 8 8",
            fill: "currentColor",
            style: "opacity:0.5;flex-shrink:0",
          },
          [h("circle", { cx: 4, cy: 4, r: 3 })],
        ),
      "launcher-icon": () =>
        h(
          "svg",
          {
            width: 16,
            height: 16,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
          [
            h("rect", { x: 3, y: 3, width: 7, height: 7 }),
            h("rect", { x: 14, y: 3, width: 7, height: 7 }),
            h("rect", { x: 3, y: 14, width: 7, height: 7 }),
            h("rect", { x: 14, y: 14, width: 7, height: 7 }),
          ],
        ),
      "close-icon": () =>
        h(
          "svg",
          {
            width: 10,
            height: 10,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2.5",
            "stroke-linecap": "round",
          },
          [
            h("line", { x1: 18, y1: 6, x2: 6, y2: 18 }),
            h("line", { x1: 6, y1: 6, x2: 18, y2: 18 }),
          ],
        ),
      "dropdown-icon": () =>
        h(
          "svg",
          {
            width: 10,
            height: 10,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2.5",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
          [h("polyline", { points: "6 9 12 15 18 9" })],
        ),
      "menu-icon-reload": () =>
        h(
          "svg",
          {
            width: 12,
            height: 12,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
          },
          [
            h("polyline", { points: "23 4 23 10 17 10" }),
            h("path", { d: "M20.49 15a9 9 0 1 1-2.12-9.36L23 10" }),
          ],
        ),
      "menu-icon-close": () =>
        h(
          "svg",
          {
            width: 10,
            height: 10,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2.5",
            "stroke-linecap": "round",
          },
          [
            h("line", { x1: 18, y1: 6, x2: 6, y2: 18 }),
            h("line", { x1: 6, y1: 6, x2: 18, y2: 18 }),
          ],
        ),
      "menu-icon-close-all": () =>
        h(
          "svg",
          {
            width: 10,
            height: 10,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": "2.5",
            "stroke-linecap": "round",
          },
          [
            h("line", { x1: 18, y1: 6, x2: 6, y2: 18 }),
            h("line", { x1: 6, y1: 6, x2: 18, y2: 18 }),
          ],
        ),
    }),
    h(RouterView),
  ],
});

// ─── Mount ────────────────────────────────────────────────────────────────────

const mountTarget = ref<HTMLElement | null>(null);
let app: ReturnType<typeof createApp> | null = null;

onMounted(async () => {
  if (!mountTarget.value) return;
  app = createApp(Shell);
  app.use(router);
  await router.push("/");
  await router.isReady();
  app.mount(mountTarget.value);
});

onUnmounted(() => {
  app?.unmount();
  app = null;
});
</script>

<template>
  <div class="demo-shell-outer">
    <div ref="mountTarget" class="demo-shell-inner" />
  </div>
</template>

<style scoped>
.demo-shell-outer {
  width: 100%;
  min-height: 420px;
  background: #0a1628;
  border-radius: 12px;
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

.demo-nav a {
  display: inline-block;
  padding: 0.45rem 1rem;
  background: linear-gradient(180deg, #5a95c1 0%, #326776 100%);
  color: #0a1628;
  font-weight: 700;
  font-size: 0.85rem;
  border-radius: 14px;
  text-decoration: none;
  transition: opacity 0.15s;
}

.demo-nav a:hover {
  opacity: 0.85;
}
</style>
