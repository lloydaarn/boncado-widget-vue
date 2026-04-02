# Boncado Widget — Migration Log

Migrating the legacy Lit-based `boncado-widget` (in `legacy/`) to Vue 3 + Vite as a distributable Web Component.

---

## Phase 1 — Toggle Button + Main Menu
**Status:** ✅ Complete

### What was built
- `src/components/BoncadoWidget.vue` — root custom element wrapper; holds `isMenuActive` + `activePanel` state; sets `--accent` CSS variable for theming
- `src/components/WidgetToggle.vue` — fixed pill button ("I would like..."); toggles the menu
- `src/components/WidgetMenu.vue` — fixed dropdown menu with 4 feature items (inline SVGs, no Bootstrap)
- `src/main.ce.js` — registers `<boncado-widget>` as a Web Component via `defineCustomElement`
- `src/main.dev.js` — mounts `BoncadoWidget` in a standard Vue app for dev

### Key decisions
- No Bootstrap — all CSS written from scratch in component `<style>` blocks (shadow DOM provides isolation)
- Inline SVG icons (no external icon library)
- Click-outside uses `event.composedPath()` to work correctly inside the Shadow DOM
- Vite build output renamed from `table-booking-widget` → `boncado-widget`

### Legacy reference
- `legacy/js/widget.js` — toggle/menu rendering (lines 597–691)
- `legacy/scss/pages/_home.scss` — toggle/menu styles (lines 130–223)

---

## Phase 2 — Purchase Voucher Feature
**Status:** ✅ Complete

### What was built
- `src/components/panels/PanelShell.vue` — reusable panel wrapper (fixed overlay, sticky top-bar with back/maximize/close, scrollable body)
- `src/components/panels/PurchaseVoucher.vue` — full multi-step voucher wizard

### Voucher wizard steps
| Step | Screen |
|---|---|
| `suggestions` | Preset value cards + custom amount (skipped if no suggestions prop) |
| `gift-details` | CSS voucher preview card + value/qty/from/to/message form |
| `send-gift` | Email delivery or Post delivery tabs |
| `payment` | Payer details + optional billing + order summary + payment method |
| `payment-progress` | Spinner + payment polling (3s interval) |
| `success` | Confirmation + "Purchase another" reset |
| `error` | Error message + retry |

### BoncadoWidget.vue changes
- Wired `activePanel` — clicking a menu item now opens the corresponding panel
- Added `apiEndpoint`, `voucherSuggestions`, `voucherMajoration`, `voucherPremiumAddon` props
- `PurchaseVoucher` rendered via `v-if="activePanel === 'purchaseVoucher'"`

### Key decisions
- API calls: POST to `apiEndpoint` with `action: "getCheckout"` / `"verifyCheckout"`. If `apiEndpoint` is empty, simulates success after 2s.
- Voucher card preview: CSS-only (gradient using `--accent`), no external image dependency
- Majoration (bonus program): rendered if `voucherMajoration` prop is provided and voucher value ≥ minimum
- Currency formatting: `Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' })`
- Navigation: `stepHistory` array stack enables back button across all steps

### Legacy reference
- `legacy/js/components/purchase-voucher.js` — full LitElement implementation

---

## Upcoming Phases

| Phase | Feature | Status |
|---|---|---|
| 3 | Appointment Booking (`bookAppointment`) | ⏳ Pending |
| 4 | Table Reservation (`bookTable`) | ⏳ Pending |
| 5 | E-commerce / Products (`purchaseProduct`) | ⏳ Pending |
