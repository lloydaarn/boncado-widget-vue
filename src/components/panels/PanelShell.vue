<template>
  <div class="bc-widget-component" :class="[position, { maximized: isMaximized }]">
    <div class="bc-widget-screen">

      <!-- Sticky top bar -->
      <div class="panel-top-bar">
        <button v-if="showBack" class="btn-icon btn-back" @click="$emit('back')" title="Back">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/>
          </svg>
        </button>
        <div class="top-bar-spacer"></div>
        <button class="btn-icon btn-maximize" @click="$emit('toggle-maximize')" :title="isMaximized ? 'Minimize' : 'Maximize'">
          <svg v-if="!isMaximized" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M15 3.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V5.56l-3.97 3.97a.75.75 0 1 1-1.06-1.06l3.97-3.97h-2.69a.75.75 0 0 1-.75-.75Zm-12 0A.75.75 0 0 1 3.75 3h4.5a.75.75 0 0 1 0 1.5H5.56l3.97 3.97a.75.75 0 0 1-1.06 1.06L4.5 5.56v2.69a.75.75 0 0 1-1.5 0v-4.5Zm11.47 11.47a.75.75 0 1 1 1.06 1.06l-3.97 3.97h2.69a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v2.69l3.97-3.97Zm-4.94 0a.75.75 0 0 1 0 1.06L5.56 20.25h2.69a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v2.69l3.97-3.97a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M3.22 3.22a.75.75 0 0 1 1.06 0l3.97 3.97V4.5a.75.75 0 0 1 1.5 0V9a.75.75 0 0 1-.75.75H4.5a.75.75 0 0 1 0-1.5h2.69L3.22 4.28a.75.75 0 0 1 0-1.06Zm17.56 0a.75.75 0 0 1 0 1.06l-3.97 3.97h2.69a.75.75 0 0 1 0 1.5H15a.75.75 0 0 1-.75-.75V4.5a.75.75 0 0 1 1.5 0v2.69l3.97-3.97a.75.75 0 0 1 1.06 0ZM3.75 15a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-2.69l-3.97 3.97a.75.75 0 0 1-1.06-1.06l3.97-3.97H4.5a.75.75 0 0 1-.75-.75Zm10.5 0a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-2.69l-3.97 3.97a.75.75 0 1 1-1.06-1.06l3.97-3.97H15a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd"/>
          </svg>
        </button>
        <button class="btn-icon btn-close" @click="$emit('close')" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <!-- Scrollable area -->
      <div class="panel-scroll-area">

        <!-- Panel head (colored banner with step title) -->
        <div v-if="$slots.header" class="panel-head">
          <slot name="header" />
        </div>

        <!-- Panel body (step content) -->
        <div class="panel-body">
          <slot />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  position:    { type: String,  default: 'bottom_right' },
  showBack:    { type: Boolean, default: false },
  isMaximized: { type: Boolean, default: false },
})
defineEmits(['back', 'close', 'toggle-maximize'])
</script>

<style>
.bc-widget-component {
  position: fixed;
  bottom: 30px;
  z-index: 999;
  width: 500px;
  max-height: 890px;
  height: 90dvh;
  background-color: #fff;
  border-radius: 1rem;
  overflow: hidden;
  filter: drop-shadow(4px 7px 9.7px rgba(0, 0, 0, 0.3));
  transition: all ease 0.25s;
  font-family: system-ui, -apple-system, sans-serif;
  color: #1e1e2a;
}

.bc-widget-component.bottom_right { right: 30px; }
.bc-widget-component.bottom_left  { left: 30px; }

.bc-widget-component.maximized {
  max-height: none !important;
  height: auto !important;
  width: auto !important;
  inset: 16px;
}

@media (max-width: 767px) {
  .bc-widget-component {
    left: 30px !important;
    right: 30px !important;
    top: 30px;
    height: auto !important;
  }
}

@media (max-width: 575px) {
  .bc-widget-component {
    top: 6px !important;
    right: 6px !important;
    bottom: 6px !important;
    left: 6px !important;
    width: auto !important;
    border-radius: 0.75rem;
  }
}

/* Screen layout */
.bc-widget-screen {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Sticky top bar */
.panel-top-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: var(--panel-head-bg, #282828);
  position: sticky;
  top: 0;
  z-index: 10;
  flex-shrink: 0;
}

.top-bar-spacer { flex: 1; }

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  border: none;
  cursor: pointer;
  color: #fff;
  padding: 0;
  transition: background-color 0.15s ease;
}

.btn-icon:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.btn-icon svg {
  width: 16px;
  height: 16px;
}

/* Scrollable area */
.panel-scroll-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.panel-scroll-area::-webkit-scrollbar       { width: 6px; }
.panel-scroll-area::-webkit-scrollbar-track { background: #f1f1f1; }
.panel-scroll-area::-webkit-scrollbar-thumb { background-color: #282828; }

/* Panel head (colored section) */
.panel-head {
  background-color: var(--panel-head-bg, #282828);
  color: #fff;
  padding: 20px 28px 28px;
}

/* Panel body */
.panel-body {
  background-color: #fff;
}
</style>
