import { mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { describe, expect, it } from "vitest";
import MultiTabs from "./MultiTabs.vue";
import { useMultiTabs } from "@/composables/useMultiTabs";

const routes = [
  {
    name: "home",
    path: "/",
    component: defineComponent({ template: "<div>Home</div>" }),
    meta: { title: "Home" },
  },
  {
    name: "users",
    path: "/users/:id",
    component: defineComponent({ template: "<div>Users</div>" }),
    meta: { title: "Users" },
  },
  {
    name: "settings",
    path: "/settings",
    component: defineComponent({ template: "<div>Settings</div>" }),
    meta: { title: "Settings" },
  },
];

async function createTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  });

  await router.push("/");
  await router.isReady();
  return router;
}

describe("MultiTabs Vue", () => {
  it("shares tab state across multiple useMultiTabs calls", async () => {
    localStorage.clear();
    const router = await createTestRouter();
    let firstApi!: ReturnType<typeof useMultiTabs>;
    let secondApi!: ReturnType<typeof useMultiTabs>;

    mount(
      defineComponent({
        setup() {
          firstApi = useMultiTabs({ storageKey: "shared-tabs-state" });
          secondApi = useMultiTabs({ storageKey: "shared-tabs-state" });
          return () => null;
        },
      }),
      {
        global: {
          plugins: [router],
        },
      },
    );

    await router.push({ name: "users", params: { id: "42" } });
    await nextTick();

    expect(firstApi.tabs.value).toBe(secondApi.tabs.value);
    expect((firstApi.tabs.value ?? []).map((tab) => tab.id)).toEqual([
      "home",
      'users::id:"42"',
    ]);
  });

  it("applies the custom route resolver when building tabs", async () => {
    localStorage.clear();
    const router = await createTestRouter();
    let api!: ReturnType<typeof useMultiTabs>;

    mount(
      defineComponent({
        setup() {
          api = useMultiTabs({
            storageKey: "resolver-tabs-state",
            resolveTab(route, context) {
              return {
                title: `User ${String(route.params.id ?? "unknown")}`,
                icon: "person",
                isMenuItem: true,
                caseTitle: context.defaultTab.title,
              };
            },
          });

          return () => null;
        },
      }),
      {
        global: {
          plugins: [router],
        },
      },
    );

    await router.push({ name: "users", params: { id: "7" } });
    await nextTick();

    const activeTabs = api.tabs.value ?? [];
    const activeTab = activeTabs[activeTabs.length - 1];
    expect(activeTab).toMatchObject({
      title: "User 7",
      icon: "person",
      isMenuItem: true,
      caseTitle: "Users",
    });
  });

  it("supports arrow key navigation between tabs", async () => {
    localStorage.clear();
    const router = await createTestRouter();

    const wrapper = mount(MultiTabs, {
      props: {
        storageKey: "keyboard-tabs-state-a11y",
      },
      attachTo: document.body,
      global: {
        plugins: [router],
      },
    });

    await router.push({ name: "users", params: { id: "1" } });
    await router.push({ name: "settings" });
    await nextTick();

    const tabs = wrapper.findAll('[role="tab"]');
    const firstTab = tabs[0];
    const secondTab = tabs[1];

    expect(firstTab).toBeDefined();
    expect(secondTab).toBeDefined();

    (firstTab!.element as HTMLButtonElement).focus();
    await firstTab!.trigger("keydown", { key: "ArrowRight" });

    expect(document.activeElement).toBe(secondTab!.element);
  });

  it("closes the active tab and navigates to the adjacent fallback tab", async () => {
    localStorage.clear();
    const router = await createTestRouter();
    let api!: ReturnType<typeof useMultiTabs>;

    mount(
      defineComponent({
        setup() {
          api = useMultiTabs({ storageKey: "close-active-tabs-state" });
          return () => null;
        },
      }),
      {
        global: {
          plugins: [router],
        },
      },
    );

    await router.push({ name: "users", params: { id: "8" } });
    await router.push({ name: "settings" });
    await nextTick();

    const activeTab = api.currentTab.value;
    expect(activeTab?.id).toBe("settings");

    const navigationCompleted = new Promise<void>((resolve) => {
      const removeGuard = router.afterEach(() => {
        removeGuard();
        resolve();
      });
    });

    api.closeTab(activeTab!);
    await navigationCompleted;
    await nextTick();

    expect(router.currentRoute.value.name).toBe("users");
    expect((api.tabs.value ?? []).map((tab) => tab.id)).toEqual([
      "home",
      'users::id:"8"',
    ]);
  });

  it("ignores invalid persisted state and rebuilds tabs from the current route", async () => {
    localStorage.clear();
    localStorage.setItem("invalid-persisted-tabs-state", "{not-valid-json");
    const router = await createTestRouter();
    let api!: ReturnType<typeof useMultiTabs>;

    mount(
      defineComponent({
        setup() {
          api = useMultiTabs({ storageKey: "invalid-persisted-tabs-state" });
          return () => null;
        },
      }),
      {
        global: {
          plugins: [router],
        },
      },
    );

    await nextTick();

    expect((api.tabs.value ?? []).map((tab) => tab.id)).toEqual(["home"]);
    expect(localStorage.getItem("invalid-persisted-tabs-state")).toContain(
      '"id":"home"',
    );
  });
});
