<template>
    <div class="booking-widget">
        <h2 class="widget-title">{{ title }}</h2>

        <form v-if="!bookingConfirmed" @submit.prevent="handleSubmit" class="booking-form">
            <!-- Date Selection -->
            <div class="form-group">
                <label for="date">Date</label>
                <input
                    type="date"
                    id="date"
                    v-model="form.date"
                    :min="minDate"
                    required />
            </div>

            <!-- Time Selection -->
            <div class="form-group">
                <label for="time">Time</label>
                <select id="time" v-model="form.time" required>
                    <option value="" disabled>Select a time</option>
                    <option v-for="slot in timeSlots" :key="slot" :value="slot">
                        {{ slot }}
                    </option>
                </select>
            </div>

            <!-- Party Size -->
            <div class="form-group">
                <label for="guests">Guests</label>
                <select id="guests" v-model="form.guests" required>
                    <option v-for="n in maxGuestsNum" :key="n" :value="n">
                        {{ n }} {{ n === 1 ? "Guest" : "Guests" }}
                    </option>
                </select>
            </div>

            <!-- Contact Info -->
            <div class="form-group">
                <label for="name">Name</label>
                <input
                    type="text"
                    id="name"
                    v-model="form.name"
                    placeholder="Your name"
                    required />
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input
                    type="email"
                    id="email"
                    v-model="form.email"
                    placeholder="your@email.com"
                    required />
            </div>

            <div class="form-group">
                <label for="phone">Phone</label>
                <input
                    type="tel"
                    id="phone"
                    v-model="form.phone"
                    placeholder="+1 234 567 8900" />
            </div>

            <!-- Special Requests -->
            <div class="form-group">
                <label for="notes">Special Requests</label>
                <textarea
                    id="notes"
                    v-model="form.notes"
                    rows="3"
                    placeholder="Any dietary requirements or special requests..."></textarea>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
                {{ isSubmitting ? "Booking..." : "Book Table" }}
            </button>
        </form>

        <!-- Success Message -->
        <div v-if="bookingConfirmed" class="success-message">
            <span class="success-icon">✓</span>
            <h3>Booking Confirmed!</h3>
            <p>
                We've sent a confirmation to <strong>{{ form.email }}</strong>
            </p>
            <button @click="resetForm" class="new-booking-btn">
                Make Another Booking
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
    title: {
        type: String,
        default: "Reserve a Table",
    },
    maxGuests: {
        type: [Number, String],
        default: 10,
    },
    apiEndpoint: {
        type: String,
        default: "",
    },
    primaryColor: {
        type: String,
        default: "#2563eb",
    },
});

const emit = defineEmits([
    "booking-submitted",
    "booking-confirmed",
    "booking-error",
]);

// Form state
const form = ref({
    date: "",
    time: "",
    guests: 2,
    name: "",
    email: "",
    phone: "",
    notes: "",
});

const isSubmitting = ref(false);
const bookingConfirmed = ref(false);

// Computed
const maxGuestsNum = computed(() => parseInt(props.maxGuests, 10));

const minDate = computed(() => {
    return new Date().toISOString().split("T")[0];
});

const timeSlots = computed(() => {
    const slots = [];
    for (let hour = 11; hour <= 21; hour++) {
        slots.push(`${hour.toString().padStart(2, "0")}:00`);
        slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
});

// Methods
async function handleSubmit() {
    isSubmitting.value = true;
    emit("booking-submitted", { ...form.value });

    try {
        if (props.apiEndpoint) {
            const response = await fetch(props.apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form.value),
            });

            if (!response.ok) {
                throw new Error("Booking failed");
            }
        } else {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        bookingConfirmed.value = true;
        emit("booking-confirmed", { ...form.value });
    } catch (error) {
        emit("booking-error", error);
        alert("Booking failed. Please try again.");
    } finally {
        isSubmitting.value = false;
    }
}

function resetForm() {
    form.value = {
        date: "",
        time: "",
        guests: 2,
        name: "",
        email: "",
        phone: "",
        notes: "",
    };
    bookingConfirmed.value = false;
}
</script>

<style>
.booking-widget {
    --primary-color: v-bind(primaryColor);
    --primary-hover: color-mix(in srgb, var(--primary-color) 85%, black);
    --bg-color: #ffffff;
    --text-color: #1f2937;
    --border-color: #e5e7eb;
    --input-bg: #f9fafb;
    --success-color: #10b981;

    display: block;
    font-family:
        system-ui,
        -apple-system,
        sans-serif;
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.booking-widget {
    max-width: 400px;
    margin: 0 auto;
    padding: 24px;
    background: var(--bg-color);
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.widget-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: 24px;
    text-align: center;
}

.booking-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-color);
}

.form-group input,
.form-group select,
.form-group textarea {
    padding: 10px 12px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    background: var(--input-bg);
    color: var(--text-color);
    transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 20%, transparent);
}

.form-group textarea {
    resize: vertical;
    min-height: 80px;
}

.submit-btn {
    margin-top: 8px;
    padding: 12px 24px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
    background: var(--primary-hover);
}

.submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.success-message {
    text-align: center;
    padding: 24px;
}

.success-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: var(--success-color);
    color: white;
    border-radius: 50%;
    font-size: 1.5rem;
    margin-bottom: 16px;
}

.success-message h3 {
    color: var(--text-color);
    margin-bottom: 8px;
}

.success-message p {
    color: #6b7280;
    margin-bottom: 16px;
}

.new-booking-btn {
    padding: 10px 20px;
    background: transparent;
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    border-radius: 8px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
}

.new-booking-btn:hover {
    background: var(--primary-color);
    color: white;
}
</style>