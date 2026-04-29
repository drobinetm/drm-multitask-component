<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="drm-multitabs__menu-card drm-multitabs__dropdown-menu drm-multitabs__dropdown-menu--fixed"
      ref="menuRef"
      role="menu"
      :style="{
        left: Math.max(12, position.x - 160) + 'px',
        top: position.y + 'px',
      }"
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
import { ref, watch } from "vue";
import type { MultiTabItem } from "@/types";

defineEmits<{
  keydown: [event: KeyboardEvent];
  select: [tab: MultiTabItem];
  "close-all": [];
}>();

defineProps<{
  open: boolean;
  tabs: MultiTabItem[];
  currentTabId: string | null;
  position: { x: number; y: number };
}>();

const menuRef = ref<HTMLElement | null>(null);

watch(menuRef, (menu) => {
  if (menu) {
    (menu as HTMLElement).dataset.multitabsMenu = "dropdown";
  }
});

defineExpose({ menuRef });
</script>
