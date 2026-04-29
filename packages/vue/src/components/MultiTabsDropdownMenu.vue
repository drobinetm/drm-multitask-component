<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="drm-multitabs__menu-card drm-multitabs__dropdown-menu drm-multitabs__dropdown-menu--fixed"
      ref="menuRef"
      role="menu"
      :style="menuStyle"
      @click.stop
      @keydown="$emit('keydown', $event)"
    >
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="drm-multitabs__menu-item"
        :class="{ 'drm-multitabs__menu-item--active': tab.id === currentTabId }"
        type="button"
        role="menuitem"
        @click="$emit('select', tab)"
      >
        {{
          tab.caseNumber ? `[${tab.caseNumber}] ${tab.caseTitle}` : tab.title
        }}
      </button>

      <hr class="drm-multitabs__menu-divider" />

      <button
        class="drm-multitabs__menu-item drm-multitabs__menu-item--danger"
        type="button"
        role="menuitem"
        @click="$emit('close-all')"
      >
        <slot name="menu-icon-close-all">✕</slot>
        Close All Tabs
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import type { MultiTabItem } from "@/types";

defineEmits<{
  keydown: [event: KeyboardEvent];
  select: [tab: MultiTabItem];
  "close-all": [];
}>();

const props = defineProps<{
  open: boolean;
  tabs: MultiTabItem[];
  currentTabId: string | null;
  position: { x: number; y: number };
}>();

const menuRef = ref<HTMLElement | null>(null);
const menuStyle = ref<Record<string, string>>({ left: "12px", top: "12px" });

function updateMenuStyle() {
  if (!menuRef.value) {
    return;
  }

  const menuWidth = menuRef.value.offsetWidth || 160;
  const menuHeight = menuRef.value.offsetHeight || 0;
  const gutter = 12;
  const spacing = 8;

  let left = Math.max(gutter, props.position.x - menuWidth);
  let top = props.position.y;

  if (left + menuWidth > window.innerWidth - gutter) {
    left = Math.max(gutter, window.innerWidth - gutter - menuWidth);
  }

  if (top + menuHeight > window.innerHeight - gutter) {
    top = Math.max(gutter, props.position.y - menuHeight - spacing);
  }

  menuStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
  };
}

watch(menuRef, (menu) => {
  if (menu) {
    (menu as HTMLElement).dataset.multitabsMenu = "dropdown";
  }
});

watch(
  () => [props.open, props.position.x, props.position.y, props.tabs.length],
  async ([open]) => {
    if (!open) {
      return;
    }

    await nextTick();
    updateMenuStyle();
  },
  { immediate: true },
);

onMounted(() => {
  window.addEventListener("resize", updateMenuStyle);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateMenuStyle);
});

defineExpose({ menuRef });
</script>
