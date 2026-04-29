<template>
  <Teleport to="body">
    <div
      v-if="tab"
      class="drm-multitabs__menu-card drm-multitabs__context-menu drm-multitabs__context-menu--fixed"
      ref="menuRef"
      role="menu"
      :style="{ left: position.x + 'px', top: position.y + 'px' }"
      @click.stop
      @keydown="$emit('keydown', $event)"
    >
      <button
        class="drm-multitabs__menu-item"
        type="button"
        role="menuitem"
        @click="$emit('reload', tab)"
      >
        <slot name="menu-icon-reload">↺</slot>
        Reload Tab
      </button>
      <button
        class="drm-multitabs__menu-item drm-multitabs__menu-item--danger"
        type="button"
        role="menuitem"
        @click="$emit('close', tab)"
      >
        <slot name="menu-icon-close">✕</slot>
        Close Tab
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { MultiTabItem } from "@/types";

defineEmits<{
  keydown: [event: KeyboardEvent];
  reload: [tab: MultiTabItem];
  close: [tab: MultiTabItem];
}>();

defineProps<{
  tab: MultiTabItem | null;
  position: { x: number; y: number };
}>();

const menuRef = ref<HTMLElement | null>(null);

watch(menuRef, (menu) => {
  if (menu) {
    // Exposed through the component instance for parent focus management.
    (menu as HTMLElement).dataset.multitabsMenu = "context";
  }
});

defineExpose({ menuRef });
</script>
