<template>
  <PanelShell
    :position="position"
    :show-back="showBack"
    :is-maximized="isMaximized"
    @back="goBack"
    @close="$emit('close')"
    @toggle-maximize="isMaximized = !isMaximized"
  >
    <!-- Panel head slot: step title/subtitle -->
    <template #header>
      <div v-if="currentStep !== 'success'" class="step-header">
        <p class="step-subtitle" v-if="stepMeta.subtitle">{{ stepMeta.subtitle }}</p>
        <h4 class="step-title" v-if="stepMeta.title">{{ stepMeta.title }}</h4>
      </div>
    </template>

    <!-- ── STEP: suggestions ─────────────────────────────────────── -->
    <div v-if="currentStep === 'suggestions'" class="step-body step-suggestions">
      <div class="suggestions-grid">
        <!-- Custom amount card -->
        <div class="suggestion-card suggestion-card--custom" @click="navigate('gift-details')">
          <div class="suggestion-card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.25a.75.75 0 0 1 .75.75v9.25H21a.75.75 0 0 1 0 1.5h-8.25V21a.75.75 0 0 1-1.5 0v-7.25H3a.75.75 0 0 1 0-1.5h8.25V3a.75.75 0 0 1 .75-.75Z"/>
            </svg>
          </div>
          <h5>Custom amount</h5>
          <p>Choose a custom amount to make your gift more personal and meaningful.</p>
          <span class="suggestion-cta">Set custom amount →</span>
        </div>

        <!-- Preset suggestions -->
        <div
          v-for="s in suggestions"
          :key="s.value"
          class="suggestion-card"
          @click="selectSuggestion(s)"
        >
          <img v-if="s.img" :src="s.img" :alt="s.title" class="suggestion-img" />
          <h5>{{ s.title }}</h5>
          <p v-if="s.description">{{ s.description }}</p>
          <span class="suggestion-value">{{ formatCurrency(s.value) }}</span>
        </div>
      </div>
    </div>

    <!-- ── STEP: gift-details ────────────────────────────────────── -->
    <div v-else-if="currentStep === 'gift-details'" class="step-body step-gift-details">

      <!-- Voucher image + rotate button -->
      <div class="voucher-img-wrap">
        <img
          v-if="vouchers.length > 0"
          :src="vouchers[currentVoucherIdx].img"
          class="voucher-full-img"
          loading="lazy"
        />
        <div v-else class="voucher-placeholder-img"></div>

        <button
          v-if="vouchers.length > 1"
          type="button"
          class="btn-rotate"
          @click="currentVoucherIdx = (currentVoucherIdx + 1) % vouchers.length"
          title="Next design"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>

      <!-- Browse library link -->
      <div v-if="vouchers.length > 0" class="browse-link-wrap">
        <button type="button" class="btn-browse-link" @click="navigate('library')">
          Choose another design
        </button>
      </div>

      <!-- Form -->
      <form class="panel-form" @submit.prevent="onGiftDetailsSubmit">

        <!-- Value + Qty -->
        <div class="form-row">
          <div class="form-group">
            <label>Value <em class="req-label">(Required field)</em></label>
            <input
              type="number"
              v-model="form.voucher_value"
              min="1"
              step="0.01"
              placeholder="0"
              class="input-centered"
              required
            />
          </div>
          <div class="form-group">
            <label>Quantity</label>
            <div class="qty-group">
              <button type="button" class="qty-btn" @click="form.voucher_qty = Math.max(1, form.voucher_qty - 1)">−</button>
              <span class="qty-display">{{ form.voucher_qty }}</span>
              <button type="button" class="qty-btn" @click="form.voucher_qty++">+</button>
            </div>
          </div>
        </div>

        <!-- Majoration card -->
        <div v-if="showMajorationCard" class="majoration-card">
          <div v-if="form.majoration_accepted === null">
            <p class="majoration-title">🎉 You are eligible for a bonus!</p>
            <p class="majoration-desc">
              Pay <strong>{{ formatCurrency(form.voucher_value) }}</strong> and receive a voucher worth
              <strong>{{ formatMajorationWorth() }}</strong>!
            </p>
            <div class="majoration-actions">
              <button type="button" class="btn-accent" @click="acceptMajoration">Yes, I want to use it</button>
              <button type="button" class="btn-ghost" @click="form.majoration_accepted = false">No, not this time</button>
            </div>
          </div>
          <div v-else-if="form.majoration_accepted === true" class="majoration-accepted">
            <span>✓ Bonus applied!</span>
            <button type="button" class="btn-ghost btn-sm" @click="form.majoration_accepted = null; form.majoration_id = null">Cancel</button>
          </div>
          <div v-else class="majoration-declined">
            <span>An increase is possible, but you chose not to use it.</span>
            <button type="button" class="btn-ghost btn-sm" @click="form.majoration_accepted = null">Reconsider</button>
          </div>
        </div>

        <!-- From + To -->
        <div class="form-row">
          <div class="form-group">
            <label>From <em class="req-label">(Required field)</em></label>
            <input type="text" v-model="form.gift_from" class="input-centered" required />
          </div>
          <div class="form-group">
            <label>To <em class="req-label">(Required field)</em></label>
            <input type="text" v-model="form.gift_to" class="input-centered" required />
          </div>
        </div>

        <!-- Message -->
        <div class="form-group">
          <label>Message</label>
          <textarea v-model="form.gift_reason" rows="4"></textarea>
        </div>

        <div class="submit-center">
          <button type="submit" class="btn-submit-dark">Next</button>
        </div>
      </form>
    </div>

    <!-- ── STEP: library ──────────────────────────────────────────── -->
    <div v-else-if="currentStep === 'library'" class="step-body step-library">
      <div class="library-grid">
        <button
          v-for="(v, idx) in vouchers"
          :key="v.id"
          class="library-item"
          :class="{ active: idx === currentVoucherIdx }"
          @click="currentVoucherIdx = idx; goBack()"
        >
          <img :src="v.img" :alt="'Design ' + v.id" loading="lazy" />
        </button>
      </div>
    </div>

    <!-- ── STEP: send-gift ───────────────────────────────────────── -->
    <div v-else-if="currentStep === 'send-gift'" class="step-body step-send-gift">
      <!-- Delivery tabs -->
      <div class="delivery-tabs">
        <button
          class="tab-btn"
          :class="{ active: form.deliveryOption === 'email' }"
          @click="form.deliveryOption = 'email'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z"/>
            <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z"/>
          </svg>
          By e-mail
        </button>
        <button
          class="tab-btn"
          :class="{ active: form.deliveryOption === 'post' }"
          @click="form.deliveryOption = 'post'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="m9.344 3.071 9.634 5.563a3 3 0 0 1 0 5.133l-9.634 5.562a3 3 0 0 1-4.344-2.567V5.637a3 3 0 0 1 4.344-2.566Z" clip-rule="evenodd"/>
          </svg>
          By post
        </button>
      </div>

      <!-- Email delivery form -->
      <form v-if="form.deliveryOption === 'email'" class="panel-form" @submit.prevent="navigate('payment')">
        <div class="info-box">
          We'll email or text the voucher on your chosen date. You can schedule the sending date or send immediately after payment.
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>First name <span class="required">*</span></label>
            <input type="text" v-model="form.email_first_name" placeholder="First name" required />
          </div>
          <div class="form-group">
            <label>Last name <span class="required">*</span></label>
            <input type="text" v-model="form.email_last_name" placeholder="Last name" required />
          </div>
        </div>
        <div class="form-group">
          <label>Email or telephone <span class="required">*</span></label>
          <input type="text" v-model="form.email_email" placeholder="email@example.com or +32..." required />
        </div>
        <div class="form-group">
          <label>Schedule date <span class="form-hint">(leave empty to send immediately)</span></label>
          <input type="datetime-local" v-model="form.email_planify" />
        </div>
        <div class="form-group">
          <label>Secondary email <span class="form-hint">(optional copy)</span></label>
          <input type="email" v-model="form.email_security_email" placeholder="cc@example.com" />
        </div>
        <button type="submit" class="btn-submit">Next →</button>
      </form>

      <!-- Post delivery form -->
      <form v-else class="panel-form" @submit.prevent="navigate('payment')">
        <div class="info-box">
          We'll send you a high-definition printed voucher, delicately encased in a charming cardboard sleeve,
          for just <strong>{{ formatCurrency(premiumAddonValue) }} extra per voucher.</strong>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>First name <span class="required">*</span></label>
            <input type="text" v-model="form.delivery_first_name" placeholder="First name" required />
          </div>
          <div class="form-group">
            <label>Last name <span class="required">*</span></label>
            <input type="text" v-model="form.delivery_last_name" placeholder="Last name" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group form-group--sm">
            <label>House no. <span class="required">*</span></label>
            <input type="text" v-model="form.delivery_house_number" placeholder="12A" required />
          </div>
          <div class="form-group">
            <label>Street <span class="required">*</span></label>
            <input type="text" v-model="form.delivery_street" placeholder="Street name" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group form-group--sm">
            <label>Postal code <span class="required">*</span></label>
            <input type="text" v-model="form.delivery_pc" placeholder="1000" required />
          </div>
          <div class="form-group">
            <label>City <span class="required">*</span></label>
            <input type="text" v-model="form.delivery_city" placeholder="Brussels" required />
          </div>
        </div>
        <div class="form-group">
          <label>Contact email <span class="required">*</span></label>
          <input type="email" v-model="form.delivery_security_email" placeholder="your@email.com" required />
        </div>
        <button type="submit" class="btn-submit">Next →</button>
      </form>
    </div>

    <!-- ── STEP: payment ─────────────────────────────────────────── -->
    <div v-else-if="currentStep === 'payment'" class="step-body step-payment">
      <form class="panel-form" @submit.prevent="submitCheckout">

        <!-- Payer details -->
        <h3 class="form-section-title">Payment details</h3>
        <div class="form-row">
          <div class="form-group">
            <label>First name <span class="required">*</span></label>
            <input type="text" v-model="form.payment_first_name" placeholder="First name" required />
          </div>
          <div class="form-group">
            <label>Last name <span class="required">*</span></label>
            <input type="text" v-model="form.payment_last_name" placeholder="Last name" required />
          </div>
        </div>
        <div class="form-group">
          <label>Email <span class="required">*</span></label>
          <input type="email" v-model="form.payment_email" placeholder="your@email.com" required />
        </div>

        <!-- Invoice toggle -->
        <label class="checkbox-label">
          <input type="checkbox" v-model="form.get_billing_form" />
          I want an invoice
        </label>

        <!-- Billing information -->
        <div v-if="form.get_billing_form" class="billing-section">
          <h3 class="form-section-title">Billing information</h3>
          <div class="form-group">
            <label>Company</label>
            <input type="text" v-model="form.payment_billing_company" placeholder="Company name" />
          </div>
          <div class="form-group">
            <label>Business #</label>
            <input type="text" v-model="form.payment_billing_vatNumber" placeholder="BE 0123 456 789" />
          </div>
          <div class="form-group">
            <label>Address</label>
            <input type="text" v-model="form.payment_billing_address" placeholder="Street, house no." />
          </div>
          <div class="form-row">
            <div class="form-group form-group--sm">
              <label>Postal code</label>
              <input type="text" v-model="form.payment_billing_pc" placeholder="1000" />
            </div>
            <div class="form-group">
              <label>City</label>
              <input type="text" v-model="form.payment_billing_city" placeholder="Brussels" />
            </div>
          </div>
          <div class="form-group">
            <label>Country</label>
            <select v-model="form.payment_billing_fk_countries">
              <option value="">Select a country</option>
              <option value="BE">Belgium</option>
              <option value="FR">France</option>
              <option value="NL">Netherlands</option>
              <option value="LU">Luxembourg</option>
              <option value="DE">Germany</option>
              <option value="GB">United Kingdom</option>
            </select>
          </div>
        </div>

        <!-- Order summary -->
        <div class="order-summary">
          <h3 class="form-section-title">Order summary</h3>
          <table class="summary-table">
            <tbody>
              <tr>
                <td>Voucher × {{ form.voucher_qty }}</td>
                <td class="text-right">{{ formatCurrency(voucherSubtotal) }}</td>
              </tr>
              <tr v-if="form.majoration_accepted && majoration">
                <td>Bonus ({{ majoration.title }}) × {{ form.voucher_qty }}</td>
                <td class="text-right text-accent">+ value included</td>
              </tr>
              <tr v-if="form.deliveryOption === 'post'">
                <td>Delivery × {{ form.voucher_qty }}</td>
                <td class="text-right">{{ formatCurrency(deliveryCost) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="summary-total">
                <td><strong>Total</strong></td>
                <td class="text-right"><strong>{{ formatCurrency(grandTotal) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Payment method -->
        <h3 class="form-section-title">Payment method</h3>
        <p class="form-hint-block">Pick your preferred way to pay. Once you choose, we'll redirect you to complete the payment.</p>
        <div class="payment-methods">
          <label class="payment-method-card" :class="{ active: form.payment_method === 'bancontact' }">
            <input type="radio" v-model="form.payment_method" value="bancontact" />
            <span class="pm-name">Bancontact</span>
          </label>
          <label class="payment-method-card" :class="{ active: form.payment_method === 'card' }">
            <input type="radio" v-model="form.payment_method" value="card" />
            <span class="pm-name">💳 Debit or Credit card</span>
          </label>
        </div>

        <p class="security-notice">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clip-rule="evenodd"/>
          </svg>
          Your payment is secure with SSL encryption.
        </p>

        <button type="submit" class="btn-submit" :disabled="!form.payment_method">
          Complete order →
        </button>
      </form>
    </div>

    <!-- ── STEP: payment-progress ────────────────────────────────── -->
    <div v-else-if="currentStep === 'payment-progress'" class="step-body step-progress">
      <div class="progress-content">
        <div class="spinner"></div>
        <h4>Payment in progress</h4>
        <p>Waiting for payment confirmation.</p>
        <p class="progress-hint">Please do not close this window.</p>
      </div>
    </div>

    <!-- ── STEP: success ─────────────────────────────────────────── -->
    <div v-else-if="currentStep === 'success'" class="step-body step-success">
      <div class="success-content">
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd"/>
          </svg>
        </div>
        <h3>Thank you{{ form.payment_first_name ? ', ' + form.payment_first_name : '' }}!</h3>
        <p>Your gift voucher has been successfully purchased! Please check your email for the details.</p>
        <button class="btn-submit" @click="reset">Purchase another voucher</button>
      </div>
    </div>

    <!-- ── STEP: error ───────────────────────────────────────────── -->
    <div v-else-if="currentStep === 'error'" class="step-body step-error">
      <div class="error-content">
        <div class="error-icon">✕</div>
        <h4>Something went wrong</h4>
        <p>Your payment could not be processed. Please try again or contact us for help.</p>
        <button class="btn-submit" @click="reset">Try again</button>
      </div>
    </div>

  </PanelShell>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { CALLS_URL } from '../../api.js'
import PanelShell from './PanelShell.vue'

const props = defineProps({
  position:          { type: String,  default: 'bottom_right' },
  primaryColor:      { type: String,  default: '#2563eb' },
  uid:               { type: String,  default: '' },
  pk:                { type: String,  default: '' },
  vouchers:          { type: Array,   default: () => [] },
  suggestions:       { type: Array,   default: () => [] },
  majoration:        { type: Object,  default: null },
  premiumAddonValue: { type: Number,  default: 2.99 },
})

defineEmits(['close'])

// ── State ────────────────────────────────────────────────────────
const currentStep      = ref(null)
const stepHistory      = ref([])
const isMaximized      = ref(false)
const currentVoucherIdx = ref(0)
let   pollInterval     = null

const form = reactive({
  voucher_value:   '',
  voucher_qty:     1,
  gift_from:       '',
  gift_to:         '',
  gift_reason:     '',
  selectedSuggestion: null,

  deliveryOption:           'email',
  email_first_name:         '',
  email_last_name:          '',
  email_email:              '',
  email_security_email:     '',
  email_planify:            '',
  delivery_first_name:      '',
  delivery_last_name:       '',
  delivery_house_number:    '',
  delivery_street:          '',
  delivery_city:            '',
  delivery_pc:              '',
  delivery_security_email:  '',

  payment_first_name:           '',
  payment_last_name:            '',
  payment_email:                '',
  payment_method:               '',
  get_billing_form:             false,
  payment_billing_company:      '',
  payment_billing_vatNumber:    '',
  payment_billing_address:      '',
  payment_billing_pc:           '',
  payment_billing_city:         '',
  payment_billing_fk_countries: '',

  majoration_accepted: null,
  majoration_id:       null,
})

// ── Computed ─────────────────────────────────────────────────────
const showBack = computed(() =>
  stepHistory.value.length > 0 &&
  !['success', 'error', 'payment-progress'].includes(currentStep.value)
)

const showMajorationCard = computed(() => {
  if (!props.majoration) return false
  const val = parseFloat(form.voucher_value) || 0
  return val >= (props.majoration.min || 0)
})

const voucherSubtotal = computed(() => {
  return (parseFloat(form.voucher_value) || 0) * form.voucher_qty
})

const deliveryCost = computed(() => {
  return form.deliveryOption === 'post' ? props.premiumAddonValue * form.voucher_qty : 0
})

const grandTotal = computed(() => voucherSubtotal.value + deliveryCost.value)

const stepMeta = computed(() => {
  const map = {
    'suggestions':       { subtitle: "Because nothing says 'I care' like the freedom to choose!", title: 'Unlock happiness with these gift vouchers!' },
    'gift-details':      { subtitle: 'Add a personal touch — tell us who it\'s for and how much happiness to send!', title: 'Make someone happy and send them a voucher!' },
    'send-gift':         { subtitle: 'Choose whether to deliver your gift by mail or email — easy, fast, and full of surprises!', title: 'How do you want to spread the joy?' },
    'payment':           { subtitle: 'Complete your purchase by providing your payment information.', title: 'Almost there — time to seal the deal!' },
    'payment-progress':  { subtitle: '', title: 'Payment in progress' },
    'success':           { subtitle: '', title: '' },
    'error':             { subtitle: '', title: 'Error' },
  }
  return map[currentStep.value] || { title: '', subtitle: '' }
})

// ── Navigation ───────────────────────────────────────────────────
function navigate(step) {
  stepHistory.value.push(currentStep.value)
  currentStep.value = step
}

function goBack() {
  if (stepHistory.value.length) {
    currentStep.value = stepHistory.value.pop()
  }
}

function reset() {
  Object.assign(form, {
    voucher_value: '', voucher_qty: 1, gift_from: '', gift_to: '', gift_reason: '',
    selectedSuggestion: null, deliveryOption: 'email',
    email_first_name: '', email_last_name: '', email_email: '', email_security_email: '', email_planify: '',
    delivery_first_name: '', delivery_last_name: '', delivery_house_number: '', delivery_street: '',
    delivery_city: '', delivery_pc: '', delivery_security_email: '',
    payment_first_name: '', payment_last_name: '', payment_email: '', payment_method: '',
    get_billing_form: false, payment_billing_company: '', payment_billing_vatNumber: '',
    payment_billing_address: '', payment_billing_pc: '', payment_billing_city: '',
    payment_billing_fk_countries: '', majoration_accepted: null, majoration_id: null,
  })
  stepHistory.value = []
  currentVoucherIdx.value = 0
  currentStep.value = props.suggestions.length > 0 ? 'suggestions' : 'gift-details'
}

// ── Handlers ─────────────────────────────────────────────────────
function selectSuggestion(s) {
  form.selectedSuggestion = s
  form.voucher_value = String(s.value)
  navigate('gift-details')
}

function onGiftDetailsSubmit() {
  navigate('send-gift')
}

function acceptMajoration() {
  form.majoration_accepted = true
  form.majoration_id = props.majoration?.id || null
}

// ── API / Checkout ────────────────────────────────────────────────
async function submitCheckout() {
  navigate('payment-progress')
  try {
    const res = await fetch(CALLS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'getCheckout',
        uid: props.uid,
        pk: props.pk,
        context: 'purchaseVoucher',
        formData: JSON.stringify({ ...form }),
      }),
    })
    const data = await res.json()
    if (data.endpoint?.url) {
      window.location.href = data.endpoint.url
    } else {
      startPolling()
    }
  } catch {
    currentStep.value = 'error'
  }
}

function startPolling() {
  pollInterval = setInterval(async () => {
    try {
      const res = await fetch(CALLS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verifyCheckout', uid: props.uid, pk: props.pk, context: 'purchaseVoucher' }),
      })
      const data = await res.json()
      const code = data.endpoint?.code
      if (code === 1) {
        clearInterval(pollInterval)
        currentStep.value = 'success'
      } else if (code === 3 || code === -1) {
        clearInterval(pollInterval)
        currentStep.value = 'error'
      }
    } catch {
      clearInterval(pollInterval)
      currentStep.value = 'error'
    }
  }, 3000)
}

// ── Helpers ───────────────────────────────────────────────────────
function formatCurrency(val) {
  const num = parseFloat(val) || 0
  return new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(num)
}

function formatMajorationWorth() {
  if (!props.majoration) return ''
  const val = parseFloat(form.voucher_value) || 0
  const worth = val + (props.majoration.value || 0)
  return formatCurrency(worth)
}

// ── Lifecycle ─────────────────────────────────────────────────────
onMounted(() => {
  currentStep.value = props.suggestions.length > 0 ? 'suggestions' : 'gift-details'
})

onBeforeUnmount(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style>
/* ── Step body wrapper ────────────────────────────────────────── */
.step-body {
  font-family: system-ui, -apple-system, sans-serif;
}

/* ── Step header ─────────────────────────────────────────────── */
.step-header {
  padding: 0;
}
.step-subtitle {
  font-size: 0.8rem;
  opacity: 0.75;
  margin: 0 0 6px;
  line-height: 1.4;
}
.step-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.3;
}

/* ── Suggestions ─────────────────────────────────────────────── */
.step-suggestions {
  padding: 20px;
}
.suggestions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.suggestion-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.suggestion-card:hover {
  border-color: var(--accent, #2563eb);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #2563eb) 15%, transparent);
}
.suggestion-card h5 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e1e2a;
}
.suggestion-card p {
  margin: 0;
  font-size: 0.78rem;
  color: #6b7280;
  line-height: 1.4;
}
.suggestion-card--custom .suggestion-card-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--accent, #2563eb);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.suggestion-card--custom .suggestion-card-icon svg {
  width: 18px;
  height: 18px;
  fill: #fff;
}
.suggestion-cta {
  font-size: 0.8rem;
  color: var(--accent, #2563eb);
  font-weight: 600;
  margin-top: auto;
}
.suggestion-img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
}
.suggestion-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent, #2563eb);
}


/* ── Voucher image + rotate ──────────────────────────────────── */
.voucher-img-wrap {
  position: relative;
}
.voucher-full-img {
  display: block;
  width: 100%;
  height: auto;
}
.voucher-placeholder-img {
  width: 100%;
  aspect-ratio: 2 / 1;
  background: linear-gradient(135deg, var(--accent, #2563eb) 0%, color-mix(in srgb, var(--accent, #2563eb) 60%, #000) 100%);
}
.btn-rotate {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  border: none;
  cursor: pointer;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.15s;
}
.btn-rotate:hover { background: rgba(0, 0, 0, 0.75); }
.btn-rotate svg   { width: 20px; height: 20px; }

/* ── Browse link ─────────────────────────────────────────────── */
.browse-link-wrap {
  text-align: center;
  padding: 10px 0 0;
}
.btn-browse-link {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: underline;
  color: #1e1e2a;
  font-family: inherit;
  padding: 4px 0;
}

/* ── Library step ────────────────────────────────────────────── */
.step-library { padding: 16px; }
.library-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.library-item {
  border: 3px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  background: none;
  transition: border-color 0.15s;
}
.library-item img {
  width: 100%;
  height: auto;
  display: block;
}
.library-item.active {
  border-color: var(--accent, #2563eb);
}

/* ── Forms ───────────────────────────────────────────────────── */
.panel-form {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.form-group.form-group--sm {
  flex: 0 0 100px;
}
.form-row {
  display: flex;
  gap: 12px;
}
.form-group label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #374151;
}
.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 2rem;
  font-size: 0.9rem;
  color: #1e1e2a;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}
.form-group textarea {
  border-radius: 12px;
  resize: vertical;
  min-height: 80px;
}
.form-group select {
  border-radius: 2rem;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent, #2563eb);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent, #2563eb) 15%, transparent);
}
.required { color: var(--accent, #2563eb); }
.req-label { font-weight: 400; font-style: italic; color: #6b7280; font-size: 0.82rem; }
.form-hint { font-weight: 400; color: #9ca3af; font-size: 0.78rem; }
.form-hint-block { font-size: 0.82rem; color: #6b7280; margin: 0; line-height: 1.5; }
.input-centered { text-align: center; }
.form-section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e1e2a;
  margin: 6px 0 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

/* ── Currency input ──────────────────────────────────────────── */
.input-euro {
  position: relative;
}
.input-euro input {
  padding-right: 36px;
}
.euro-symbol {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 0.9rem;
  pointer-events: none;
}

/* ── Quantity group ──────────────────────────────────────────── */
.qty-group {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 2rem;
  overflow: hidden;
  height: 44px;
}
.qty-btn {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  background: #f3f4f6;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  color: #374151;
  transition: background-color 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qty-btn:hover { background: #e5e7eb; }
.qty-display {
  flex: 1;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e1e2a;
  border-left: 1px solid #d1d5db;
  border-right: 1px solid #d1d5db;
  line-height: 44px;
}

/* ── Majoration card ─────────────────────────────────────────── */
.majoration-card {
  background: color-mix(in srgb, var(--accent, #2563eb) 8%, #fff);
  border: 1px solid color-mix(in srgb, var(--accent, #2563eb) 25%, transparent);
  border-radius: 10px;
  padding: 14px;
}
.majoration-title { font-weight: 700; font-size: 0.9rem; margin: 0 0 4px; }
.majoration-desc  { font-size: 0.85rem; color: #374151; margin: 0 0 10px; }
.majoration-actions { display: flex; gap: 8px; }
.majoration-accepted, .majoration-declined {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
}

/* ── Delivery tabs ───────────────────────────────────────────── */
.delivery-tabs {
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  background: #fff;
}
.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  transition: color 0.15s;
  font-family: inherit;
}
.tab-btn svg { width: 16px; height: 16px; fill: currentColor; }
.tab-btn.active {
  color: var(--accent, #2563eb);
  border-bottom-color: var(--accent, #2563eb);
}
.info-box {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.82rem;
  color: #0369a1;
  line-height: 1.5;
}

/* ── Checkbox ────────────────────────────────────────────────── */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
}
.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent, #2563eb);
  cursor: pointer;
}
.billing-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

/* ── Order summary ───────────────────────────────────────────── */
.order-summary {
  background: #f9fafb;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  padding: 16px;
}
.summary-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}
.summary-table td { padding: 5px 0; color: #374151; }
.summary-table .text-right { text-align: right; }
.summary-table .text-accent { color: var(--accent, #2563eb); }
.summary-table tfoot td { border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 1rem; }

/* ── Payment methods ─────────────────────────────────────────── */
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.payment-method-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s;
  font-size: 0.9rem;
  font-weight: 600;
}
.payment-method-card input[type="radio"] { accent-color: var(--accent, #2563eb); }
.payment-method-card.active { border-color: var(--accent, #2563eb); background: color-mix(in srgb, var(--accent, #2563eb) 5%, #fff); }
.pm-name { flex: 1; }
.security-notice {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: #6b7280;
}
.security-notice svg { width: 14px; height: 14px; fill: #6b7280; flex-shrink: 0; }

/* ── Buttons ─────────────────────────────────────────────────── */
.submit-center {
  display: flex;
  justify-content: center;
  margin-top: 6px;
}
.btn-submit-dark {
  padding: 13px 48px;
  background: #1e1e2a;
  color: #fff;
  border: none;
  border-radius: 2rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
  font-family: inherit;
}
.btn-submit-dark:hover { opacity: 0.85; }
/* Full-width dark submit (payment step) */
.btn-submit {
  width: 100%;
  padding: 13px;
  background: #1e1e2a;
  color: #fff;
  border: none;
  border-radius: 2rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s;
  font-family: inherit;
  margin-top: 6px;
}
.btn-submit:hover:not(:disabled) { opacity: 0.85; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-accent {
  padding: 8px 16px;
  background: var(--accent, #2563eb);
  color: #fff;
  border: none;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.btn-ghost {
  padding: 8px 16px;
  background: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.btn-sm { padding: 5px 10px; font-size: 0.78rem; }

/* ── Payment progress ────────────────────────────────────────── */
.step-progress { padding: 40px 20px; }
.progress-content { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
.progress-content h4 { margin: 0; font-size: 1.1rem; }
.progress-content p { margin: 0; color: #6b7280; font-size: 0.9rem; }
.progress-hint { font-size: 0.78rem !important; }
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: var(--accent, #2563eb);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Success ─────────────────────────────────────────────────── */
.step-success { padding: 40px 20px; }
.success-content { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
.success-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
}
.success-icon svg { width: 44px; height: 44px; fill: #fff; }
.success-content h3 { margin: 0; font-size: 1.4rem; }
.success-content p { margin: 0; color: #6b7280; font-size: 0.9rem; max-width: 300px; line-height: 1.5; }

/* ── Error ───────────────────────────────────────────────────── */
.step-error { padding: 40px 20px; }
.error-content { display: flex; flex-direction: column; align-items: center; gap: 16px; text-align: center; }
.error-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
}
.error-content h4 { margin: 0; font-size: 1.2rem; }
.error-content p { margin: 0; color: #6b7280; font-size: 0.9rem; max-width: 300px; line-height: 1.5; }
</style>
