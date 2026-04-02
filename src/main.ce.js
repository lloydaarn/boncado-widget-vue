import { defineCustomElement } from "vue";
import BoncadoWidget from "./components/BoncadoWidget.vue";

// Convert Vue component to custom element
const BoncadoWidgetElement = defineCustomElement(BoncadoWidget);

// Register the custom element
customElements.define("boncado-widget", BoncadoWidgetElement);

// Export for manual registration if needed
export { BoncadoWidgetElement };

// self-mount safely
customElements.whenDefined('boncado-widget').then(() => {
    if (!document.querySelector('boncado-widget')) {
        document.body.appendChild(document.createElement('boncado-widget'));
    }
});