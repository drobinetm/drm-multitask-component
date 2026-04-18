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
          @contextmenu.prevent="handleTabContextMenu(tab.id)"
        >
          <div class="drm-multitabs__tab-shell">
            <!-- Tab button -->
            <button
              class="drm-multitabs__tab"
              :class="{ 'drm-multitabs__tab--active': tab.id === currentTabId }"
              type="button"
              role="tab"
              :aria-selected="tab.id === currentTabId"
              :title="
                tab.caseNumber && tab.caseTitle
                  ? `[${tab.caseNumber}] - ${tab.caseTitle}`
                  : tab.title
              "
              @click="handleTabClick(tab)"
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

            <!-- Context menu -->
            <div
              v-if="activeTabMenuId === tab.id"
              class="drm-multitabs__menu-card drm-multitabs__context-menu"
              role="menu"
              @click.stop
            >
              <button
                class="drm-multitabs__menu-item"
                type="button"
                role="menuitem"
                @click="handleReloadTab(tab)"
              >
                <slot name="menu-icon-reload">↺</slot>
                Reload Tab
              </button>
              <button
                class="drm-multitabs__menu-item drm-multitabs__menu-item--danger"
                type="button"
                role="menuitem"
                @click="handleCloseTab(tab)"
              >
                <slot name="menu-icon-close">✕</slot>
                Close Tab
              </button>
            </div>

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
          class="drm-multitabs__dropdown"
          type="button"
          aria-label="All tabs"
          aria-haspopup="true"
          :aria-expanded="dropdownOpen"
          @click="dropdownOpen = !dropdownOpen"
        >
          <slot name="dropdown-icon">▾</slot>
        </button>

        <div
          v-if="dropdownOpen"
          class="drm-multitabs__menu-card drm-multitabs__dropdown-menu"
          role="menu"
          @click.stop
        >
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="drm-multitabs__menu-item"
            :class="{
              'drm-multitabs__menu-item--active': tab.id === currentTabId,
            }"
            type="button"
            role="menuitem"
            @click="handleDropdownTabClick(tab)"
          >
            {{
              tab.caseNumber
                ? `[${tab.caseNumber}] ${tab.caseTitle}`
                : tab.title
            }}
          </button>

          <hr class="drm-multitabs__menu-divider" />

          <button
            class="drm-multitabs__menu-item drm-multitabs__menu-item--danger"
            type="button"
            role="menuitem"
            @click="handleCloseAllTabs"
          >
            <slot name="menu-icon-close-all">✕</slot>
            Close All Tabs
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay to close menus when clicking outside -->
    <div
      v-if="activeTabMenuId !== null || dropdownOpen"
      class="drm-multitabs__overlay"
      @click="closeAllMenus"
    />
  </nav>
</template>

<script setup lang="ts">
import { shallowRef, computed } from "vue";
import { useMultiTabs } from "@/composables/useMultiTabs";
import type { MultiTabItem, MultiTabsTheme } from "@/types";
import "@/styles/multitabs.css";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

const props = defineProps<{
  /** Custom theme overrides via CSS custom properties */
  theme?: MultiTabsTheme;
}>();

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

const {
  tabs,
  currentTabId,
  openTab,
  closeTab,
  closeAllTabs,
  moveTab,
  reloadTab,
} = useMultiTabs();

// ---------------------------------------------------------------------------
// Local UI state
// ---------------------------------------------------------------------------

const activeTabMenuId = shallowRef<string | null>(null);
const draggingTabId = shallowRef<string | null>(null);
const dragOverTabId = shallowRef<string | null>(null);
const dropdownOpen = shallowRef(false);

// ---------------------------------------------------------------------------
// Theme CSS vars
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function closeAllMenus() {
  activeTabMenuId.value = null;
  dropdownOpen.value = false;
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

function handleTabClick(tab: MultiTabItem) {
  closeAllMenus();
  openTab(tab);
}

function handleCloseTab(tab: MultiTabItem) {
  if (activeTabMenuId.value === tab.id) activeTabMenuId.value = null;
  closeTab(tab);
}

function handleCloseAllTabs() {
  closeAllMenus();
  closeAllTabs();
}

function handleReloadTab(tab: MultiTabItem) {
  closeAllMenus();
  reloadTab(tab);
}

function handleTabContextMenu(tabId: string) {
  dropdownOpen.value = false;
  activeTabMenuId.value = activeTabMenuId.value === tabId ? null : tabId;
}

function handleDropdownTabClick(tab: MultiTabItem) {
  closeAllMenus();
  openTab(tab);
}

// Drag & drop
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
  }
  dragOverTabId.value = null;
}

function handleDragEnd() {
  draggingTabId.value = null;
  dragOverTabId.value = null;
}
</script>

<style scoped>
.drm-multitabs__dropdown-wrapper {
  position: relative;
  flex-shrink: 0;
}

.drm-multitabs__context-menu,
.drm-multitabs__dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 100;
  min-width: 160px;
}

.drm-multitabs__context-menu {
  left: 0;
  right: auto;
}

.drm-multitabs__menu-divider {
  border: none;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  margin: 4px 0;
}

.drm-multitabs__overlay {
  position: fixed;
  inset: 0;
  z-index: 99;
}

.drm-multitabs__menu-item--active {
  font-weight: 600;
}
</style>
