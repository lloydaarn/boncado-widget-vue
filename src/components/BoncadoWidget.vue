<template>
  <div ref="rootEl" class="bc-widget-root">

    <!-- Loading state -->
    <div v-if="isLoading" class="bc-widget-loader">
      <div class="bc-loader-dot"></div>
    </div>

    <template v-else>
      <!-- Feature panels -->
      <PurchaseVoucher
        v-if="activePanel === 'purchaseVoucher'"
        :position="themePosition"
        :primary-color="themeColor"
        :uid="uid"
        :pk="pk"
        :vouchers="voucherCfg.vouchers || []"
        :suggestions="voucherCfg.suggestions || []"
        :majoration="voucherCfg.majoration || null"
        @close="closePanel"
      />

      <!-- Toggle + menu (hidden when a panel is open) -->
      <Transition name="fade">
        <WidgetMenu
          v-if="isMenuActive && !activePanel"
          :enabled-features="enabledFeatures"
          :position="themePosition"
          @item-click="onMenuItemClick"
        />
      </Transition>

      <WidgetToggle
        v-if="!activePanel"
        :position="themePosition"
        @toggle="toggleMenu"
      />
    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { CALLS_URL } from '../api.js'
import WidgetToggle    from './WidgetToggle.vue'
import WidgetMenu      from './WidgetMenu.vue'
import PurchaseVoucher from './panels/PurchaseVoucher.vue'

const props = defineProps({
  uid:          { type: String, default: '' },
  pk:           { type: String, default: '' },
  // Fallback theme values (used if server is unreachable)
  primaryColor: { type: String, default: '#2563eb' },
  position:     { type: String, default: 'bottom_right' },
})

// ── Init state ────────────────────────────────────────────────────
const widgetConfig = ref(null)
const isLoading    = ref(true)

// ── Derived config from API response ─────────────────────────────
const widgetCfg = computed(() => widgetConfig.value?.endpoint?.widget || {})
const themeCfg  = computed(() => widgetCfg.value?.config?.theme || {})

const themeColor    = computed(() => themeCfg.value.accent                    || props.primaryColor)
const themePosition = computed(() => themeCfg.value.position                  || props.position)
const panelHeadBg   = computed(() => themeCfg.value.panelHeadBackgroundColor  || '#282828')
const textFont      = computed(() => themeCfg.value.textFont                  || 'inherit')

const enabledFeatures = computed(() =>
  widgetCfg.value?.config?.enabledFeatures
    || ['purchaseVoucher', 'bookAppointment', 'bookTable', 'purchaseProduct']
)
const voucherCfg = computed(() => widgetCfg.value?.purchaseVoucher || {})

// ── Menu / panel state ────────────────────────────────────────────
const rootEl       = ref(null)
const isMenuActive = ref(false)
const activePanel  = ref(null)

function toggleMenu()                 { isMenuActive.value = !isMenuActive.value }
function onMenuItemClick(featureName) { isMenuActive.value = false; activePanel.value = featureName }
function closePanel()                 { activePanel.value = null }

function handleDocClick(e) {
  if (!isMenuActive.value) return
  if (!e.composedPath().includes(rootEl.value)) isMenuActive.value = false
}

// ── Initialization ────────────────────────────────────────────────
async function initialize() {
  try {
    const res = await fetch(CALLS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getMe', uid: props.uid, pk: props.pk }),
    })
    widgetConfig.value = await res.json()
  } catch (e) {
    console.warn('[BoncadoWidget] init failed:', e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocClick, true)
  initialize()
})
onBeforeUnmount(() => document.removeEventListener('click', handleDocClick, true))
</script>

<style>
:host {
  --accent:        v-bind(themeColor);
  --panel-head-bg: v-bind(panelHeadBg);
}

.bc-widget-root {
  --accent:        v-bind(themeColor);
  --panel-head-bg: v-bind(panelHeadBg);
  font-family:     v-bind(textFont);
}

.bc-widget-loader {
  position: fixed;
  bottom: 50px;
  right: 50px;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--accent, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
}
.bc-loader-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
  animation: pulse 1s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50%       { transform: scale(0.6); opacity: 0.4; }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
