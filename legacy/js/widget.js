import { LitElement, html, css, svg, keyed } from "/vendors/lit/lit-all.min.js";

import { langvars as defaultLangvars } from "./components/langvars/fr.js";
import { debugStore } from './components/helpers/debug.js';

import "./components/ui-components/theme-editor.js"
import "./components/purchase-voucher.js";
import "./components/purchase-product.js";
import "./components/book-appointment.js";
import "./components/book-table.js";
import "./components/helpers/icon-display.js";
import "./components/helpers/fade-wrapper.js";
import "./components/helpers/lottie-wrapper.js";

// Dynamic base paths based on origin check
const pageOrigin = window.location.origin;
const scriptOrigin = new URL(import.meta.url).origin;
const isSameDomain = pageOrigin === scriptOrigin;
const basePath = isSameDomain ? '/' : 'https://widget.boncado.be/';


const scriptTag = document.getElementById('bc-widget-script');
const publicKey = scriptTag?.dataset.key ?? '';

const lang = scriptTag?.dataset.lang ?? "fr";
const mode = scriptTag?.dataset.mode === 'dev' ? 'dev' : 'prod';
const boncadoAdmin = scriptTag?.dataset.bc === 'true';
const businessPage = window.location.host == 'www.boncado.be' && !boncadoAdmin;

// console.log(mode, businessPage);

// const isLocal =
//   ['localhost', '127.0.0.1'].includes(window.location.hostname) ||
//   window.location.hostname.startsWith('192.168.') ||
//   window.location.hostname === '';
const isLocal = false;

const positionMap = {
    bottom_right: 'bottom: 30px; right: 30px;',
    bottom_left: 'bottom: 30px; left: 30px'
}

const WIDGET_VERSION = '1773305804435';

class BoncadoWidget extends LitElement {
    langvars = defaultLangvars;

    static styles = css`
        :host {
            position: fixed;
            z-index: var(--z-index, 1040);
            font-family: var(--text-font);
            font-size: 0.875rem;
            overscroll-behavior: contain; 
            overflow: auto;
        }

        .bc-widget-root-element {
            filter: drop-shadow(4px 7px 9.7px rgba(0, 0, 0, 0.30));
        }

        .bc-widget-toggle {
            position: fixed;
            padding: 10px 16px;
            gap: 10px;
            /* background-color: var(--bs-primary); */
            /* border-radius: 4rem; */
            cursor: pointer;
        }

        .bc-widget-toggle .bc-logo {
            width: 55px;
            filter: drop-shadow(0px 5px 12.8px rgba(68, 104, 130, 0.25));
        }

        .bc-widget-panels-container {
            // display: none;
        }

        .bc-widget-main-menu {
            display: none;
        }

        .bc-widget-main-menu:not(.active) {
            /* display: none; */
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
        }

        .bc-widget-component:not(.active) {
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
        }

        #jsonOutput {
            pre {
                background-color: #f4f4f4;
                padding: 10px;
                border: 1px solid #ddd;
                font-family: monospace;
            }
        }
    `;

    static properties = {
        uid: { type: String },
        publicKey: { type: String },

        activeTab: { type: String },
        isMenuActive: { type: Boolean },
        bookAppointment: { type: Object },
        bookTable: { type: Object },
        purchaseVoucher: { type: Object },
        purchaseProduct: { type: Object },
        widgetBaseConfig: { type: Object },
        widgetConfig: { type: Object },
        enabledFeatures: { type: Array },
        appReady: { type: Boolean },
    };

    constructor() {
        super();

        this.publicKey = publicKey;
        this.isLocal = isLocal;
        this.positionMap = positionMap;

        this._styleTag = null;

        this.activeTab = "";
        this.isMenuActive = false;

        this.appReady = false;

        // this.langvars = langvars;
        // console.log("this.langvars", this.langvars);

        this.bookAppointment = {
            icon: "calendar",
            availableHours: [],
            settings: {
                hoursRange: { start: "08:00", end: "18:00" },
                business_hours: [],
                bookingWindow: { earliestDays: 0, latestDays: 300 },
                slotDuration: 30,
                sms: {
                    confirmation: { enabled: false, template: "" },
                    reminder: { enabled: false, template: "", daysBefore: 1, hour: 10 }
                },
                email: {
                    confirmation: { enabled: false, template: "" },
                    reminder: { enabled: false, template: "", daysBefore: 1, hour: 10 }
                },
                allowOverlappingEvents: true,
                requireDeposit: false
            },
            formData: {
                isPanelActive: false,
                viewHistory: ['category'],
                currentView: "category",
                serviceCategory: "",
                reservationDate: "",
                reservationTime: "",
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                payment_method: ""
            }
        }
        this.bookTable = {
            icon: "utensils",
            reservationCategories: [
                { value: "leisure_meal", label: this.langvars.leisure_meal },
                { value: "professional_meal", label: this.langvars.professional_meal },
                { value: "fast_meal", label: this.langvars.fast_meal },
                { value: "bday", label: this.langvars.bday },
                { value: "special_event", label: this.langvars.special_event },
                { value: "other", label: this.langvars.other },
            ],
            reservationRequests: [
                { value: "baby_chair", label: this.langvars.baby_chair },
                { value: "accessibility", label: this.langvars.accessibility },
                { value: "stroller", label: this.langvars.stroller },
                { value: "patio", label: this.langvars.patio },
                { value: "allergy_free", label: this.langvars.allergy_free },
                { value: "pet_friendly", label: this.langvars.pet_friendly },
                { value: "in_rush", label: this.langvars.in_rush },
            ],
            formData: {
                isPanelActive: false,
                availableHours: [],
                currentView: "guests-count",
                viewHistory: ['guests-count'],
                guests_count: 1,
                reservationDate: "",
                reservationTime: "00:00",
                reservationCategory: "",
                reservationRequests: [],
                reservationAdditionalRequest: "",
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                payment_method: undefined,
            }
        },
        this.purchaseVoucher = {
            icon: "gift",
            premiumAddonValue: 2.99,
            formData: {
                isPanelActive: false,
                viewHistory: [],
                currentView: undefined,
                selectedSuggestion: undefined,
                selectedVoucher: undefined,
                gift_from: "",
                gift_to: "",
                gift_reason: "",
                voucher_value: "",
                voucher_qty: 1,
                payment_method: undefined,
                delivery_first_name: "",
                delivery_last_name: "",
                delivery_address: "",
                delivery_city: "",
                delivery_pc: "",
                delivery_house_number: "",
                delivery_street: "",
                delivery_security_email: "",
                email_first_name: "",
                email_last_name: "",
                email_email: "",
                email_planify: "",
                email_security_email: "",
                deliveryOption: "email",
                payment_email: "",
                payment_first_name: "",
                payment_last_name: "",
                payment_billing_address: "",
                payment_billing_city: "",
                payment_billing_company: "",
                payment_billing_fk_countries: "",
                payment_billing_pc: "",
                payment_billing_vatNumber: "",
                get_billing_form: false,
                majoration_accepted: null,
                majoration_id: null,

            },
        }
        this.purchaseProduct = {
            icon: "bag",
            products: [],
            formData: {
                isPanelActive: false,
                currentView: "catalog",
                viewHistory: ["catalog"],
                activeProduct: {},
                cart: [],
                paymentMode: undefined,
                delivery_option: null,
                delivery_type: null,
                delivery_vendor: null,
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                street: "",
                house_number: "",
                city: "",
                postal: "",
                is_billing_same_as_shipping: true,
                billing_first_name: "",
                billing_last_name: "",
                billing_email: "",
                billing_phone: "",
                billing_street: "",
                billing_house_number: "",
                billing_city: "",
                billing_postal: ""
            }
        }

    }
    ;
    objectToFormData(obj, form = new FormData(), parentKey = null) {
        for (const key in obj) {
            const value = obj[key];
            const fieldName = parentKey ? `${parentKey}[${key}]` : key;

            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    const arrayKey = `${fieldName}[${index}]`;
                    if (typeof item === 'object' && item !== null) {
                        objectToFormData(item, form, arrayKey);
                    } else {
                        form.append(arrayKey, item);
                    }
                });
            } else if (typeof value === 'object' && value !== null) {
                objectToFormData(value, form, fieldName);
            } else if (value !== undefined) {
                form.append(fieldName, value);
            }
        }

        return form;
    }

    async connectedCallback() {
        super.connectedCallback();

        await this.initialize();

        window.addEventListener('boncado:open', (e) => {
            if (e.target === this) {
                console.log("_onOpen ok");
                this.onPanelOpen({ name: 'purchaseVoucher' })
            }
        });

        window.addEventListener('boncado-config-update', (e) => {
            if (mode !== 'dev')
                return;

            const { configUpdates } = e.detail;

            // console.log(configUpdates);

            this.widgetBaseConfig = this.mergeWithDefault(
                configUpdates,
                this.widgetBaseConfig
            );

            if (configUpdates.widget?.config?.theme) {
                const theme = configUpdates.widget.config.theme;
                this.style.setProperty(`--accent`, theme.accent);
                this.style.setProperty(`--panel-head-bg-color`, theme.panelHeadBackgroundColor);
                this.style.setProperty(`--panel-head-text-color`, theme.panelHeadTextColor);
                this.style.setProperty(`--panel-body-bg-color`, theme.panelBodyBackgroundColor);
                this.style.setProperty(`--panel-body-text-color`, theme.panelBodyTextColor);
                this.style.setProperty(`--text-font`, theme.textFont);
                this.style.setProperty(`--title-font`, theme.titleFont);
            }

            this.enabledFeatures = this.widgetBaseConfig.widget.config.enabledFeatures;

            const hasSuggestions = configUpdates.widget.config.purchaseVoucher.hasSuggestions;
            const hasLibrary = configUpdates.widget.config.purchaseVoucher.hasLibrary

            this.purchaseVoucher = {
                ...this.purchaseVoucher,
                hasLibrary: hasLibrary,
                hasSuggestions: hasSuggestions,
                formData: { ...this.purchaseVoucher.formData, currentView: hasSuggestions ? 'suggestions' : 'gift-details' }
            };



            this.requestUpdate();
            // console.log('Widget config updated:', this.widgetBaseConfig);
        });

        this.style.setProperty(`--accent`, this.widgetBaseConfig.widget.config.theme.accent);
        this.style.setProperty(`--panel-head-bg-color`, this.widgetBaseConfig.widget.config.theme.panelHeadBackgroundColor);
        this.style.setProperty(`--panel-head-text-color`, this.widgetBaseConfig.widget.config.theme.panelHeadTextColor);
        this.style.setProperty(`--panel-body-bg-color`, this.widgetBaseConfig.widget.config.theme.panelBodyBackgroundColor);
        this.style.setProperty(`--panel-body-text-color`, this.widgetBaseConfig.widget.config.theme.panelBodyTextColor);
        this.style.setProperty(`--text-font`, this.widgetBaseConfig.widget.config.theme.textFont);
        this.style.setProperty(`--title-font`, this.widgetBaseConfig.widget.config.theme.titleFont);


        console.log("2");
        // this.setUID();

        // this.getConfig();
        // this.getBusiness();
        // this.getMe();

        const zindex = scriptTag?.dataset.zindex;

        if (lang === 'en') {
            try {
                const module = await import('./components/langvars/en.js');
                this.langvars = module.langvars;
                this.requestUpdate();
            } catch (error) {
                console.error('Failed to load English language', error);
            }
        }

        if (zindex) {
            this.style.setProperty(`--z-index`, zindex);
        } else {
            console.log("default z-index");
        }

        this._styleTag = document.createElement('style');
        this._styleTag.textContent = `
            html:has(boncado-widget.has-panel-maximized), 
            body:has(boncado-widget.has-panel-maximized) {
                overflow: hidden !important;
            }
        `;
        document.head.appendChild(this._styleTag);

        this.dispatchEvent(
            new CustomEvent('boncado:connected', {
                bubbles: true,
                composed: true,
                detail: {
                    widgetBaseConfig: this.widgetBaseConfig,
                    widgetSessionConfig: this.widgetConfig,
                    purchaseVoucher: this.purchaseVoucher
                }
            })
        );
    }

    render() {
        if (!this.appReady)
            return html``;

        return html`
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300..700&display=swap" rel="stylesheet">

            <link rel="stylesheet" href="${basePath}vendors/bootstrap.imp-5.3.3/css/bootstrap.imp.min.css">
            <link rel="stylesheet" href="${basePath}css/app.css">

            <style>
                :host {
                    --bs-primary: var(--accent);
                    --bs-primary-dark: var(--accent);
                    --bs-primary-rgb: var(--primary-color-rgb);
                    --bs-primary-light: var(--accent);
                }
            </style>
            
            ${mode === "dev" && false
                ? html`
                    <div id="config-editor-container" class="p-4">
                        <h6 class="fw-bold">Purchase voucher</h6>
                        <div class="form-group">
                            <label>
                                <input class="config-setting-input" type="checkbox" .checked=${this.widgetConfig?.purchaseVoucher?.enabled} 
                                @change=${(e) => {
                        this.widgetConfig = { ...this.widgetConfig, purchaseVoucher: { ...this.purchaseVoucher, enabled: e.target.checked } }
                    }}>
                                enable
                            </label>
                        </div>

                        <div class="form-group">
                            <label>
                                <input class="config-setting-input" type="checkbox" .checked=${this.purchaseVoucher?.hasSuggestions} 
                                @change=${(e) => {
                        // let pv = this.renderRoot.querySelector("#bc-purchase-voucher-component");

                        // if (pv && typeof pv.dev_hasSuggestions == "function") {
                        //     pv.dev_hasSuggestions(e);
                        // }

                        this.renderRoot.querySelector("#bc-purchase-voucher-component").dev_hasSuggestions(e);

                        // this.purchaseVoucher = {...this.purchaseVoucher, hasSuggestions: e.target.checked, currentView: e.target.checked ? 'suggestions' : 'gift-details'}
                    }}>
                                has suggestions
                            </label>
                        </div>

                        <div class="form-group">
                            <label>
                                <input class="config-setting-input" type="checkbox" .checked=${this.purchaseVoucher?.hasLibrary} 
                                @change=${(e) => {
                        this.purchaseVoucher = { ...this.purchaseVoucher, hasLibrary: e.target.checked }
                    }}>
                                has library
                            </label>
                        </div>

                        <hr>

                        <h6 class="fw-bold">Book Appointment</h6> 

                        <div class="form-group">
                            <label>
                                <input class="config-setting-input" type="checkbox" .checked=${this.widgetConfig?.bookAppointment?.enabled} 
                                @change=${(e) => {
                        this.widgetConfig = { ...this.widgetConfig, bookAppointment: { ...this.bookAppointment, enabled: e.target.checked } }
                    }}>
                                enable
                            </label>
                        </div>

                        <div class="form-group">
                            <label>
                                <input class="config-setting-input" type="checkbox" .checked=${this.widgetConfig?.bookAppointment?.services.length > 1} 
                                @change=${(e) => {
                        let ba = this.renderRoot.querySelector("#bc-book-appointment-component");

                        if (ba && typeof ba.devHandleHasMultipleServices == "function") {
                            ba.devHandleHasMultipleServices(e);
                        }
                    }}>
                                multiple services
                            </label>
                        </div>

                        <div class="form-group">
                            <label>
                                <input class="config-setting-input" type="checkbox" .checked=${this.widgetConfig?.bookAppointment.services.every(s => s.deposit_required)} 
                                @change=${(e) => {
                        // console.log(e.target.checked);
                        if (e.target.checked) {
                            this.bookAppointment = { ...this.bookAppointment, services: this.bookAppointment.services.map(s => ({ ...s, deposit_required: true })) }
                        } else {
                            this.bookAppointment = { ...this.bookAppointment, services: this.bookAppointment.services.map(s => ({ ...s, deposit_required: false })) }
                        }
                    }}>
                                deposit required
                            </label>
                        </div>

                        <hr>

                        <h6 class="fw-bold">Book Table</h6> 

                        <div class="form-group">
                            <label>
                                <input class="config-setting-input" type="checkbox" .checked=${this.widgetConfig?.bookTable?.enabled} 
                                @change=${(e) => {
                        this.widgetConfig = { ...this.widgetConfig, bookTable: { ...this.bookTable, enabled: e.target.checked } }
                    }}>
                                enable
                            </label>
                        </div>

                        <div class="form-group">
                            <label>
                                <input type="checkbox" .checked=${this.bookTable?.deposit_required} 
                                @change=${(e) => {
                        this.bookTable = { ...this.bookTable, deposit_required: e.target.checked }
                    }}>
                                deposit required
                            </label>
                        </div>

                        <hr>

                        <h6 class="fw-bold">Purchase Product</h6> 

                        <div class="form-group">
                            <label>
                                <input class="config-setting-input" type="checkbox" .checked=${this.widgetConfig?.purchaseProduct?.enabled} 
                                @change=${(e) => {
                        this.widgetConfig = { ...this.widgetConfig, purchaseProduct: { ...this.purchaseProduct, enabled: e.target.checked } }
                    }}>
                                enable
                            </label>
                        </div>

                        <hr>

                        <!-- <h6 class="fw-bold">Theme</h6>  -->

                        <!-- <theme-editor
                            .theme=${this.widgetBaseConfig.widget.config?.theme}
                            @theme-changed=${(e) => {
                        this.widgetBaseConfig = {
                            ...this.widgetBaseConfig,
                            widget: {
                                ...this.widgetBaseConfig.widget,
                                config: {
                                    ...this.widgetBaseConfig.widget.config,
                                    theme: e.detail.theme
                                }
                            }
                        };
                    }}
                            >
                        </theme-editor> -->
                    </div>
                `
                : html`
                    <!-- <theme-editor mode="prod" .theme=${this.widgetConfig?.theme} @theme-changed=${e => this.widgetConfig = { ...this.widgetConfig, theme: e.detail.theme }}></theme-editor> -->
                `
            }
            
            ${this.enabledFeatures?.length === 1
                ? html`
                    <div 
                        @click="${(e) => this.onPanelOpen({ name: this.enabledFeatures[0] })}" 
                        style="
                            ${this.positionMap[this.widgetBaseConfig.widget.config.theme.position]}; 
                            background-color: ${this.widgetBaseConfig.widget.config.theme.accent};
                            color: ${this.widgetBaseConfig.widget.config.theme.btnTextColor};
                            border-radius: ${this.widgetBaseConfig.widget.config.theme.btnBorderRadius};
                            filter: drop-shadow(${this.widgetBaseConfig.widget.config.theme.shadowX} 
                            ${this.widgetBaseConfig.widget.config.theme.shadowY} 
                            ${this.widgetBaseConfig.widget.config.theme.shadowBlur} rgba(0, 0, 0, 0.30));
                        "
                        class="${this.widgetBaseConfig.widget.config.theme.position} bc-widget-toggle bc-widget-root-element gap-0 d-flex align-items-center">
                        
                        <icon-display .icon=${this[this.enabledFeatures[0]].icon} size="20px" color=${this.widgetBaseConfig.widget.config.theme.btnTextColor}></icon-display>
                        <span class="toggle-label fw-7 fw-bold p-2">${this.langvars[this[this.enabledFeatures[0]].name]}</span>
                    </div>
                `
                : html`
                    <div class="${this.isMenuActive ? "active" : ""} ${this.widgetBaseConfig?.widget?.config?.theme?.position} bc-widget-main-menu bc-widget-root-element">
                        <div class="menu-header fw-bold">${this.langvars.i_would_like}</div>
                        <ul class="menu-nav nav flex-column">
                            ${this.enabledFeatures?.length == 0
                        ? html`
                                    <div class="py-3 px-4 fw-medium">${this.langvars.no_subscription}</div>
                                `
                        : null
                    }

                            ${this.enabledFeatures.includes("purchaseVoucher")
                        ? html`
                                    <li class="nav-item cursor-pointer">
                                        <span @click="${(e) => this.onPanelOpen({ name: 'purchaseVoucher' })}" class="nav-link fw-bold lh-sm">
                                            <icon-display icon="gift" size="20px"></icon-display>
                                            ${this.langvars.buy_voucher}
                                        </span>
                                    </li>
                                `
                        : null
                    }

                            ${this.enabledFeatures.includes("bookAppointment")
                        ? html`
                                    <li class="nav-item cursor-pointer">
                                        <span @click="${(e) => this.onPanelOpen({ name: 'bookAppointment' })}" class="nav-link fw-bold">
                                            <icon-display icon="calendar" size="20px"></icon-display>
                                            ${this.langvars.book_appointment}
                                        </span>
                                    </li>
                                `
                        : null
                    }

                            ${this.enabledFeatures.includes("bookTable")
                        ? html`
                                    <li class="nav-item cursor-pointer">
                                        <span @click="${(e) => this.onPanelOpen({ name: 'bookTable' })}" class="nav-link fw-bold">
                                            <icon-display icon="utensils" size="20px"></icon-display>    
                                            ${this.langvars.book_table}
                                        </span>
                                    </li>
                                `
                        : null
                    }

                            ${this.enabledFeatures.includes("purchaseProduct")
                        ? html`
                                    <li class="nav-item cursor-pointer">
                                        <span @click="${(e) => this.onPanelOpen({ name: 'purchaseProduct' })}" class="nav-link fw-bold">
                                            <icon-display icon="bag" size="20px"></icon-display>    
                                            ${this.langvars.purchase_products}
                                        </span>
                                    </li>
                                `
                        : null
                    }
                        </ul>
                    </div>

                    <div 
                        @click="${this.toggleMenu}"
                        class="${this.widgetBaseConfig?.widget?.config?.theme?.position} bc-widget-toggle bc-widget-root-element d-flex align-items-center"
                        style="
                            ${this.positionMap[this.widgetBaseConfig.widget.config.theme.position]}; 
                            background-color: ${this.widgetBaseConfig.widget.config.theme.accent};
                            color: ${this.widgetBaseConfig.widget.config.theme.btnTextColor};
                            border-radius: ${this.widgetBaseConfig.widget.config.theme.btnBorderRadius};
                            filter: drop-shadow(${this.widgetBaseConfig.widget.config.theme.shadowX} 
                            ${this.widgetBaseConfig.widget.config.theme.shadowY} 
                            ${this.widgetBaseConfig.widget.config.theme.shadowBlur} rgba(0, 0, 0, 0.30));
                        ">
                        <span class="toggle-label fw-7 fw-bold p-2">${this.langvars.i_would_like}</span>
                    </div>
                `
            } 
            
            
            ${this.enabledFeatures.includes("purchaseVoucher")
                ? html`
                    <purchase-voucher-component 
                        .purchaseVoucher="${this.purchaseVoucher}"
                        .langvars="${this.langvars}"
                        .lang=${lang}
                        .publicKey=${this.publicKey}
                        .uid=${this.uid}
                        .isLocal=${this.isLocal}
                        .mode=${mode}
                        @update-state="${this.handleUpdateState}" 
                        @panel-closed="${(e) => this.onPanelClosed(e)}"
                        @panel-window-toggle="${(e) => this.onPanelWindowToggle(e)}"
                        id="bc-purchase-voucher-component"
                        class="${this.purchaseVoucher?.formData?.isPanelActive ? 'active' : ''} ${this.widgetBaseConfig.widget.config.theme.position} bc-widget-component">
                    </purchase-voucher-component>
                `
                : null
            }

            ${this.enabledFeatures.includes("bookAppointment")
                ? html`
                    <book-appointment 
                        .bookAppointment="${this.bookAppointment}"
                        .langvars="${this.langvars}"
                        .lang=${lang}
                        .publicKey=${this.publicKey}
                        .uid=${this.uid}
                        .isLocal=${this.isLocal}
                        .mode=${mode}
                        @update-state="${this.handleUpdateState}" 
                        @panel-closed="${(e) => this.onPanelClosed(e)}"
                        @panel-window-toggle="${(e) => this.onPanelWindowToggle(e)}"
                        id="bc-book-appointment-component"
                        class="${this.bookAppointment?.formData?.isPanelActive ? 'active' : ''} ${this.widgetBaseConfig.widget.config.theme.position} bc-widget-component">
                    </book-appointment>
                `
                : null
            }

            ${this.enabledFeatures.includes("bookTable")
                ? html`
                    <book-table 
                        .bookTable="${this.bookTable}"
                        .langvars="${this.langvars}"
                        .lang=${lang}
                        .publicKey=${this.publicKey}
                        .uid=${this.uid}
                        .isLocal=${this.isLocal}
                        .mode=${mode}
                        @update-state="${this.handleUpdateState}" 
                        @panel-closed="${(e) => this.onPanelClosed(e)}"
                        @panel-window-toggle="${(e) => this.onPanelWindowToggle(e)}"
                        class="${this.bookTable?.formData?.isPanelActive ? 'active' : ''} ${this.widgetBaseConfig.widget.config.theme.position} bc-widget-component">
                    </book-table>
                `
                : null
            }

            ${this.enabledFeatures.includes("purchaseProduct")
                ? html`
                    <purchase-product-component 
                        .purchaseProduct="${this.purchaseProduct}"
                        .langvars="${this.langvars}"
                        .lang=${lang}
                        .publicKey=${this.publicKey}
                        .uid=${this.uid}
                        .isLocal=${this.isLocal}
                        .mode=${mode}
                        @update-state="${this.handleUpdateState}" 
                        @panel-closed="${(e) => this.onPanelClosed(e)}"
                        @panel-window-toggle="${(e) => this.onPanelWindowToggle(e)}"
                        id="bc-purchase-product-component"
                        class="${this.purchaseProduct?.formData?.isPanelActive ? 'active' : ''} ${this.widgetBaseConfig.widget.config.theme.position} bc-widget-component">
                    </purchase-product-component>
                    `
                : null
            }
            
        `
    }
    ;
    firstUpdated() {
        this.renderRoot.addEventListener("change", (event) => {
            if (event.target.closest(".config-setting-input")) {
                this.enabledFeatures = Object.keys(this.widgetConfig).filter(key => this.widgetConfig[key].enabled);
            }
        })

        this.renderRoot.addEventListener("click", (event) => {
            if (event.target.closest(".mouse-scroll-indicator")) {
                const scroll = this.renderRoot.querySelector(".panel-scroll-area");
                console.log(scroll);
                scroll.scrollBy({
                    top: 100,
                    left: 0,
                    behavior: 'smooth'
                })
            }
        })

        // console.log(this.positionMap);
    }

    updated(changedProps) {

    }

    async initialize() {
        this.uid = this.setUID();
        await this.getConfig();
    }

    setUID() {
        const BASE_KEY = '_b83cda91';
        const sessionKey = `${BASE_KEY}_${this.publicKey}`;

        const stored = JSON.parse(localStorage.getItem(sessionKey) || '{}');

        // Reset if version changed for THIS account
        if (stored.version !== WIDGET_VERSION) {
            console.log(`Boncado [${this.publicKey}]: version changed (${stored.version} → ${WIDGET_VERSION}), session reset`);

            const newSession = {
                uid: crypto.randomUUID(),
                version: WIDGET_VERSION
            };

            localStorage.setItem(sessionKey, JSON.stringify(newSession));
            return newSession.uid;
        }

        return stored.uid;
    }

    async getConfig() {
        const data = {
            action: "getMe",
            uid: this.uid,
            pk: this.publicKey,
            mode
        };

        const params = new URLSearchParams(data);

        const url = this.isLocal ? '/mock-data/getMe.json' : basePath + 'calls.php';
        const fetchOptions = this.isLocal
            ? {}
            : {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params
            };

        try {
            const response = await fetch(url, fetchOptions);
            const config = await response.json();
            // console.log("getMe",config);

            this.widgetBaseConfig = config.endpoint;
            this.widgetConfig = config.session;

            if (!this.widgetBaseConfig.widget.config) {
                this.widgetBaseConfig.widget.config = {
                    unlabellized: "0",
                    enabledFeatures: [],
                    theme: {
                        accent: "#6fc2b1",
                        btnTextColor: "#fff",
                        panelHeadBackgroundColor: "#282828",
                        panelHeadTextColor: "#fff",
                        panelBodyBackgroundColor: "#fff",
                        panelBodyTextColor: "#333",
                        btnBorderRadius: "10px",
                        shadowY: "10px",
                        shadowX: "10px",
                        shadowBlur: "13px",
                        position: "bottom_right",
                        textFont: "Nunito, sans-serif",
                        titleFont: "Rubik, sans-serif",
                    }
                }
            }


            if (!this.widgetBaseConfig.widget.config.enabledFeatures) {
                this.widgetBaseConfig.widget.config = this.normalizeWidgetProps(this.widgetBaseConfig.widget.config);
            }

            // console.log(config.endpoint.widget.bookAppointment);

            this.widgetConfig.bookAppointment = { ...config.session.bookAppointment, ...config?.endpoint?.widget?.bookAppointment };
            this.widgetConfig.bookTable = { ...config.session.bookTable, ...config?.endpoint?.widget?.bookTable };
            this.widgetConfig.purchaseVoucher = { ...config.session.purchaseVoucher, ...config?.endpoint?.widget?.purchaseVoucher };
            this.widgetConfig.purchaseProduct = { ...config.session.purchaseProduct, ...config?.endpoint?.widget?.purchaseProduct };

            // console.log(this.widgetConfig.bookAppointment);

            this.enabledFeatures = [...this.widgetBaseConfig.widget.config.enabledFeatures];

            if (mode !== 'dev' && businessPage) {
                if (!this.enabledFeatures.includes('purchaseVoucher')) {
                    console.log("set module");
                    this.enabledFeatures = [...this.enabledFeatures, 'purchaseVoucher'];
                }
            }

            this.initBookAppointment(this.widgetConfig?.bookAppointment);
            this.initBookTable(this.widgetConfig?.bookTable);
            this.initPurchaseProduct(this.widgetConfig?.purchaseProduct);


            this.initPurchaseVoucher(this.widgetConfig?.purchaseVoucher);

            if (this.hasActivePanel) {
                this.isMenuActive = true;
            }

            console.log("1");

            debugStore('widgetConfig', this.widgetConfig);

            this.appReady = true;

        } catch (error) {
            console.error("Error fetching getMe data:", error);
        }
    }

    async getBusiness() {
        const data = {
            action: "getBusiness",
            uid: this.uid,
            pk: this.publicKey,
        };

        const params = new URLSearchParams(data);

        try {
            const response = await fetch(basePath + "calls.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params
            });

            const result = await response.json();
            this.isLocal && console.log(result);
        } catch (error) {
            console.error("Error fetching business data:", error);
        }
    }

    async updateData(payload) {
        // don't update on dev mode
        if (mode == 'dev') {
            return;
        }

        debugStore("to-send", payload);

        const { context, formData } = payload;
        const data = {
            action: "updateData",
            context: context,
            formData: JSON.stringify(formData),
            uid: this.uid,
            pk: this.publicKey
        };

        const params = new URLSearchParams(data);

        const url = this.isLocal ? '/mock-data/updateData.json' : basePath + 'calls.php';
        const fetchOptions = this.isLocal
            ? {}
            : {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params
            };

        try {
            const response = await fetch(url, fetchOptions);

            const result = await response.json();
            // console.log(result);
        } catch (error) {
            console.error("Error:", error);
        }
    }

    get hasActivePanel() {
        return this.enabledFeatures?.some(key => this[key]?.formData?.isPanelActive == true);
    }

    normalizeWidgetProps(payload) {
        let enabledFeatures = [];

        if (this.widgetBaseConfig.widget.purchaseVoucher.isSubscribed) {
            enabledFeatures.push("purchaseVoucher");
        }

        return {
            unlabellized: payload.unlabellized,
            enabledFeatures: enabledFeatures,
            theme: {
                accent: payload.backgroundColor,
                btnTextColor: payload.color,
                panelHeadBackgroundColor: "#282828",
                panelHeadTextColor: "#ffff",
                panelBodyBackgroundColor: "#fff",
                panelBodyTextColor: "#333",
                btnBorderRadius: payload.borderRadius,
                shadowY: payload.boxShadowY,
                shadowX: payload.boxShadowX,
                shadowBlur: payload.boxShadowBlur,
                position: payload.position,
                textFont: payload.textFont ? payload.textFont : "Quicksand, sans-serif",
                titleFont: payload.titleFont ? payload.titleFont : "Rubik, sans-serif",
            },
        };
    }

    mergeWithDefault(existing, defaultObj) {
        // Guard clauses
        if (defaultObj === null || defaultObj === undefined) {
            return existing;
        }
        if (existing === null || existing === undefined) {
            return JSON.parse(JSON.stringify(defaultObj));
        }

        // Handle non-object types
        if (typeof existing !== 'object' || typeof defaultObj !== 'object') {
            return existing;
        }

        // Handle special types
        if (defaultObj instanceof Date) {
            return existing instanceof Date ? existing : new Date(existing);
        }

        // Create a deep copy of default object
        const result = JSON.parse(JSON.stringify(defaultObj));

        // Track processed objects to prevent circular references
        const processed = new WeakMap();

        function merge(existing, template) {
            if (processed.has(existing)) {
                return processed.get(existing);
            }

            const merged = Array.isArray(template) ? [] : {};
            processed.set(existing, merged);

            // Handle arrays
            if (Array.isArray(template)) {
                if (Array.isArray(existing)) {
                    const defaultItem = template[0] || {};
                    return existing.map(item =>
                        typeof item === 'object' && item !== null
                            ? merge(item, defaultItem)
                            : item
                    );
                }
                return template;
            }

            // Handle objects
            for (const key in template) {
                if (template.hasOwnProperty(key)) {
                    if (existing.hasOwnProperty(key)) {
                        if (typeof template[key] === 'object' && template[key] !== null &&
                            typeof existing[key] === 'object' && existing[key] !== null) {
                            merged[key] = merge(existing[key], template[key]);
                        } else {
                            merged[key] = existing[key];
                        }
                    } else {
                        merged[key] = template[key];
                    }
                }
            }

            // Copy additional properties from existing that aren't in template
            for (const key in existing) {
                if (existing.hasOwnProperty(key) && !template.hasOwnProperty(key)) {
                    merged[key] = existing[key];
                }
            }

            return merged;
        }

        return merge(existing, result);
    }

    onPanelClosed(e) {
        this[e.detail.name] = { ...this[e.detail.name], formData: { ...this[e.detail.name].formData, isPanelActive: false } }
        this.classList.remove("has-panel-maximized");

        this.updateData({
            context: e.detail.name,
            formData: this[e.detail.name].formData
        })
    }

    onPanelOpen(payload) {
        this[payload.name] = { ...this[payload.name], formData: { ...this[payload.name].formData, isPanelActive: true } }

        this.updateData({
            context: payload.name,
            formData: this[payload.name].formData
        })
    }

    onPanelWindowToggle(e) {
        this.classList.toggle("has-panel-maximized", e.detail.isPanelMaximized);
        // console.log(e.detail)
    }

    initPurchaseVoucher(config) {
        this.purchaseVoucher = this.mergeWithDefault(config, this.purchaseVoucher);

        this.purchaseVoucher = {
            ...this.purchaseVoucher,
            hasSuggestions: (this.widgetBaseConfig?.widget?.config?.purchaseVoucher?.hasSuggestions && this.widgetBaseConfig?.widget?.purchaseVoucher?.suggestions?.length > 0)
        }
    }

    initPurchaseProduct(config) {
        this.purchaseProduct = this.mergeWithDefault(config, this.purchaseProduct);
        // console.log(this.purchaseProduct);
    }

    initBookAppointment(config) {
        this.bookAppointment = this.mergeWithDefault(config, this.bookAppointment);
    }

    initBookTable(config) {
        this.bookTable = this.mergeWithDefault(config, this.bookTable);
        // console.log(this.bookTable);
    }

    toggleMenu() {
        this.isMenuActive = !this.isMenuActive;
    }

    handleUpdateState(event) {
        this[event.detail.name] = event.detail.data;
        // console.log(this[event.detail.name])

        // console.log(this[event.detail.name].formData);

        // this.devFormatJSON(event.detail.data);

        this.updateData({
            context: event.detail.name,
            formData: this[event.detail.name].formData
        });
    }

    devFormatJSON(data) {
        const jsonOutput = this.renderRoot.getElementById('jsonOutput');
        const formattedJSON = JSON.stringify(data, null, 4);  // Indent with 4 spaces
        jsonOutput.textContent = formattedJSON;
    }
}

customElements.define("boncado-widget", BoncadoWidget);

// self-mount safely
customElements.whenDefined('boncado-widget').then(() => {
    if (!document.querySelector('boncado-widget')) {
        document.body.appendChild(document.createElement('boncado-widget'));
    }
});