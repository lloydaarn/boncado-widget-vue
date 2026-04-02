<template>
  <div class="bc-widget-main-menu" :class="position">
    <div class="menu-header">I would like...</div>
    <ul class="menu-nav">
      <li
        v-if="enabledFeatures.includes('purchaseVoucher')"
        class="nav-item"
        @click="$emit('item-click', 'purchaseVoucher')"
      >
        <span class="nav-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75a1.875 1.875 0 0 1 1.875-1.875h.375a3.75 3.75 0 0 1 7.5 0h.375a1.875 1.875 0 0 1 1.875 1.875v.75A1.875 1.875 0 0 1 11.625 11.25H3.375v-.75h8.25V9.375a.375.375 0 0 0-.375-.375H9.375v-1.5h1.875a.375.375 0 1 0 0-.75H9.375ZM3 12.75h8.25v7.5A1.875 1.875 0 0 1 9.375 22.125H4.875A1.875 1.875 0 0 1 3 20.25v-7.5ZM12.75 12.75H21v7.5A1.875 1.875 0 0 1 19.125 22.125h-4.5a1.875 1.875 0 0 1-1.875-1.875v-7.5Z"/>
          </svg>
          Buy Boncado vouchers
        </span>
      </li>

      <li
        v-if="enabledFeatures.includes('bookAppointment')"
        class="nav-item"
        @click="$emit('item-click', 'bookAppointment')"
      >
        <span class="nav-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Zm13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5Z" clip-rule="evenodd"/>
          </svg>
          Book an appointment
        </span>
      </li>

      <li
        v-if="enabledFeatures.includes('bookTable')"
        class="nav-item"
        @click="$emit('item-click', 'bookTable')"
      >
        <span class="nav-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z" clip-rule="evenodd"/>
          </svg>
          Book a table
        </span>
      </li>

      <li
        v-if="enabledFeatures.includes('purchaseProduct')"
        class="nav-item"
        @click="$emit('item-click', 'purchaseProduct')"
      >
        <span class="nav-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z" clip-rule="evenodd"/>
          </svg>
          Purchase products
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  enabledFeatures: { type: Array, default: () => [] },
  position: { type: String, default: 'bottom_right' },
})
defineEmits(['item-click'])
</script>

<style>
.bc-widget-main-menu {
  position: fixed;
  bottom: 120px;
  width: 265px;
  border-radius: 10px;
  overflow: hidden;
  z-index: 1000;
  font-family: system-ui, -apple-system, sans-serif;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
}

.bc-widget-main-menu.bottom_right { right: 30px; }
.bc-widget-main-menu.bottom_left { left: 30px; }

@media (min-width: 1200px) {
  .bc-widget-main-menu {
    bottom: 115px;
  }
  .bc-widget-main-menu.bottom_right { right: 50px; }
  .bc-widget-main-menu.bottom_left { left: 50px; }
}

.menu-header {
  padding: 14px 26px;
  background-color: #282828;
  color: #fff;
  font-weight: 700;
  font-size: 0.95rem;
}

.menu-nav {
  list-style: none;
  margin: 0;
  padding: 0;
  background-color: #fff;
}

.nav-item {
  cursor: pointer;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 14px 25px;
  gap: 1.25rem;
  color: #1e1e2a;
  font-weight: 700;
  font-size: 0.9rem;
  white-space: nowrap;
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-link:hover {
  background-color: var(--accent, #2563eb);
  color: #fff;
}

.nav-link:hover svg {
  fill: #fff;
}

.nav-link svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  fill: var(--accent, #2563eb);
  transition: fill 0.15s ease;
}
</style>
