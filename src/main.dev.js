import { createApp } from "vue";
import TableBooking from "./components/TableBooking.vue";

const app = createApp(TableBooking, {
  // Default dev props — adjust as needed
  title: "Reserve a Table",
  maxGuests: 10,
  apiEndpoint: "",
  primaryColor: "#2563eb",
});

app.mount("#app");