<template>
  <div class="bc-widget-toggle" :class="position" @click="$emit('toggle')">
    <span class="toggle-label">{{ label }}</span>
  </div>
</template>

<script setup>
defineProps({
  position: { type: String, default: 'bottom_right' },
  label: { type: String, default: 'I would like...' },
})
defineEmits(['toggle'])
</script>

<style>
.bc-widget-toggle {
  position: fixed;
  bottom: 50px;
  display: flex;
  align-items: center;
  padding: 10px 20px;
  gap: 10px;
  border-radius: 4rem;
  cursor: pointer;
  background-color: var(--accent, #2563eb);
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
  font-family: system-ui, -apple-system, sans-serif;
  filter: drop-shadow(0px 5px 12.8px rgba(68, 104, 130, 0.25));
  user-select: none;
  z-index: 1000;
  transition: opacity 0.25s ease, visibility 0.25s ease;
  white-space: nowrap;
}

.bc-widget-toggle.bottom_right { right: 50px; }
.bc-widget-toggle.bottom_left { left: 50px; }
</style>
