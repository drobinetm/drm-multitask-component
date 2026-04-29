import { mount } from "@vue/test-utils";
import { computed, defineComponent, nextTick, ref } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MultiTabs from "./MultiTabs.vue";
import {
  createScopedStorageKey,
  resetMultiTabsRuntime,
  useMultiTabs,
} from "@/composables/useMultiTabs";

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

async function flushAsyncUi() {
  await new Promise((resolve) => window.setTimeout(resolve, 0));
  await nextTick();
}

describe("MultiTabs Vue", () => {
  beforeEach(() => {
    localStorage.clear();
    resetMultiTabsRuntime();
  });

  it("shares tab state across multiple useMultiTabs calls", async () => {
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

  it("tracks the active tab with a custom resolver id", async () => {
    const router = await createTestRouter();
    let api!: ReturnType<typeof useMultiTabs>;

    mount(
      defineComponent({
        setup() {
          api = useMultiTabs({
            storageKey: "resolver-custom-id-tabs-state",
            resolveTab(route) {
              if (route.name === "users") {
                return {
                  id: `customer:${String(route.params.id)}`,
                  title: `Customer ${String(route.params.id)}`,
                };
              }

              return undefined;
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

    await router.push({ name: "users", params: { id: "42" } });
    await nextTick();

    expect(api.currentTabId.value).toBe("customer:42");
    expect(api.currentTab.value).toMatchObject({
      id: "customer:42",
      title: "Customer 42",
    });
  });

  it("emits lifecycle events for open, activate, close, reload, move, and close-all", async () => {
    const router = await createTestRouter();
    const onOpen = vi.fn();
    const onActivate = vi.fn();
    const onClose = vi.fn();
    const onReload = vi.fn();
    const onMove = vi.fn();
    const onCloseAll = vi.fn();

    const wrapper = mount(MultiTabs, {
      props: {
        storageKey: "event-tabs-state",
        onOpen,
        onActivate,
        onClose,
        onReload,
        onMove,
        onCloseAll,
      },
      attachTo: document.body,
      global: {
        plugins: [router],
      },
    });

    await router.push({ name: "users", params: { id: "5" } });
    await router.push({ name: "settings" });
    await nextTick();

    expect(onOpen).toHaveBeenCalled();
    expect(onActivate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "settings" }),
    );

    const menuButtons = wrapper.findAll(".drm-multitabs__close");
    await menuButtons[1]!.trigger("click");
    await nextTick();
    expect(onClose).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'users::id:"5"' }),
    );

    await router.push({ name: "users", params: { id: "5" } });
    await nextTick();

    const tabGroups = wrapper.findAll(".drm-multitabs__tab-group");
    await tabGroups[0]!.trigger("dragstart", {
      dataTransfer: {
        setData: vi.fn(),
      },
    });
    await tabGroups[1]!.trigger("drop", {
      dataTransfer: {
        getData: () => "home",
      },
    });
    expect(onMove).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceId: "home",
        targetId: "settings",
      }),
    );

    await tabGroups[1]!.trigger("contextmenu", {
      clientX: 10,
      clientY: 10,
      preventDefault: vi.fn(),
    });
    await nextTick();
    const reloadButton = document.body.querySelector(
      ".drm-multitabs__context-menu .drm-multitabs__menu-item",
    ) as HTMLButtonElement | null;
    reloadButton?.click();
    await nextTick();
    expect(onReload).toHaveBeenCalledWith(
      expect.objectContaining({ id: "settings" }),
    );

    const dropdownButton = wrapper.find(".drm-multitabs__dropdown");
    await dropdownButton.trigger("click");
    await nextTick();
    const dropdownItems = Array.from(
      document.body.querySelectorAll(
        ".drm-multitabs__dropdown-menu .drm-multitabs__menu-item",
      ),
    );
    const closeAllButton = dropdownItems[dropdownItems.length - 1] as
      | HTMLButtonElement
      | undefined;
    closeAllButton?.click();
    await flushAsyncUi();

    expect(onCloseAll).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: "home" })]),
    );
  });

  it("blocks close actions when onBeforeClose returns false", async () => {
    const router = await createTestRouter();
    const onBeforeClose = vi.fn(() => false);

    const wrapper = mount(MultiTabs, {
      props: {
        storageKey: "guard-tabs-state",
        onBeforeClose,
      },
      attachTo: document.body,
      global: {
        plugins: [router],
      },
    });

    await router.push({ name: "users", params: { id: "99" } });
    await nextTick();

    const closeButtons = wrapper.findAll(".drm-multitabs__close");
    await closeButtons[1]!.trigger("click");
    await nextTick();

    expect(onBeforeClose).toHaveBeenCalled();
    expect(
      wrapper
        .findAll('[role="tab"]')
        .some((tab) => tab.text().includes("Users")),
    ).toBe(true);
  });

  it("supports controlled tabs and activeTabId through update events", async () => {
    const router = await createTestRouter();

    const ControlledHost = defineComponent({
      components: { MultiTabs },
      setup() {
        const controlledTabs = ref([
          {
            id: "home",
            title: "Home",
            icon: "circle",
            to: { name: "home" },
            isMenuItem: false,
            routeName: "home",
            caseNumber: null,
            caseTitle: null,
          },
          {
            id: 'users::id:"12"',
            title: "Users",
            icon: "circle",
            to: { name: "users", params: { id: "12" } },
            isMenuItem: false,
            routeName: "users",
            caseNumber: null,
            caseTitle: null,
          },
        ]);
        const activeTabId = ref('users::id:"12"');

        return {
          controlledTabs,
          activeTabId,
          activeTitle: computed(
            () =>
              controlledTabs.value.find((tab) => tab.id === activeTabId.value)
                ?.title ?? "none",
          ),
        };
      },
      template: `
        <div>
          <MultiTabs
            :tabs="controlledTabs"
            :active-tab-id="activeTabId"
            @update:tabs="controlledTabs = $event"
            @update:activeTabId="activeTabId = $event"
          />
          <div data-testid="active-title">{{ activeTitle }}</div>
        </div>
      `,
    });

    const wrapper = mount(ControlledHost, {
      attachTo: document.body,
      global: {
        plugins: [router],
      },
    });

    const firstTab = wrapper.findAll('[role="tab"]')[0];
    await firstTab!.trigger("click");
    await nextTick();

    expect(wrapper.get('[data-testid="active-title"]').text()).toBe("Home");

    const closeButtons = wrapper.findAll(".drm-multitabs__close");
    await closeButtons[1]!.trigger("click");
    await nextTick();

    expect(wrapper.findAll('[role="tab"]').length).toBe(1);
  });

  it("navigates when the host changes controlled activeTabId", async () => {
    const router = await createTestRouter();

    const ControlledHost = defineComponent({
      components: { MultiTabs },
      setup() {
        const controlledTabs = ref([
          {
            id: "home",
            title: "Home",
            icon: "circle",
            to: { name: "home" },
            isMenuItem: false,
            routeName: "home",
            caseNumber: null,
            caseTitle: null,
          },
          {
            id: 'users::id:"12"',
            title: "Users",
            icon: "circle",
            to: { name: "users", params: { id: "12" } },
            isMenuItem: false,
            routeName: "users",
            caseNumber: null,
            caseTitle: null,
          },
        ]);
        const activeTabId = ref<string | null>("home");

        return {
          controlledTabs,
          activeTabId,
        };
      },
      template: `
        <MultiTabs
          :tabs="controlledTabs"
          :active-tab-id="activeTabId"
          @update:tabs="controlledTabs = $event"
          @update:activeTabId="activeTabId = $event"
        />
      `,
    });

    const wrapper = mount(ControlledHost, {
      attachTo: document.body,
      global: {
        plugins: [router],
      },
    });

    await nextTick();
    expect(router.currentRoute.value.name).toBe("home");

    (wrapper.vm as { activeTabId: string | null }).activeTabId =
      'users::id:"12"';
    await flushAsyncUi();

    expect(router.currentRoute.value.name).toBe("users");
    expect(router.currentRoute.value.params.id).toBe("12");
  });

  it("reacts to runtime storageKey changes by switching store namespaces", async () => {
    const router = await createTestRouter();

    localStorage.setItem(
      "tenant-b-tabs",
      JSON.stringify([
        {
          id: "tenant-b-home",
          title: "Tenant B Home",
          icon: "circle",
          to: JSON.stringify({ name: "home" }),
          isMenuItem: false,
          routeName: "home",
          caseNumber: null,
          caseTitle: null,
        },
      ]),
    );

    const Host = defineComponent({
      components: { MultiTabs },
      setup() {
        const storageKey = ref("tenant-a-tabs");
        return { storageKey };
      },
      template: `<MultiTabs :storage-key="storageKey" />`,
    });

    const wrapper = mount(Host, {
      attachTo: document.body,
      global: {
        plugins: [router],
      },
    });

    await nextTick();
    expect(wrapper.findAll('[role="tab"]')[0]?.text()).toContain("Home");

    (wrapper.vm as { storageKey: string }).storageKey = "tenant-b-tabs";
    await flushAsyncUi();

    const labels = wrapper.findAll('[role="tab"]').map((tab) => tab.text());
    expect(labels.some((label) => label.includes("Tenant B Home"))).toBe(true);
  });

  it("creates stable scoped storage keys for session or preview isolation", () => {
    expect(
      createScopedStorageKey("crm-tabs", "user-42", "astro-preview", 3),
    ).toBe("crm-tabs:user-42:astro-preview:3");

    expect(createScopedStorageKey("crm-tabs", null, undefined, "")).toBe(
      "crm-tabs",
    );
  });

  it("applies reactive maxTabs updates without remounting the component", async () => {
    const router = await createTestRouter();

    const Host = defineComponent({
      components: { MultiTabs },
      setup() {
        const maxTabs = ref(4);
        return { maxTabs };
      },
      template: `<MultiTabs storage-key="reactive-max-tabs" :max-tabs="maxTabs" />`,
    });

    const wrapper = mount(Host, {
      attachTo: document.body,
      global: {
        plugins: [router],
      },
    });

    await router.push({ name: "users", params: { id: "1" } });
    await router.push({ name: "settings" });
    await nextTick();
    expect(wrapper.findAll('[role="tab"]').length).toBe(3);

    (wrapper.vm as { maxTabs: number }).maxTabs = 2;
    await router.push({ name: "users", params: { id: "2" } });
    await flushAsyncUi();

    expect(wrapper.findAll('[role="tab"]').length).toBe(2);
  });

  it("applies reactive defaultIcon updates without remounting the component", async () => {
    const router = await createTestRouter();

    const Host = defineComponent({
      components: { MultiTabs },
      setup() {
        const defaultIcon = ref("circle");
        return { defaultIcon };
      },
      template: `
        <MultiTabs
          storage-key="reactive-default-icon"
          :default-icon="defaultIcon"
        />
      `,
    });

    const wrapper = mount(Host, {
      attachTo: document.body,
      global: {
        plugins: [router],
      },
    });

    await router.push({ name: "users", params: { id: "1" } });
    await nextTick();

    const userTabBefore = wrapper.findAll('[role="tab"]')[1];
    expect(userTabBefore?.text()).toContain("circle");

    (wrapper.vm as { defaultIcon: string }).defaultIcon = "spark";
    await router.push({ name: "settings" });
    await flushAsyncUi();

    const settingsTab = wrapper.findAll('[role="tab"]')[2];
    expect(settingsTab?.text()).toContain("spark");
  });

  it("warns in dev when controlled activeTabId is missing from controlled tabs", async () => {
    const router = await createTestRouter();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    mount(MultiTabs, {
      props: {
        tabs: [
          {
            id: "home",
            title: "Home",
            icon: "circle",
            to: { name: "home" },
            isMenuItem: false,
            routeName: "home",
            caseNumber: null,
            caseTitle: null,
          },
        ],
        activeTabId: "missing-tab-id",
      },
      global: {
        plugins: [router],
      },
    });

    await nextTick();

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'Controlled activeTabId "missing-tab-id" does not exist',
      ),
    );

    warn.mockRestore();
  });

  it("waits for an async onBeforeClose guard before removing a tab", async () => {
    const router = await createTestRouter();
    const onBeforeClose = vi.fn(
      () =>
        new Promise<boolean>((resolve) =>
          window.setTimeout(() => resolve(true), 10),
        ),
    );

    const wrapper = mount(MultiTabs, {
      props: {
        storageKey: "async-guard-tabs-state",
        onBeforeClose,
      },
      attachTo: document.body,
      global: {
        plugins: [router],
      },
    });

    await router.push({ name: "users", params: { id: "77" } });
    await nextTick();

    const closeButtons = wrapper.findAll(".drm-multitabs__close");
    await closeButtons[1]!.trigger("click");

    expect(onBeforeClose).toHaveBeenCalled();
    expect(wrapper.findAll('[role="tab"]').length).toBe(2);

    await new Promise((resolve) => window.setTimeout(resolve, 20));
    await nextTick();

    expect(wrapper.findAll('[role="tab"]').length).toBe(1);
  });

  it("keeps blocked tabs during close-all and closes only allowed tabs", async () => {
    const router = await createTestRouter();

    const wrapper = mount(MultiTabs, {
      props: {
        storageKey: "close-all-guard-tabs-state",
        onBeforeClose: (tab) => tab.id !== 'users::id:"55"',
      },
      attachTo: document.body,
      global: {
        plugins: [router],
      },
    });

    await router.push({ name: "users", params: { id: "55" } });
    await router.push({ name: "settings" });
    await nextTick();

    const dropdownButton = wrapper.find(".drm-multitabs__dropdown");
    await dropdownButton.trigger("click");
    await nextTick();

    const dropdownItems = Array.from(
      document.body.querySelectorAll(
        ".drm-multitabs__dropdown-menu .drm-multitabs__menu-item",
      ),
    );
    const closeAllButton = dropdownItems[dropdownItems.length - 1] as
      | HTMLButtonElement
      | undefined;
    closeAllButton?.click();
    await flushAsyncUi();

    const labels = wrapper.findAll('[role="tab"]').map((tab) => tab.text());
    expect(labels.some((label) => label.includes("Users"))).toBe(true);
    expect(labels.some((label) => label.includes("Settings"))).toBe(true);
    expect(labels.some((label) => label.includes("Home"))).toBe(false);
  });

  it("moves focus to the fallback tab after closing the active tab from the keyboard", async () => {
    const router = await createTestRouter();

    const wrapper = mount(MultiTabs, {
      props: {
        storageKey: "focus-after-close-tabs-state",
      },
      attachTo: document.body,
      global: {
        plugins: [router],
      },
    });

    await router.push({ name: "users", params: { id: "19" } });
    await router.push({ name: "settings" });
    await nextTick();

    const tabs = wrapper.findAll('[role="tab"]');
    const activeTab = tabs[2];
    const fallbackTab = tabs[1];

    (activeTab!.element as HTMLButtonElement).focus();
    await activeTab!.trigger("keydown", { key: "Delete" });
    await flushAsyncUi();

    expect(document.activeElement).toBe(fallbackTab!.element);
  });
});
