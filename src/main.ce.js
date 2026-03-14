import { defineCustomElement } from "vue";
import TableBooking from "./components/TableBooking.vue";

// Convert Vue component to custom element
const TableBookingElement = defineCustomElement(TableBooking);

// Register the custom element
customElements.define("table-booking-widget", TableBookingElement);

// Export for manual registration if needed
export { TableBookingElement };

// self-mount safely
customElements.whenDefined('table-booking-widget').then(() => {
    if (!document.querySelector('table-booking-widget')) {
        document.body.appendChild(document.createElement('table-booking-widget'));
    }
});