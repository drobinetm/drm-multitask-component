<template>
  <nav class="drm-multitabs" :style="themeVars">
    <div class="drm-multitabs__shell">
      <!-- Launcher icon (decorative / extensible via slot) -->
      <button
        class="drm-multitabs__launcher"
        type="button"
        aria-label="Navigation launcher"
      >
        <slot name="launcher-icon">
          <span class="drm-multitabs__icon">⊞</span>
        </slot>
      </button>

      <!-- Tab rail -->
      <TransitionGroup
        tag="div"
        name="drm-multitabs-tab"
        :css="tabTransitionsEnabled"
        class="drm-multitabs__rail"
        role="tablist"
        aria-label="Open tabs"
      >
        <div
          v-for="tab in tabs"
          :key="tab.id"
          class="drm-multitabs__tab-group"
          :class="{
            'drm-multitabs__tab-group--drag-over': dragOverTabId === tab.id,
          }"
          draggable="true"
          @dragstart="handleDragStart(tab, $event)"
          @dragover.prevent="handleDragOver(tab)"
          @drop.prevent="handleDrop(tab, $event)"
          @dragend="handleDragEnd"
          @contextmenu.prevent="handleTabContextMenu(tab.id, $event)"
        >
          <div class="drm-multitabs__tab-shell">
            <!-- Tab button -->
            <button
              class="drm-multitabs__tab"
              :class="{ 'drm-multitabs__tab--active': tab.id === currentTabId }"
              type="button"
              role="tab"
              :aria-selected="tab.id === currentTabId"
              :tabindex="tab.id === currentTabId ? 0 : -1"
              :title="
                tab.caseNumber && tab.caseTitle
                  ? `[${tab.caseNumber}] - ${tab.caseTitle}`
                  : tab.title
              "
              :ref="(element) => setTabButtonRef(tab.id, element)"
              @click="handleTabClick(tab)"
              @keydown="handleTabKeydown(tab, $event)"
            >
              <!-- Icon slot -->
              <slot name="tab-icon" :tab="tab">
                <span class="drm-multitabs__tab-icon" aria-hidden="true">
                  {{ tab.icon }}
                </span>
              </slot>

              <!-- Label -->
              <template v-if="tab.caseNumber && tab.caseTitle">
                <span class="drm-multitabs__tab-case-number"
                  >[{{ tab.caseNumber }}]</span
                >
                <span class="drm-multitabs__tab-case-title">{{
                  tab.caseTitle
                }}</span>
              </template>
              <span v-else class="drm-multitabs__tab-label">{{
                tab.title
              }}</span>
            </button>

            <!-- Context menu rendered via Teleport to avoid overflow:hidden clipping -->

            <!-- Close button -->
            <button
              class="drm-multitabs__close"
              type="button"
              :aria-label="`Close ${tab.title}`"
              @click.stop="handleCloseTab(tab)"
            >
              <slot name="close-icon">✕</slot>
            </button>
          </div>
        </div>
      </TransitionGroup>

      <!-- Dropdown: all tabs list -->
      <div class="drm-multitabs__dropdown-wrapper">
        <button
          ref="dropdownButton"
          class="drm-multitabs__dropdown"
          type="button"
          aria-label="All tabs"
          aria-haspopup="menu"
          :aria-expanded="dropdownOpen"
          @click="handleDropdownToggle"
          @keydown="handleDropdownButtonKeydown"
        >
          <slot name="dropdown-icon">▾</slot>
        </button>
      </div>
    </div>

    <!-- Overlay to close menus when clicking outside -->
    <div
      v-if="activeTabMenuId !== null || dropdownOpen"
      class="drm-multitabs__overlay"
      @click="closeAllMenus"
    />

    <MultiTabsContextMenu
      ref="contextMenu"
      :tab="activeContextTab"
      :position="menuPosition"
      @keydown="handleContextMenuKeydown"
      @reload="handleReloadTab"
      @close="handleCloseTab"
    >
      <template #menu-icon-reload>
        <slot name="menu-icon-reload">↺</slot>
      </template>
      <template #menu-icon-close>
        <slot name="menu-icon-close">✕</slot>
      </template>
    </MultiTabsContextMenu>

    <MultiTabsDropdownMenu
      ref="dropdownMenu"
      :open="dropdownOpen"
      :tabs="tabs"
      :current-tab-id="currentTabId"
      :position="dropdownPosition"
      @keydown="handleDropdownMenuKeydown"
      @select="handleDropdownTabClick"
      @close-all="handleCloseAllTabs"
    >
      <template #menu-icon-close-all>
        <slot name="menu-icon-close-all">✕</slot>
      </template>
    </MultiTabsDropdownMenu>
  </nav>
</template>

<script setup lang="ts">
import { computed, nextTick, shallowRef, watch } from "vue";
import type { ComponentPublicInstance } from "vue";
import MultiTabsContextMenu from "./MultiTabsContextMenu.vue";
import MultiTabsDropdownMenu from "./MultiTabsDropdownMenu.vue";
import { useMultiTabs } from "@/composables/useMultiTabs";
import type {
  MultiTabCloseGuard,
  MultiTabMoveEvent,
  MultiTabItem,
  MultiTabsTheme,
  MultiTabResolver,
  UseMultiTabsOptions,
} from "@/types";
import "@/styles/multitabs.css";

const props = defineProps<{
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
}>();

const emit = defineEmits<{
  open: [tab: MultiTabItem];
  close: [tab: MultiTabItem];
  activate: [tab: MultiTabItem];
  move: [event: MultiTabMoveEvent];
  reload: [tab: MultiTabItem];
  "close-all": [tabs: MultiTabItem[]];
  "update:tabs": [tabs: MultiTabItem[]];
  "update:activeTabId": [tabId: string | null];
}>();

const multiTabsOptions: UseMultiTabsOptions = {
  storageKey: computed(() => props.storageKey),
  defaultIcon: computed(() => props.defaultIcon),
  maxTabs: computed(() => props.maxTabs),
  resolveTab: (route, context) => props.resolveTab?.(route, context),
  tabs: computed(() => props.tabs),
  activeTabId: computed(() => props.activeTabId),
  onBeforeClose: (tab, context) => props.onBeforeClose?.(tab, context) ?? true,
};

multiTabsOptions.onTabsChange = (nextTabs) => {
  emit("update:tabs", nextTabs);
};

multiTabsOptions.onActiveTabIdChange = (tabId) => {
  emit("update:activeTabId", tabId);
};

multiTabsOptions.onTabOpen = (tab) => {
  emit("open", tab);
};

multiTabsOptions.onTabClose = (tab) => {
  emit("close", tab);
};

multiTabsOptions.onTabChange = (tab) => {
  emit("activate", tab);
};

const {
  tabs,
  currentTabId,
  openTab,
  closeTab,
  closeAllTabs,
  moveTab,
  reloadTab,
} = useMultiTabs(multiTabsOptions);

const activeTabMenuId = shallowRef<string | null>(null);
const menuPosition = shallowRef<{ x: number; y: number }>({ x: 0, y: 0 });
const dropdownPosition = shallowRef<{ x: number; y: number }>({ x: 0, y: 0 });
const draggingTabId = shallowRef<string | null>(null);
const dragOverTabId = shallowRef<string | null>(null);
const dropdownOpen = shallowRef(false);
const dropdownButton = shallowRef<HTMLElement | null>(null);
const contextMenu = shallowRef<InstanceType<
  typeof MultiTabsContextMenu
> | null>(null);
const dropdownMenu = shallowRef<InstanceType<
  typeof MultiTabsDropdownMenu
> | null>(null);
const tabButtonRefs = new Map<string, HTMLButtonElement>();
const tabTransitionsEnabled = shallowRef(true);

const contextMenuRef = computed(() => contextMenu.value?.menuRef ?? null);
const dropdownMenuRef = computed(() => dropdownMenu.value?.menuRef ?? null);
const activeContextTab = computed(
  () => tabs.value.find((tab) => tab.id === activeTabMenuId.value) ?? null,
);

watch(
  tabs,
  (nextTabs, previousTabs) => {
    const maxTabs = props.maxTabs ?? Number.POSITIVE_INFINITY;

    if (
      !Number.isFinite(maxTabs) ||
      previousTabs.length !== maxTabs ||
      nextTabs.length !== maxTabs
    ) {
      return;
    }

    const addedTab = nextTabs.some(
      (tab) => !previousTabs.some((previousTab) => previousTab.id === tab.id),
    );
    const removedTab = previousTabs.some(
      (tab) => !nextTabs.some((nextTab) => nextTab.id === tab.id),
    );

    if (!addedTab || !removedTab) {
      return;
    }

    tabTransitionsEnabled.value = false;
    void nextTick(() => {
      tabTransitionsEnabled.value = true;
    });
  },
  { flush: "sync" },
);

const themeVars = computed<Record<string, string>>(() => {
  if (!props.theme) return {};
  const map: Record<string, string> = {
    height: "--drm-tabs-height",
    shellBg: "--drm-tabs-shell-bg",
    tabBg: "--drm-tabs-tab-bg",
    tabColor: "--drm-tabs-tab-color",
    activeTabBg: "--drm-tabs-active-bg",
    activeTabColor: "--drm-tabs-active-color",
    activeTabBorderColor: "--drm-tabs-active-border-color",
    borderRadius: "--drm-tabs-border-radius",
    fontSize: "--drm-tabs-font-size",
    tabMaxWidth: "--drm-tabs-tab-max-width",
    tabMinWidth: "--drm-tabs-tab-min-width",
    closeHoverColor: "--drm-tabs-close-hover-color",
    dragOverColor: "--drm-tabs-drag-over-border",
  };
  const result: Record<string, string> = {};
  for (const [key, cssVar] of Object.entries(map)) {
    const val = props.theme[key as keyof MultiTabsTheme];
    if (val !== undefined) result[cssVar] = val;
  }
  return result;
});

function closeAllMenus() {
  activeTabMenuId.value = null;
  dropdownOpen.value = false;
}

function setTabButtonRef(
  tabId: string,
  element: Element | ComponentPublicInstance | null,
) {
  if (!(element instanceof HTMLButtonElement)) {
    tabButtonRefs.delete(tabId);
    return;
  }

  tabButtonRefs.set(tabId, element);
}

function focusTabButton(tabId: string | null | undefined) {
  if (!tabId) return;
  tabButtonRefs.get(tabId)?.focus();
}

function getOrderedTabIds() {
  return tabs.value.map((tab) => tab.id);
}

function focusRelativeTab(currentId: string, offset: number) {
  const ids = getOrderedTabIds();
  const currentIndex = ids.findIndex((id) => id === currentId);
  if (currentIndex === -1 || ids.length === 0) return;

  const nextIndex = (currentIndex + offset + ids.length) % ids.length;
  focusTabButton(ids[nextIndex]);
}

function focusMenuItem(menu: HTMLElement | null, index: number) {
  if (!menu) return;
  const items = Array.from(
    menu.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'),
  );
  if (items.length === 0) return;

  const safeIndex = Math.min(Math.max(index, 0), items.length - 1);
  items[safeIndex]?.focus();
}

function moveMenuFocus(menu: HTMLElement | null, direction: 1 | -1) {
  if (!menu) return;

  const items = Array.from(
    menu.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'),
  );
  if (items.length === 0) return;

  const currentIndex = items.findIndex(
    (item) => item === document.activeElement,
  );
  const nextIndex =
    currentIndex === -1
      ? 0
      : (currentIndex + direction + items.length) % items.length;
  items[nextIndex]?.focus();
}

function openContextMenuAt(
  tabId: string,
  x: number,
  y: number,
  focusFirstItem = false,
) {
  dropdownOpen.value = false;
  menuPosition.value = { x, y };
  activeTabMenuId.value = tabId;

  if (focusFirstItem) {
    void nextTick(() => {
      focusMenuItem(contextMenuRef.value, 0);
    });
  }
}

function openContextMenuForTab(
  tabId: string,
  trigger: HTMLElement,
  focusFirstItem = false,
) {
  const rect = trigger.getBoundingClientRect();
  openContextMenuAt(tabId, rect.left, rect.bottom + 4, focusFirstItem);
}

function openDropdownMenu(focusFirstItem = false) {
  activeTabMenuId.value = null;

  const rect = dropdownButton.value?.getBoundingClientRect();
  if (rect) {
    dropdownPosition.value = { x: rect.right, y: rect.bottom + 4 };
  }

  dropdownOpen.value = true;

  if (focusFirstItem) {
    void nextTick(() => {
      focusMenuItem(dropdownMenuRef.value, 0);
    });
  }
}

function handleTabClick(tab: MultiTabItem) {
  closeAllMenus();
  openTab(tab);
}

async function handleCloseTab(tab: MultiTabItem) {
  if (activeTabMenuId.value === tab.id) activeTabMenuId.value = null;
  const currentIndex = tabs.value.findIndex((item) => item.id === tab.id);
  const fallbackTabId =
    tabs.value[currentIndex + 1]?.id ??
    tabs.value[currentIndex - 1]?.id ??
    currentTabId.value;

  const closed = await closeTab(tab);
  if (!closed) {
    return;
  }

  void nextTick(() => {
    focusTabButton(fallbackTabId ?? currentTabId.value);
  });
}

async function handleCloseAllTabs() {
  const tabsBeforeClose = [...tabs.value];
  closeAllMenus();
  const closedTabs = await closeAllTabs();
  if (closedTabs.length > 0) {
    emit("close-all", tabsBeforeClose);
  }
}

function handleReloadTab(tab: MultiTabItem) {
  closeAllMenus();
  reloadTab(tab);
  emit("reload", tab);
  void nextTick(() => {
    focusTabButton(tab.id);
  });
}

function handleTabContextMenu(tabId: string, event: MouseEvent) {
  event.preventDefault();
  if (activeTabMenuId.value === tabId) {
    activeTabMenuId.value = null;
    return;
  }

  openContextMenuAt(tabId, event.clientX, event.clientY);
}

function handleDropdownToggle() {
  if (dropdownOpen.value) {
    dropdownOpen.value = false;
    dropdownButton.value?.focus();
    return;
  }

  openDropdownMenu();
}

function handleDropdownTabClick(tab: MultiTabItem) {
  closeAllMenus();
  openTab(tab);
}

function handleDragStart(tab: MultiTabItem, event: DragEvent) {
  draggingTabId.value = tab.id;
  event.dataTransfer?.setData("text/plain", tab.id);
}

function handleDragOver(tab: MultiTabItem) {
  if (draggingTabId.value && draggingTabId.value !== tab.id) {
    dragOverTabId.value = tab.id;
  }
}

function handleDrop(tab: MultiTabItem, event: DragEvent) {
  const sourceId = event.dataTransfer?.getData("text/plain");
  if (sourceId && sourceId !== tab.id) {
    moveTab(sourceId, tab.id);
    emit("move", {
      sourceId,
      targetId: tab.id,
      tabs: [...tabs.value],
    });
  }
  dragOverTabId.value = null;
}

function handleDragEnd() {
  draggingTabId.value = null;
  dragOverTabId.value = null;
}

function handleTabKeydown(tab: MultiTabItem, event: KeyboardEvent) {
  switch (event.key) {
    case "ArrowRight":
      event.preventDefault();
      focusRelativeTab(tab.id, 1);
      break;
    case "ArrowLeft":
      event.preventDefault();
      focusRelativeTab(tab.id, -1);
      break;
    case "Home":
      event.preventDefault();
      focusTabButton(getOrderedTabIds()[0]);
      break;
    case "End":
      event.preventDefault();
      focusTabButton(getOrderedTabIds()[getOrderedTabIds().length - 1]);
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      handleTabClick(tab);
      break;
    case "Delete":
    case "Backspace":
      event.preventDefault();
      handleCloseTab(tab);
      break;
    case "ContextMenu":
      event.preventDefault();
      openContextMenuForTab(tab.id, event.currentTarget as HTMLElement, true);
      break;
    case "F10":
      if (event.shiftKey) {
        event.preventDefault();
        openContextMenuForTab(tab.id, event.currentTarget as HTMLElement, true);
      }
      break;
    case "Escape":
      event.preventDefault();
      closeAllMenus();
      focusTabButton(tab.id);
      break;
  }
}

function handleDropdownButtonKeydown(event: KeyboardEvent) {
  if (["Enter", " ", "ArrowDown"].includes(event.key)) {
    event.preventDefault();
    openDropdownMenu(true);
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeAllMenus();
    dropdownButton.value?.focus();
  }
}

function handleMenuKeydown(
  event: KeyboardEvent,
  menu: HTMLElement | null,
  restoreFocus: () => void,
) {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      moveMenuFocus(menu, 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      moveMenuFocus(menu, -1);
      break;
    case "Home":
      event.preventDefault();
      focusMenuItem(menu, 0);
      break;
    case "End":
      event.preventDefault();
      focusMenuItem(menu, Number.MAX_SAFE_INTEGER);
      break;
    case "Escape":
      event.preventDefault();
      closeAllMenus();
      restoreFocus();
      break;
  }
}

function handleContextMenuKeydown(event: KeyboardEvent) {
  const activeId = activeTabMenuId.value;
  handleMenuKeydown(event, contextMenuRef.value, () => {
    focusTabButton(activeId ?? currentTabId.value);
  });
}

function handleDropdownMenuKeydown(event: KeyboardEvent) {
  handleMenuKeydown(event, dropdownMenuRef.value, () => {
    dropdownButton.value?.focus();
  });
}
</script>

<style scoped>
.drm-multitabs__dropdown-wrapper {
  position: relative;
  flex-shrink: 0;
}

.drm-multitabs__overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
}
</style>
