import { LitElement, html, css, keyed, unsafeHTML } from "/vendors/lit/lit-all.min.js";
import { BcDialog } from "../components/helpers/dialog.js";


import "../components/purchase-product.product-view.js";

const pageOrigin = window.location.origin;
const scriptOrigin = new URL(import.meta.url).origin;

const isSameDomain = pageOrigin === scriptOrigin;

// Dynamic base paths based on origin check
const basePath = isSameDomain ? './' : 'https://widget.boncado.be/';

class purchaseProductComponent extends LitElement {
    _verifyInterval = null;

    static shadowRootOptions = { mode: 'open', delegatesFocus: true };

    static properties = {
        purchaseProduct: { type: Object },
        langvars: { type: Object },
        lang: { type: String },
        isPanelMaximized: {type: Boolean},
        catalog: { type: Array },
        selectedCategory: { type: Object },
        activeProduct: { type: Object },
        cartSelectAll: { type: Boolean },
        feature: { type: Object },
        featureReady: { type: Boolean }
    }

    constructor() {
        super();

        this.isPanelMaximized = false;
        this.catalog = [];
        this.selectedCategory = null;
        this.activeProduct = {}
        this.cartSelectAll = false;

        this.show = true;
        this.featureReady = false;
    }

    // This disables Shadow DOM
    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback();

        this.purchaseProduct = {...this.purchaseProduct, product: []}
        // this.purchaseProduct.products = []
        
        this.purchaseProduct = {
            ...this.purchaseProduct, 
            formData: {
                ...this.purchaseProduct.formData,
                activeProduct: this.purchaseProduct.formData.activeProduct ? this.purchaseProduct.formData.activeProduct : {}
            }
        }


        this.initialize();

        switch (this.purchaseProduct.formData.currentView) {
            case 'payment-in-progress':
                this._verifyInterval = setInterval(() => this._pollVerify(), 3000);

                break;
            case 'checkout': 
                this.getDeliveryOptions();

                break;
            default:
                break;
        }

        
        // if (this.purchaseProduct.formData.currentView == "product") {
        //     this.navigate({view: "catalog"})
        // }

    }

    async initialize() {
        await this.getProducts();

        this.featureReady = true;

        setTimeout(() => {
            const scrollArea = this.renderRoot.querySelector(".panel-scroll-area");
            const indicator = this.renderRoot.querySelector(".mouse-scroll-indicator");

            if (!scrollArea || !indicator) return;

            // Auto-hide/show indicator based on content size
            const ro = new ResizeObserver(() => {
                const hasScroll = scrollArea.scrollHeight > scrollArea.clientHeight;
                const isAtEnd = scrollArea.scrollTop + scrollArea.clientHeight >= scrollArea.scrollHeight - 10;
                indicator.classList.toggle("hidden", !hasScroll || isAtEnd);
            });
            ro.observe(scrollArea);

            // Hide when scrolled to bottom
            scrollArea.addEventListener("scroll", () => {
                const isAtEnd =
                    scrollArea.scrollTop +
                    scrollArea.clientHeight >=
                    scrollArea.scrollHeight - 10;
                indicator.classList.toggle("hidden", isAtEnd);
            });
        }, 1000);

        // console.log("ready");
    }

    get filteredProducts() {
      // if nothing selected, show all
      if (!this.selectedCategory) return this.purchaseProduct.products;
      return this.purchaseProduct.products.filter(p => p.categories.includes(this.selectedCategory));
    }

    get categories() {
        const all = this.purchaseProduct?.products?.flatMap(p => p.categories || []);
        return [...new Set(all)].sort();
    }

    get isAllProductsSelected() {
        const cart = this.purchaseProduct.formData?.cart || [];
        return cart.length > 0 && cart.every(p => p.isSelected);
    }

    stopPolling() {
        if (this._verifyInterval) {
            clearInterval(this._verifyInterval);
            this._verifyInterval = null;
        }
    }

    async _pollVerify() {
        try {
            const result = await this.verifyCheckout();
            
            if (result.endpoint?.code === 2) {
                this._verifyAttempts = (this._verifyAttempts || 0) + 1;
                // 10 seconds / 3 second interval / 3-4 attempts
                if (this._verifyAttempts >= 4) {
                    this.stopPolling();
                    this._verifyAttempts = 0;
                    this.navigate({view: "checkout"});
                }
            }
        } catch (err) {
            console.error('verifyCheckout error:', err);
            this.stopPolling();
            this.navigate({view: "error"});
        }
    }

    async verifyCheckout() {
        const data = {
            action: "verifyCheckout",
            uid: this.uid,
            pk: this.publicKey,
            context: "purchaseProduct",
            transaction: this.purchaseProduct.formData.transaction || "",
        };

        const params = new URLSearchParams(data);

        const url = this.isLocal ? '/mock-data/checkout-success.json' : basePath+'calls.php';
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

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const result = await response.json();

            if (result.endpoint?.code == 1) {
                this.navigate({view: "success"});
                
            } else if (result.endpoint?.code == -1) {
                this.navigate({view: "error"})
            }
            
            return result; 
            
        } catch (error) {
            console.error("Error order:", error);

            if (this.mode == "dev") {
                console.log("fallback dev");
                let response = await fetch('/mock-data/checkout-success.json');
                let result = await response.json();

                if (result.code == 1) {
                    this.navigate({view: "success"});
                } else if (result.code == -1) {
                    this.navigate({view: "error"})
                }

                return result; 
            }
        }
    }

    async getCheckout() {
        const data = {
            action: "getCheckout",
            uid: this.uid,
            pk: this.publicKey,
            context: "purchaseProduct",
            formData:  JSON.stringify(this.purchaseProduct.formData),
            url: window.location.href
        };

        this.isLocal && console.log(data);
        const params = new URLSearchParams(data);

        const url = this.isLocal ? '/mock-data/getCheckout.json' : basePath+'calls.php';
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
            
            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }
            
            const result = await response.json();
            
            // Store transaction ID for verifyCheckout
            if (result.endpoint?.transaction) {
                this.purchaseProduct.formData.transaction = result.endpoint.transaction;
                this.handleUpdateState();
            }

            const checkoutUrl = result.endpoint?.url;
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            } else {
                BcDialog.alert("No checkout URL received!", null, { host: this });
                console.error("No checkout URL received:", result);
            }
            
        } catch (error) {
            console.error("Error:", error);

            if (this.mode == "dev") {
                console.log("fallback dev");
                let response = await fetch('/mock-data/getCheckout.json');
                let result = await response.json();

                
                const checkoutUrl = result.endpoint?.url;
                if (checkoutUrl) {
                    window.location.href = checkoutUrl;
                } else {
                    console.error("No checkout URL received:", result);
                }
            }
        }
    }

    reset() {
        this.purchaseProduct = {
            ...this.purchaseProduct,
            formData: {
                isPanelActive: true,
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

        this.handleUpdateState();
    }

    async getProducts() {
        const data = {
            action: "getProducts",
            uid: this.uid,
            pk: this.publicKey,
        };
      
        const params = new URLSearchParams(data);

        const url = this.isLocal ? '/mock-data/getProducts.json' : basePath+'calls.php';
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
            
            // this.isLocal && console.log(result);

            this.purchaseProduct = {...this.purchaseProduct, products: result?.endpoint?.products || []}

            this.handleUpdateState();

            // console.log(this.purchaseProduct.products);
            // console.log(this.filteredProducts);
        } catch (error) {
            console.error("Error fetching business data:", error);
        }
    }

    async getDeliveryOptions() {
        const form = this.purchaseProduct.formData;
        const cart = (form.cart || []).map(item => ({
            id: item.id,
            qty: item.selected_qty,
            selections: item.selections || {}
        }));

        const address = {
            first_name: form.first_name,
            last_name: form.last_name,
            street: form.street,
            house_number: form.house_number,
            city: form.city,
            postal: form.postal,
        };

        const data = {
            action: "getDeliveryOptions",
            uid: this.uid,
            pk: this.publicKey,
            context: "purchaseProduct",
            cart: JSON.stringify(cart),
            address: JSON.stringify(address)
        };

        const params = new URLSearchParams(data);

        const url = this.isLocal ? '/mock-data/getDeliveryOptions.json' : basePath + 'calls.php';
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

            if (!response.ok) {
                throw new Error(`Server responded with status ${response.status}`);
            }

            const result = await response.json();
            
            const raw = result?.endpoint?.deliveryOptions;
            const options = Array.isArray(raw)
                ? raw
                : (typeof raw === 'string' ? JSON.parse(raw) : []);

            this.purchaseProduct = {
                ...this.purchaseProduct,
                deliveryOptions: options
            };

            // Default to first option if current selection isn't in new options
            const validKeys = options.map(o => o.vendor ? `${o.type}::${o.vendor}` : o.type);
            if (!validKeys.includes(this.purchaseProduct.formData.delivery_option)) {
                const first = options[0];
                this.onDeliveryOptionChange(first || { type: 'standard' });
            }

            this.handleUpdateState();
            this.requestUpdate();

        } catch (error) {
            console.error("Error fetching delivery options:", error);
        }
    }

    // render
    render() {
        
        if (!this.featureReady) return html ``;

        // Dynamic variation helpers
        const activeP     = this.purchaseProduct.formData.activeProduct || {};
        const options      = Array.isArray(activeP.options) ? activeP.options : [];
        const combos       = Array.isArray(activeP.available_combinations) ? activeP.available_combinations : [];
        const selections   = activeP.selections || {};
        const lastTouched  = this.lastTouched;

        // Check if a value for a given option is disabled based on cross-filtering
        const isOptionValueDisabled = (optionName, value) => {
            if (combos.length === 0) return false;
            // Only disable if another option was last touched
            if (lastTouched === optionName) return false;

            // Get all OTHER currently selected options (excluding the one being checked)
            const otherSelections = Object.entries(selections)
                .filter(([key, val]) => key !== optionName && val != null);

            if (otherSelections.length === 0) return false;

            // Check if any combo matches this value + all other current selections
            return !combos.some(combo =>
                combo[optionName] === value &&
                otherSelections.every(([key, val]) => combo[key] === val)
            );
        };

        const isColorOption  = (name) => name === 'color';
        const getOptionLabel = (name) => this.langvars?.[name] || name.charAt(0).toUpperCase() + name.slice(1);

        // Normalize option value — color values can be { label, hex } objects or plain strings
        const getValKey   = (val) => typeof val === 'object' && val !== null ? val.label : val;
        const getValHex   = (val) => typeof val === 'object' && val !== null ? val.hex : val;
        const getValLabel = (val) => typeof val === 'object' && val !== null ? val.label : val;

        return html`
            <div class="${this.isPanelMaximized ? 'panel-maximize': ''} purchase-product-screen bc-widget-screen d-flex flex-column">
                <div class="panel-top-bar">
                    <div class="panel-actions d-flex align-items-center p-3">
                        ${!["catalog", "success"].includes(this.purchaseProduct.formData.currentView)
                            ? html`
                                <div @click=${(e) => this.navigate({direction: 'back'})}
                                    class="p-1 cursor-pointer">
                                    <icon-display icon="long-arrow-left" color="#fff" size="20px"></icon-display>
                                </div>
                            ` 
                            : null
                        }

                        <div class="ms-auto d-flex gap-3 align-items-center">
                            <div class="btn-panel-window-toggle d-none d-sm-block">
                                ${this.isPanelMaximized 
                                ? html`
                                    <icon-display icon="minimize" size="20px" color="#fff"></icon-display>
                                    
                                `
                                :html`
                                    <icon-display icon="maximize" size="18px" color="#fff"></icon-display>
                                `
                            }
                            </div>

                            <div @click="${this.handleClosePanel}" class="btn-panel-close">
                                <icon-display icon="times" size="20px"></icon-display>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="panel-scroll-area">
                    <div class="panel-head">
                        <div class="panel-head-inner pb-4">
                            ${keyed(this.purchaseProduct.formData.currentView, html`
                                <fade-wrapper type="fade-in">
                                    ${this.purchaseProduct.formData.currentView == 'catalog' || this.purchaseProduct.formData.currentView == 'product'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">
                                                    ${unsafeHTML(this.langvars.uncover_hidden_gems)}
                                                </h4>
                                            </div>
                                        ` 
                                        : null
                                    }

                                    ${this.purchaseProduct.formData.currentView == 'cart'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">
                                                    ${this.langvars.your_cart_awaits}
                                                </h4>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseProduct.formData.currentView == 'personal-info'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">
                                                    ${this.langvars.quick_details}
                                                </h4>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseProduct.formData.currentView == 'checkout' 
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">
                                                    ${this.langvars.checkout}
                                                </h4>
                                            </div>
                                        ` 
                                        : null
                                    }

                                    ${this.purchaseProduct.formData.currentView == 'payment-in-progress'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${this.langvars.payment_confirmation}</h4>
                                                
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseProduct.formData.currentView == 'error'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${this.langvars.error}</h4>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseProduct.formData.currentView == 'success'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${this.langvars.success}</h4>
                                            </div>
                                            `
                                        : null
                                    }
                                </fade-wrapper>
                            `)}
                        </div>
                    </div>

                    <div class="panel-body col">
                        <div class="panel-body-inner d-flex flex-column h-100 position-relative">
                            ${keyed(this.purchaseProduct.formData.currentView, html`
                                <fade-wrapper type="fade-in">
                                    ${this.purchaseProduct.formData.currentView == 'catalog' ||  this.purchaseProduct.formData.currentView == 'product'
                                        ? html`
                                            <div class="d-flex px-4 px-sm-5 pt-4">
                                                <div @click=${(e) => this.navigate({view: 'cart'})} class="cart-toggle d-inline-flex cursor-pointer ms-auto">
                                                    <icon-display icon="bag" size="20px"></icon-display>        
                                                    <span class="cart-qty">${this.purchaseProduct.formData.cart.length}</span>
                                                </div>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseProduct.formData.currentView == 'catalog' 
                                        ? html`
                                            <div class="pb-5 px-4 px-sm-5 pt-3">
                                                <div class="mb-3">
                                                    <h6 class="text-md fw-bold">${this.langvars.filter_prompt}</h6>
                                                </div>

                                                <div class="d-flex flex-wrap gap-2 mb-5">
                                                    ${(this.categories || []).map((category) => html`
                                                    <button
                                                        class="${this.selectedCategory === category ? 'bg-primary text-white' : 'text-primary bg-white'} btn rounded-pill py-2 fw-semibold px-4 border-primary"
                                                        @click="${() => this.selectCategory(category)}">
                                                        ${category}
                                                    </button>
                                                    `)}
                                                </div>

                                                <div class="row g-3">
                                                     ${(this.filteredProducts || []).map((product) => html`
                                                        <div class="col-sm-6 col-md-4">
                                                            <div @click=${(e) => this.viewProduct({product, from: 'catalog', to: 'product'})} 
                                                                class="product-card d-flex flex-column cursor-pointer">
                                                                
                                                                <div class="product-flags d-flex flex-wrap">
                                                                    ${(product.flags || []).map(flag => html`
                                                                        <div class="product-flag">${flag}</div>
                                                                    `)}
                                                                    ${(() => {
                                                                        const variants = product?.variants || [];
                                                                        const discounted = variants.find(v => parseFloat(v.price?.regular_price) > parseFloat(v.price?.current_price));
                                                                        if (discounted) {
                                                                            const regular = parseFloat(discounted.price.regular_price);
                                                                            const current = parseFloat(discounted.price.current_price);
                                                                            const pct = Math.round(((regular - current) / regular) * 100);
                                                                            return html`<div class="product-flag product-flag-discount">-${pct}%</div>`;
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                </div>

                                                                <div class="img-container">
                                                                    <img .src=${product?.featured_image?.mediume} alt="">
                                                                </div>

                                                                <div class="product-name fw-bold p-3">
                                                                    ${product.name}
                                                                </div>

                                                                ${(product.options || []).some(o => isColorOption(o.name) && o.values?.length > 0) ? html`
                                                                <div class="product-options d-flex flex-column gap-2">
                                                                    ${(product.options || []).filter(o => isColorOption(o.name)).map((option) => html`
                                                                        <div class="product-option product-option-color d-flex align-items-center gap-2 px-3">
                                                                            ${(option.values || []).map((value) => html`
                                                                                <div class="product-variation rounded-circle product-color" style="background-color: ${getValHex(value)}" title="${getValLabel(value)}"></div>
                                                                            `)}
                                                                        </div>
                                                                    `)}
                                                                </div>
                                                                ` : null}

                                                                <div class="mt-auto d-flex align-items-center gap-2 p-3">
                                                                    <div class="bg-primary text-white rounded-2 px-3 py-1 fw-bold">${product?.price?.min_price}€</div>
                                                                    ${(() => {
                                                                        const variants = product?.variants || [];
                                                                        const discounted = variants.find(v => parseFloat(v.price?.regular_price) > parseFloat(v.price?.current_price));
                                                                        if (discounted) {
                                                                            return html`<span class="text-muted text-decoration-line-through" style="font-size: 0.85em;">${parseFloat(discounted.price.regular_price).toFixed(2)}€</span>`;
                                                                        }
                                                                        return null;
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    `)}
                                                </div>

                                            </div>
                                        ` 
                                        : null
                                    }

                                    ${this.purchaseProduct.formData.currentView == 'product' 
                                        ? html`
                                            <!-- <product-view 
                                                .product=${this.activeProduct}
                                                .langvars=${this.langvars}>
                                            </product-view> -->
                                            
                                            <div class="p-4 p-sm-5">
                                                <div class="product-item">
                                                    <div class="row">
                                                        <div class="col-sm-6">
                                                            <div class="product-preview mb-3">
                                                                <div class="img-container">
                                                                    <img .src=${this.purchaseProduct.formData.activeProduct?.featured_image?.large} alt="">
                                                                </div>
                                                            </div>

                                                            <div class="mb-5 product-preview-thumbs d-flex gap-3 flex-nowrap overflow-auto">
                                                                ${(this.purchaseProduct.formData.activeProduct?.gallery || []).map((image) => html`
                                                                    <div @click="${e => this.selectPreviewSlide(image)}" class="img-container">
                                                                        <img src="${image.small}" alt="">
                                                                    </div>
                                                                `)}
                                                            </div>

                                                            <div class="fw-bold mb-3">${this.langvars.product_description}</div>

                                                            <div>
                                                                ${this.purchaseProduct.formData.activeProduct?.meta_description}
                                                            </div>
                                                        </div>

                                                        <div class="col-sm-6 ps-lg-4">

                                                            ${Array.isArray(this.purchaseProduct.formData.activeProduct?.flags) && this.purchaseProduct.formData.activeProduct.flags.length > 0 
                                                            ? html`
                                                                <div class="product-flags d-flex mb-3 flex-wrap">
                                                                    ${this.purchaseProduct.formData.activeProduct.flags.map(flag => html`
                                                                        <div class="product-flag">${flag}</div>
                                                                    `)}
                                                                </div>
                                                            ` 
                                                            : null
                                                            }

                                                            <div class="mb-4">
                                                                <h5 class="fw-bold">${this.purchaseProduct.formData.activeProduct?.name}</h5>

                                                                <div class="product-price fw-extrabold fs-5 d-flex align-items-center gap-2">
                                                                    ${(() => {
                                                                        const product = this.purchaseProduct.formData.activeProduct;
                                                                        const price = product?.price;
                                                                        const variants = product?.variants || [];
                                                                        const discounted = variants.find(v => parseFloat(v.price?.regular_price) > parseFloat(v.price?.current_price));

                                                                        if (discounted) {
                                                                            const regular = parseFloat(discounted.price.regular_price);
                                                                            const current = parseFloat(discounted.price.current_price);
                                                                            const pct = Math.round(((regular - current) / regular) * 100);
                                                                            return html`
                                                                                <span class="text-primary">${price?.min_price}€</span>
                                                                                <span class="text-muted text-decoration-line-through fw-semibold" style="font-size: 0.85em;">${regular.toFixed(2)}€</span>
                                                                                <span class="fw-normal fs-8 product-flag product-flag-discount text-primary px-1"><span class="position-relative">-${pct}%</span></span>
                                                                            `;
                                                                        }
                                                                        return html`<span class="text-primary">${price?.min_price}€</span>`;
                                                                    })()}
                                                                </div>
                                                            </div>

                                                            <form @submit=${this.handleProductForm} class="widget-process-form product-form">

                                                                <div class="notification-popup text-center px-3 py-5 text-white">
                                                                    <div class="icon mx-auto">
                                                                        <img src="${basePath}img/icon-check.png" class="img-fluid" alt="">
                                                                    </div>
                                                                    <span class="fw-medium fs-5">${this.langvars.added_to_cart}</span>
                                                                </div>
                                                            
                                                                <!-- DYNAMIC OPTIONS LOOP -->
                                                                ${options.map(option => {
                                                                    const values = option.values || [];
                                                                    if (values.length === 0) return null;
                                                                    const optName = option.name;
                                                                    const isColor = isColorOption(optName);

                                                                    return html`
                                                                    <div class="mb-4">
                                                                        <label class="mb-2 text-md fw-semibold">${getOptionLabel(optName)}</label>
                                                                        <div class="d-flex flex-wrap gap-2">
                                                                            ${values.map(val => {
                                                                                const valKey = getValKey(val);
                                                                                const disabled = isOptionValueDisabled(optName, valKey);
                                                                                const checked = selections[optName] === valKey;
                                                                                return html`
                                                                                <div class="product-option-input ${isColor ? 'product-color-input' : ''} form-check form-check-theme">
                                                                                    <label class="form-check-label">
                                                                                        <input
                                                                                            class="form-check-input"
                                                                                            type="radio"
                                                                                            name="selection_${optName}"
                                                                                            .value=${valKey}
                                                                                            .checked=${checked}
                                                                                            ?disabled=${disabled}
                                                                                            @change=${e => this.onOptionChange(optName, valKey)}
                                                                                            required>
                                                                                        ${isColor
                                                                                            ? html`<span class="form-theme-input rounded-circle" style="background-color: ${getValHex(val)} !important" title="${getValLabel(val)}"></span>`
                                                                                            : html`<span class="form-theme-input rounded-pill py-1 px-4 text-uppercase fw-bold border-primary text-primary">${getValLabel(val)}</span>`
                                                                                        }
                                                                                    </label>
                                                                                </div>
                                                                                `;
                                                                            })}
                                                                        </div>
                                                                    </div>
                                                                    `;
                                                                })}

                                                                <div class="mb-4">
                                                                    <label class="mb-2 text-md fw-semibold">${this.langvars.quantity}</label>

                                                                    <div class="qty-input-group input-group" style="width: 135px;">
                                                                        <button 
                                                                            @click="${(e) => {
                                                                                this.purchaseProduct = {
                                                                                    ...this.purchaseProduct,
                                                                                    formData: {
                                                                                        ...this.purchaseProduct.formData,
                                                                                        activeProduct: {
                                                                                            ...this.purchaseProduct.formData.activeProduct,
                                                                                            selected_qty: this.purchaseProduct.formData.activeProduct?.selected_qty - 1
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }}" 
                                                                            .disabled="${this.purchaseProduct.formData.activeProduct?.selected_qty == 1}" 
                                                                            class="btn btn-outline-secondary decrease" 
                                                                            type="button"> - 
                                                                        </button>
                                                                        <input 
                                                                            .value="${this.purchaseProduct.formData.activeProduct?.selected_qty}" 
                                                                            type="number" 
                                                                            class="form-control form-control-theme text-center quantity" 
                                                                            min="1"
                                                                            readonly />
                                                                        <button 
                                                                            @click="${(e) => {
                                                                                this.purchaseProduct = {
                                                                                    ...this.purchaseProduct,
                                                                                    formData: {
                                                                                        ...this.purchaseProduct.formData,
                                                                                        activeProduct: {
                                                                                            ...this.purchaseProduct.formData.activeProduct,
                                                                                            selected_qty: this.purchaseProduct.formData.activeProduct?.selected_qty + 1
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }}" 
                                                                            class="btn btn-outline-secondary increase" 
                                                                            type="button"> + 
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div class="d-flex flex-column flex-sm-row gap-2">
                                                                    <button @click="${() => this.addToCart({product: this.purchaseProduct.formData.activeProduct})}" type="button" class="btn btn-outline-primary btn-theme rounded-pill fw-medium w-100">${this.langvars.add_to_cart}</button>

                                                                    <button type="submit" class="btn btn-primary btn-theme rounded-pill fw-medium w-100">${this.langvars.buy_now}</button>
                                                                </div>

                                                            </form>

                                                        </div>

                                                    </div>
                                                </div>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseProduct.formData.currentView == 'cart' 
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                ${this.purchaseProduct.formData.cart.length < 1 
                                                    ? html`
                                                        <div class="fs-italic">${this.langvars.cart_empty}</div>
                                                    ` 
                                                    : html`
                                                        <div class="cart-container">
                                                            <div class="cart-actions d-flex align-items-center mb-40px">
                                                                <label class="form-check-label">
                                                                    <input @change=${(e) => {this.handleCartSelectAll(e)}} type="checkbox" class="form-check-input border-primary fs-base" .checked=${this.isAllProductsSelected}>
                                                                    <span class="ms-3 text-md fw-bold">${this.langvars.select_all}</span>
                                                                </label>

                                                                <div class="ms-auto">
                                                                    <div @click=${(e) => this.deleteCartItems()} class="d-inline-flex text-primary cursor-pointer" title="${this.langvars.delete_selected}">
                                                                        <icon-display icon="trash" size="20px"></icon-display>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="cart-body">
                                                                ${(this.purchaseProduct.formData.cart || []).map((product) => html`
                                                                    <div class="cart-item d-flex flex-column flex-md-row mb-40px">
                                                                        <div class="d-flex align-items-center mb-3 mb-md-0 gap-2 gap-md-4">
                                                                            <label class="form-check-label">
                                                                                <input 
                                                                                    type="checkbox" 
                                                                                    @change=${(e) => {product.isSelected = !product.isSelected; this.requestUpdate();}}
                                                                                    .checked=${product.isSelected}
                                                                                    class="form-check-input border-primary fs-base">
                                                                                <span class="ms-3 text-md fw-bold"></span>
                                                                            </label>

                                                                            <div class="cart-item-img">
                                                                                <img .src=${product?.image} alt="">
                                                                            </div>
                                                                        </div>

                                                                        <div class="col ms-40px ms-md-0 px-md-4 mb-4 mb-md-0">
                                                                            <div class="col-md-11 mx-auto">
                                                                                <div class="product-name fw-bold text-md">${product?.name}</div>
                                                                                <div class="product-price text-md fw-bold text-primary">${product?.price * product?.selected_qty}€</div>
                                                                                
                                                                                ${product?.selections && Object.values(product.selections).some(v => v) ? html`
                                                                                <div class="mt-2 d-flex flex-wrap gap-1">
                                                                                    ${Object.entries(product.selections).map(([key, val]) => 
                                                                                        val ? html`
                                                                                            <div class="rounded-1 bg-bright-gray text-muted-1 px-3 py-1">
                                                                                                ${val}
                                                                                            </div>
                                                                                        ` : null
                                                                                    )}
                                                                                </div>
                                                                                ` : null}
                                                                            </div>
                                                                        </div>

                                                                        <div class="cart-item-actions align-self-md-center ms-40px ms-md-0">
                                                                            <div class="qty-input-group input-group" style="width: 135px;">
                                                                                <button 
                                                                                    @click="${(e) => {product.selected_qty = product.selected_qty - 1; this.requestUpdate()}}" 
                                                                                    .disabled="${product.selected_qty == 1}" 
                                                                                    class="btn btn-outline-secondary decrease" 
                                                                                    type="button"> - 
                                                                                </button>
                                                                                <input 
                                                                                    .value="${product.selected_qty}" 
                                                                                    type="number" 
                                                                                    class="form-control form-control-theme text-center quantity" 
                                                                                    min="1"
                                                                                    readonly />
                                                                                <button 
                                                                                    @click="${(e) => {product.selected_qty = product.selected_qty + 1; this.requestUpdate()}}" 
                                                                                    class="btn btn-outline-secondary increase" 
                                                                                    type="button"> + 
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                `)}
                                                            </div>

                                                            <div class="text-center mt-4 mt-md-7 col-md-8 col-lg-6 mx-auto">
                                                                <button 
                                                                    @click=${() => this.proceedFromCart()}
                                                                    type="button"
                                                                    class="btn btn-primary btn-theme rounded-pill w-100">
                                                                        ${this.langvars.checkout} ${this.purchaseProduct.formData.cart.filter(i => i.isSelected).reduce((sum, item) => sum + item.price * item.selected_qty, 0)}€ (${this.purchaseProduct.formData.cart.filter(i => i.isSelected).length} items)
                                                                </button>

                                                                <div class="d-flex justify-content-center mb-4 mt-10px fs-7 text-center">
                                                                    <div @click=${(e) => this.navigate({view: 'catalog'})} class="btn-theme btn btn-outline-primary rounded-pill w-100">${this.langvars.continue_shopping}</div>
                                                                </div>
                                                            </div>

                                                            <div class="text-center mt-3 fs-7">
                                                                ${unsafeHTML(this.langvars.product_total_note)}
                                                            </div>

                                                        </div>
                                                    `
                                                }
                                            </div>
                                        ` 
                                        : null
                                    }

                                    ${this.purchaseProduct.formData.currentView == 'personal-info' 
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <div class="col-sm-11 mx-auto">
                                                    <form @submit=${e => this.onProcessFormSubmit(e, {nextProcess: 'checkout', action: 'submit-shipping-information'})} class="widget-process-form">
                                                        

                                                        <div class="row g-40px">
                                                            <div class="col-12">
                                                                <h6 class="text-md fw-bold">${this.langvars.shipping_information}</h6>
                                                            </div>

                                                            <div class="col-sm-6">
                                                                <div>
                                                                    <label class="mb-2 text-md fw-semibold">${this.langvars.first_name} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                    <input 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                        .value=${this.purchaseProduct.formData.first_name}
                                                                        name="first_name"
                                                                        class="form-control form-control-theme"
                                                                        required>
                                                                </div>
                                                            </div>

                                                            <div class="col-sm-6">
                                                                <div>
                                                                    <label class="mb-2 text-md fw-semibold">${this.langvars.last_name} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                    <input 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                        .value=${this.purchaseProduct.formData.last_name} 
                                                                        name="last_name"
                                                                        class="form-control form-control-theme"
                                                                        required>
                                                                </div>
                                                            </div>

                                                            <div class="col-sm-6">
                                                                <div>
                                                                    <label class="mb-2 text-md fw-semibold">${this.langvars.email} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                    <input 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                        .value=${this.purchaseProduct.formData.email}
                                                                        name="email"
                                                                        type="email" 
                                                                        class="form-control form-control-theme"
                                                                        required>
                                                                </div>
                                                            </div>

                                                            <div class="col-sm-6">
                                                                <div>
                                                                    <label class="mb-2 text-md fw-semibold">${this.langvars.phone} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                    <input 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                        .value=${this.purchaseProduct.formData.phone} 
                                                                        name="phone"
                                                                        type="tel" 
                                                                        class="form-control form-control-theme"
                                                                        required>
                                                                </div>
                                                            </div>

                                                            <div class="col-sm-6">
                                                                <div>
                                                                    <label class="mb-2 text-md fw-semibold">${this.langvars.street} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                    <input 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                        .value=${this.purchaseProduct.formData.street}
                                                                        name="street"
                                                                        class="form-control form-control-theme"
                                                                        required>
                                                                </div>
                                                            </div>

                                                            <div class="col-sm-6">
                                                                <div>
                                                                    <label class="mb-2 text-md fw-semibold">${this.langvars.house_number} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                    <input 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                        .value=${this.purchaseProduct.formData.house_number}
                                                                        name="house_number"
                                                                        class="form-control form-control-theme"
                                                                        required>
                                                                </div>
                                                            </div>

                                                            <div class="col-sm-6">
                                                                <div>
                                                                    <label class="mb-2 text-md fw-semibold">${this.langvars.city} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                    <input 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                        .value=${this.purchaseProduct.formData.city}
                                                                        name="city"
                                                                        class="form-control form-control-theme"
                                                                        required>
                                                                </div>
                                                            </div>

                                                            <div class="col-sm-6">
                                                                <div>
                                                                    <label class="mb-2 text-md fw-semibold">${this.langvars.postal_code} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                    <input 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                        .value=${this.purchaseProduct.formData.postal}
                                                                        name="postal"
                                                                        type="text" 
                                                                        class="form-control form-control-theme"
                                                                        required>
                                                                </div>
                                                            </div>

                                                            <div class="col-12">
                                                                <label class="form-check-label">
                                                                    <input 
                                                                        class="form-check-input border-primary fs-base"
                                                                        type="checkbox"
                                                                        name="is_billing_same_as_shipping"
                                                                        .checked=${this.purchaseProduct.formData.is_billing_same_as_shipping}
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')}>
                                                                    <span class="ms-2 text-md fw-medium">${this.langvars.same_shipping_billing_information}</span>
                                                                </label>
                                                            </div>
                                                        </div>

                                                        ${!this.purchaseProduct.formData.is_billing_same_as_shipping
                                                            ? html`
                                                                <div class="row g-40px bg-gray-3 mt-4 pb-40px rounded-2">
                                                                    <div class="col-12">
                                                                        <h6 class="text-md fw-bold">${this.langvars.billing_information}</h6>
                                                                    </div>

                                                                    <div class="col-sm-6">
                                                                        <div>
                                                                            <label class="mb-2 text-md fw-semibold">${this.langvars.first_name} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                            <input 
                                                                                @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                                .value=${this.purchaseProduct.formData.billing_first_name}
                                                                                name="billing_first_name"
                                                                                class="form-control form-control-theme"
                                                                                required>
                                                                        </div>
                                                                    </div>

                                                                    <div class="col-sm-6">
                                                                        <div>
                                                                            <label class="mb-2 text-md fw-semibold">${this.langvars.last_name} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                            <input 
                                                                                @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                                .value=${this.purchaseProduct.formData.billing_last_name} 
                                                                                name="billing_last_name"
                                                                                class="form-control form-control-theme"
                                                                                required>
                                                                        </div>
                                                                    </div>

                                                                    <div class="col-sm-6">
                                                                        <div>
                                                                            <label class="mb-2 text-md fw-semibold">${this.langvars.email} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                            <input 
                                                                                @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                                .value=${this.purchaseProduct.formData.billing_email}
                                                                                name="billing_email"
                                                                                type="email" 
                                                                                class="form-control form-control-theme"
                                                                                required>
                                                                        </div>
                                                                    </div>

                                                                    <div class="col-sm-6">
                                                                        <div>
                                                                            <label class="mb-2 text-md fw-semibold">${this.langvars.phone} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                            <input 
                                                                                @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                                .value=${this.purchaseProduct.formData.billing_phone} 
                                                                                name="billing_phone"
                                                                                type="tel" 
                                                                                class="form-control form-control-theme"
                                                                                required>
                                                                        </div>
                                                                    </div>

                                                                    <div class="col-sm-6">
                                                                        <div>
                                                                            <label class="mb-2 text-md fw-semibold">${this.langvars.street} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                            <input 
                                                                                @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                                .value=${this.purchaseProduct.formData.billing_street}
                                                                                name="billing_street"
                                                                                class="form-control form-control-theme"
                                                                                required>
                                                                        </div>
                                                                    </div>

                                                                    <div class="col-sm-6">
                                                                        <div>
                                                                            <label class="mb-2 text-md fw-semibold">${this.langvars.house_number} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                            <input 
                                                                                @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                                .value=${this.purchaseProduct.formData.billing_house_number}
                                                                                name="billing_house_number"
                                                                                class="form-control form-control-theme"
                                                                                required>
                                                                        </div>
                                                                    </div>

                                                                    <div class="col-sm-6">
                                                                        <div>
                                                                            <label class="mb-2 text-md fw-semibold">${this.langvars.city} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                            <input 
                                                                                @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                                .value=${this.purchaseProduct.formData.billing_city}
                                                                                name="billing_city"
                                                                                class="form-control form-control-theme"
                                                                                required>
                                                                        </div>
                                                                    </div>

                                                                    <div class="col-sm-6 col-lg-4">
                                                                        <div>
                                                                            <label class="mb-2 text-md fw-semibold">${this.langvars.postal_code} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                            <input 
                                                                                @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                                .value=${this.purchaseProduct.formData.billing_postal}
                                                                                name="billing_postal"
                                                                                type="text" 
                                                                                class="form-control form-control-theme"
                                                                                required>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            `
                                                            : null
                                                        }

                                                        <div class="text-center mt-5 mt-sm-6 col-8 col-lg-6 mx-auto">
                                                            <!-- <button @click=${(e) => this.navigate({view: 'checkout'})} class="btn btn-primary btn-theme rounded-pill w-100">Confirm</button> -->
                                                            <button type="submit" class="btn btn-primary btn-theme rounded-pill w-100">${this.langvars.confirm}</button>
                                                        </div>

                                                        <div class="text-center mt-3">
                                                            ${this.langvars.agreement} <a href="#" class="text-underline text-info">${this.langvars.terms}.</a>
                                                        </div>
                                                    </form>

                                                </div>
                                            </div>
                                        ` 
                                        : null
                                    }

                                    ${this.purchaseProduct.formData.currentView == 'checkout' 
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <div class="col-lg-11 mx-auto">
                                                    <h6 class="text-md fw-bold">${this.langvars.deliver_to}</h6>

                                                    <form @submit=${ e => this.onProcessFormSubmit(e, {nextProcess: 'payment-in-progress', action: 'confirm-order'})} class="widget-process-form">
                                                        <div class="rounded-2 bg-bright-gray text-blue-gray d-flex py-4 px-4 gap-3 mb-30px">
                                                            <div>
                                                                <icon-display icon="user" size="15px"></icon-display>
                                                            </div>
                                                            <div class="col">
                                                                ${this.purchaseProduct.formData.first_name} ${this.purchaseProduct.formData.last_name} (${this.purchaseProduct.formData.phone})
                                                                <br>${this.purchaseProduct.formData.email}
                                                                <br>${this.purchaseProduct.formData.street} ${this.purchaseProduct.formData.house_number} 
                                                                <br>${this.purchaseProduct.formData.postal} ${this.purchaseProduct.formData.city}
                                                            </div>
                                                        </div>

                                                        <div class="mb-30px">
                                                            <h6 class="text-md fw-bold">${this.langvars.shipping_method}</h6>

                                                            ${(this.purchaseProduct.deliveryOptions || []).map((option) => {
                                                                const optionKey = option.vendor ? `${option.type}::${option.vendor}` : option.type;
                                                                return html`
                                                                    <div class="form-check mb-2">
                                                                        <label class="form-check-label fs-6 d-flex align-items-center gap-2">
                                                                            <input 
                                                                                @change=${() => this.onDeliveryOptionChange(option)}
                                                                                .checked=${this.purchaseProduct.formData.delivery_option === optionKey}
                                                                                class="form-check-input mt-0 border-primary" 
                                                                                type="radio" 
                                                                                name="delivery_option" 
                                                                                .value="${optionKey}">
                                                                            <span class="ms-1">${option.i18n} — ${option.rate}€</span>
                                                                        </label>
                                                                    </div>
                                                                `;
                                                            })}
                                                        </div>


                                                        <h6 class="text-md fw-bold">${this.langvars.payment_method_prompt}</h6>

                                                        <div class="text-md mb-40px">
                                                            <p>
                                                                ${this.langvars.redirect_notice}
                                                            </p>
                                                        </div>

                                                        <div class="d-flex flex-wrap gap-3 mb-5">
                                                            <div class="col">
                                                                <div class="form-check form-check-theme">
                                                                    <label class="form-check-label">
                                                                        <input 
                                                                            @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                            .checked=${this.purchaseProduct.formData.paymentMode == 'bancontact'}
                                                                            name="paymentMode" 
                                                                            class="form-check-input" 
                                                                            value="bancontact" 
                                                                            type="radio"
                                                                            required>
                                                                            <span class="form-theme-input py-10px rounded fw-semibold d-flex justify-content-start gap-3 px-40px py-3" style="height: 69px;"><img src="${basePath}img/Payconiq.svg" style="height: 47px; width: 84px;" alt=""> Bancontact</span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <div class="col">
                                                                <div class="form-check form-check-theme">
                                                                    <label class="form-check-label">
                                                                        <input 
                                                                            @change=${(e) => this.onInputChange(e, 'purchaseProduct.formData')} 
                                                                            .checked=${this.purchaseProduct.formData.paymentMode == 'card'} 
                                                                            name="paymentMode" 
                                                                            class="form-check-input" 
                                                                            value="card" 
                                                                            type="radio"
                                                                            required>
                                                                            <span class="form-theme-input py-10px rounded fw-semibold d-flex justify-content-start gap-3 px-40px py-3" style="height: 69px;"><img src="${basePath}img/VISA-MC.svg" style="height: 27px; width: 84px;" alt=""> ${this.langvars.payment_card} </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div class="order-summary-table mb-4">
                                                            ${(this.purchaseProduct.formData.cart || []).filter(item => item.isSelected).map((product) => html`
                                                                <div class="order-summary-item d-flex mb-4">
                                                                    <div class="position-relative">
                                                                        <div class="item-img">
                                                                            <img .src=${product.image} alt="">
                                                                        </div>
                                                                    </div>

                                                                    <div class="col text-md ps-4 ps-lg-5 d-flex flex-column">
                                                                        <div class="item-name fw-bold">
                                                                            ${product.name}
                                                                        </div>

                                                                        <div class="text-muted-1 fs-6">
                                                                            ${product.selected_qty} x ${product.price.toFixed(2)} €
                                                                        </div>

                                                                        ${product.selections && Object.values(product.selections).some(v => v) ? html`
                                                                        <div class="mt-2 d-flex flex-wrap gap-1 fs-8">
                                                                            ${Object.entries(product.selections).map(([key, val]) => 
                                                                                val ? html`
                                                                                    <div class="rounded-1 bg-bright-gray text-muted-1 px-3 py-1">
                                                                                        ${val}
                                                                                    </div>
                                                                                ` : null
                                                                            )}
                                                                        </div>
                                                                        ` : null}

                                                                        <div class="text-end fw-bold text-muted-1 mt-auto">
                                                                            ${(product.price * product.selected_qty).toFixed(2)} €
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            `)}
                                                        </div>

                                                        <div class="rounded-2 bg-bright-gray text-blue-gray py-4 px-4 text-md">
                                                            <div class="d-flex justify-content-between">
                                                                <div>${this.langvars.total_articles}</div>
                                                                <div class="fw-bold">${this.formatCurrency(this.getCartSubTotal())} €</div>
                                                            </div>
                                                            <div class="d-flex justify-content-between">
                                                                <div>${this.langvars.shipping_fee}</div>
                                                                <div class="fw-bold">${this.formatCurrency(this.getDeliveryFeeTTC())} €</div>
                                                            </div>

                                                            <div class="mt-3 d-flex justify-content-between text-dark fs-5 fw-bold">
                                                                <div>${this.langvars.total}</div>
                                                                <div class="fw-bold">${this.formatCurrency(this.getCartTotal())} €</div>
                                                            </div>

                                                            <div class="text-blue-gray text-sm mt-1">
                                                                ${this.langvars.including_tax.replace('{amount}', this.formatCurrency(this.getCartTVA()))}
                                                            </div>
                                                        </div>

                                                        ${this.mode !== 'dev'
                                                            ? html`
                                                                <div class="text-center mt-6">
                                                                    <button type="submit" class="btn btn-primary btn-theme rounded-pill px-5 px-lg-9">${this.langvars.place_order}</button>

                                                                    <div class="fs-8 mt-4">${this.langvars.payment_secure} <span class="text-info">${this.langvars.ssl_notice}.</span></div>
                                                                </div>
                                                            `
                                                            : html`
                                                               <div class="text-center">
                                                                    Last step is disabled in dev mode.
                                                                </div> 
                                                            `
                                                        }

                                                        <div class="text-center mt-7">
                                                            <img src="${basePath}img/bc-logo-round-1.svg" class="img-fluid" alt="">
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        ` 
                                        : null
                                    }

                                    ${this.purchaseProduct.formData.currentView == 'payment-in-progress'
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <div class="p-3 bg-gray-2 py-4 text-center rounded-2">
                                                    <h4 class="fw-bold">${this.langvars.payment_in_progress}</h4>
                                                    <p class="m-0">${this.langvars.waiting_payment_confirmation}</p>

                                                    <div class="mt-5 mini-loader mx-auto"></div>

                                                    <div class="mt-5">
                                                        <a href="#" class="d-flex justify-content-center align-items-center gap-2 fs-6">
                                                            <icon-display icon="circle-question" size="18" color="var(--bs-primary)"></icon-display>
                                                            <span class="mt-1">${this.langvars.order_help}</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        `
                                        : null
                                    }


                                    ${this.purchaseProduct.formData.currentView == 'success' 
                                        ? html`
                                            <div class="success-tab-content d-flex flex-column h-100">
                                                <div class="p-4 p-sm-5">
                                                    <div class="text-center text-md">
                                                        <div class="mb-4">
                                                            <lottie-wrapper .loop=${false} src="${basePath}img/lottie/success.json" class="mx-auto" style="height: 220px"></lottie-wrapper>
                                                        </div>

                                                        <div class="mb-4">
                                                            <h5 class="fw-bold">${this.langvars.thank_you}, ${this.purchaseProduct.formData.first_name}.</h5>
                                                        </div>

                                                        <p>
                                                            ${this.langvars.confirmation_msg_ecommerce}
                                                        </p>

                                                        <div class="mt-4 d-flex justify-content-center">
                                                            <div @click=${(e) => this.reset()} class="cursor-pointer text-underline fs-6 fw-bold text-primary">${this.langvars.purchase_another_product}</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="text-center py-3 mt-auto">
                                                    <img src="${basePath}img/bc-logo-round-1.svg" alt="">
                                                </div>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseProduct.formData.currentView == 'error'
                                        ? html`
                                            <div class="d-flex flex-column h-100">
                                                <div class="p-4 p-sm-5">
                                                    <div class="text-center text-md">
                                                        ${this.langvars.error}
                                                    </div>
                                                </div>

                                                <div class="text-center py-3 mt-auto">
                                                    <img src="${basePath}img/bc-logo-round-1.svg" alt="">
                                                </div>
                                            </div>
                                        ` 
                                        : null
                                    }
                                </fade-wrapper>    
                            `)}

                            <div class="mouse-scroll-indicator">
                                <icon-display icon="angle-down" size="24px" color="#fff"></icon-display>
                            </div>

                            <div class="py-4"></div>
                        </div>
                    </div>
                </div>
                
            </div>
        `
    }

    // firstUpdated / document ready equivalent
    firstUpdated() {
        this.renderRoot.addEventListener("click", (event) => {
            if (event.target.closest(".btn-panel-window-toggle")) {
                this.isPanelMaximized = !this.isPanelMaximized;

                this.dispatchEvent(new CustomEvent("panel-window-toggle", {
                    detail: {isPanelMaximized: this.isPanelMaximized},
                    bubbles: true,
                    composed: true,
                }))
            }
        });



        // const allCats = this.purchaseProduct.products.flatMap(p => p.categories);
        // this.categories = Array.from(new Set(allCats)).sort();

        // Delegate mousemove for zoom-in
        this.renderRoot.addEventListener('mousemove', (e) => {
            const container = e.target.closest('.product-preview .img-container');
            if (!container) return;              // only when over a container

            const img = container.querySelector('img');
            const rect = container.getBoundingClientRect();

            // pointer position as percentages
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            img.style.transformOrigin = `${x}% ${y}%`;
            img.style.transform = 'scale(1.5)';
        });

        // Delegate mouseout for zoom-out
        this.renderRoot.addEventListener('mouseout', (e) => {
            const container = e.target.closest('.product-preview .img-container');
            if (!container) return;

            // if we're still moving inside the same container, ignore
            if (e.relatedTarget && container.contains(e.relatedTarget)) return;

            const img = container.querySelector('img');
            img.style.transform = 'scale(1)';
            // reset origin after the scale-down transition
            setTimeout(() => {
                img.style.transformOrigin = 'center center';
            }, 300); // match your CSS transition-duration
        });
    }

    updated(changedProps) {
    }

    selectCategory(cat) {
      this.selectedCategory = (this.selectedCategory === cat) ? null : cat;
    }

    handleCartSelectAll(e) {
        const {checked} = e.target;

        this.purchaseProduct = {
            ...this.purchaseProduct,
            formData: {
                ...this.purchaseProduct.formData,
                cart: this.purchaseProduct.formData.cart.map(p => ({
                    ...p,
                    isSelected: checked
                }))
            }
        };
    }

    async onProcessFormSubmit(e, payload) {
        e.preventDefault();

        if (payload.action) {
            switch(payload.action) {
                case 'add-to-cart': 
                    this.addToCart({product: this.purchaseProduct.formData.activeProduct});

                    break;
                case "confirm-order":
                    this.navigate({view: payload.nextProcess});
                    
                    this.handleUpdateState();

                    setTimeout(async () => {
                        await this.getCheckout();
                    }, 2000);

                    break;
                case 'submit-shipping-information':
                    await this.getDeliveryOptions();

                    this.navigate({view: payload.nextProcess});

                    break;
            }
        } else {
            if (payload.nextProcess) {
                this.navigate({view: payload.nextProcess});
            }
        }

        // this.handleUpdateState();
    }

    proceedFromCart() {
        const hasSelected = (this.purchaseProduct.formData.cart || []).some(item => item.isSelected);
        if (!hasSelected) {
            BcDialog.confirm({
                title: this.langvars.no_items_selected,
                message: this.langvars.no_items_selected_message,
                acceptLabel: 'OK',
                hideCancel: true,
                onAccept: () => {},
            }, null, { host: this });
            return;
        }

        this.navigate({ view: 'personal-info' });
    }
    
    navigate(payload) {
        // Stop verify polling when leaving payment-in-progress
        if (this.purchaseProduct.formData.currentView === 'payment-in-progress' && this._verifyInterval) {
            this.stopPolling();
        }

        if (payload?.direction == 'back') {
            this.purchaseProduct.formData.viewHistory.pop();
        } else {
            this.purchaseProduct.formData.viewHistory.push(payload.view);
        }

        this.purchaseProduct = {...this.purchaseProduct, formData: {...this.purchaseProduct.formData, currentView: this.purchaseProduct.formData.viewHistory.at(-1)}};
        this.handleUpdateState();

        // Re-fetch delivery options when landing on checkout
        if (this.purchaseProduct.formData.currentView === 'checkout') {
            this.getDeliveryOptions();
        }
        
        if (this.renderRoot.querySelectorAll(".panel-scroll-area").length) {
            this.renderRoot.querySelector(".panel-scroll-area").scrollTop = 0;
        }
    };

    viewProduct(payload) {
        const product = payload.product;

        // Normalize — ensure arrays always exist
        if (!Array.isArray(product.options)) product.options = [];
        if (!Array.isArray(product.available_combinations)) product.available_combinations = [];
        if (!Array.isArray(product.categories)) product.categories = [];
        if (!Array.isArray(product.flags)) product.flags = [];
        if (!Array.isArray(product.gallery)) product.gallery = [];

        // Build dynamic selections object from options: { size: undefined, color: undefined, ... }
        const selections = {};
        product.options.forEach(opt => {
            if (opt.values && opt.values.length > 0) {
                selections[opt.name] = undefined;
            }
        });

        Object.assign(this.purchaseProduct.formData.activeProduct, {
            selected_qty: 1,
            isSelected: true,
            ...product,
            // Ensure selections is always freshly built (not overwritten by product spread)
            selections
        });

        this.lastTouched = null;

        this.navigate({ view: 'product' });

        this.requestUpdate();
    };

    onOptionChange(optionName, value) {
        const activeProduct = this.purchaseProduct.formData.activeProduct;
        const newSelections = { ...activeProduct.selections, [optionName]: value };
        const combos = activeProduct.available_combinations || [];

        // Cross-filter: reset other selections that are now invalid
        if (combos.length > 0) {
            for (const otherKey of Object.keys(newSelections)) {
                if (otherKey === optionName) continue;
                const otherVal = newSelections[otherKey];
                if (otherVal == null) continue;

                // Check if current combo still valid
                const stillValid = combos.some(combo =>
                    combo[optionName] === value && combo[otherKey] === otherVal
                );
                if (!stillValid) {
                    newSelections[otherKey] = undefined;
                }
            }
        }

        this.lastTouched = optionName;

        this.purchaseProduct = {
            ...this.purchaseProduct,
            formData: {
                ...this.purchaseProduct.formData,
                activeProduct: {
                    ...activeProduct,
                    selections: newSelections
                }
            }
        };

        this.handleUpdateState();
    }

    addToCart(payload) {
        const form = this.renderRoot.querySelector('.product-form');
        if (!form.reportValidity()) return;

        const { id, name, selected_qty, selections = {}, isSelected } = payload.product;
        const cart_id = Date.now();
        const price = parseFloat(payload.product.price?.min_price || 0);
        const image = payload.product?.featured_image?.small;

        // get existing cart (fallback to empty array)
        const oldCart = Array.isArray(this.purchaseProduct.formData.cart) ? this.purchaseProduct.formData.cart : [];

        // Generic dedup: match by id + all selection values
        const selectionsMatch = (a = {}, b = {}) => {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            if (keysA.length !== keysB.length) return false;
            return keysA.every(key => (a[key] ?? '') === (b[key] ?? ''));
        };

        const idx = oldCart.findIndex(item =>
            item.id === id && selectionsMatch(item.selections, selections)
        );

        // build new cart immutably
        let newCart;
        if (idx > -1) {
            newCart = oldCart.map((item, i) =>
                i === idx
                    ? { ...item, selected_qty: item.selected_qty + selected_qty }
                    : item
            );
        } else {
            newCart = [
                ...oldCart,
                {
                    cart_id,
                    id,
                    name,
                    price,
                    image,
                    selections: { ...selections },
                    selected_qty,
                    isSelected,
                    tax_context: payload.product.tax_context
                }
            ];
        }

        // assign back to formData to trigger Lit update
        this.purchaseProduct.formData = {
            ...this.purchaseProduct.formData,
            cart: newCart
        };

        this.requestUpdate();

        this.handleUpdateState();
        
        this.renderRoot.querySelector(".cart-toggle")?.classList.add("cart-bounce");
        this.renderRoot.querySelector(".notification-popup")?.classList.add("active");
        setTimeout(() => {
            this.renderRoot.querySelector(".cart-toggle")?.classList.remove('cart-bounce');
            this.renderRoot.querySelector(".notification-popup")?.classList.remove("active");
        }, 1000);
    }

    handleProductForm(e) {
        e.preventDefault();
        const form = this.renderRoot.querySelector('.product-form');
        if (!form.reportValidity()) return;
    
        this.addToCart({product: this.purchaseProduct.formData.activeProduct});
        this.navigate({view: 'cart'});
    }

    selectPreviewSlide(image) {
        this.renderRoot.querySelector(".product-preview .img-container img").src = image.mediume;
    }

    deleteCartItems() {
        BcDialog.confirm({
            title: this.langvars.delete_cart_items,
            message: this.langvars.delete_warning,
            acceptLabel: this.langvars.delete,
            cancelLabel: this.langvars.cancel,
            danger: true,
            onAccept: () => {
                this.purchaseProduct.formData.cart = this.purchaseProduct.formData.cart.filter(item => !item.isSelected);
                this.requestUpdate();
            },
            onCancel: () => console.log('cancelled'),
        }, null, { host: this });
    };

    getCartSubTotal() {
        return this.purchaseProduct.formData.cart
            .filter(item => item.isSelected)
            .reduce((sum, item) => sum + item.price * item.selected_qty, 0);
    }

    getDeliveryFee() {
        const key = this.purchaseProduct.formData.delivery_option;
        const option = (this.purchaseProduct.deliveryOptions || []).find(o => {
            const oKey = o.vendor ? `${o.type}::${o.vendor}` : o.type;
            return oKey === key;
        });
        return parseFloat(option?.rate) || 0;
    }

    getDeliveryFeeTTC() {
        const maxRate = this.purchaseProduct.formData.cart.reduce((max, item) => {
            return Math.max(max, item.tax_context?.tax_rate || 0);
        }, 0);
        return parseFloat((this.getDeliveryFee() * (1 + maxRate)).toFixed(2));
    }

    // Extract TVA from TTC product prices + add TVA on HTVA delivery fee at highest cart rate
    getCartTVA() {
        const productTVA = this.purchaseProduct.formData.cart.reduce((sum, item) => {
            const rate = item.tax_context?.tax_rate || 0;
            const itemTotal = item.price * item.selected_qty;
            return sum + (itemTotal - itemTotal / (1 + rate));
        }, 0);

        const maxRate = this.purchaseProduct.formData.cart.reduce((max, item) => {
            return Math.max(max, item.tax_context?.tax_rate || 0);
        }, 0);

        const deliveryFee = this.getDeliveryFee();
        const deliveryTVA = deliveryFee * maxRate;

        return parseFloat((productTVA + deliveryTVA).toFixed(2));
    }

    // HTVA = product HTVA + delivery HTVA
    getCartHTVA() {
        const productHTVA = this.purchaseProduct.formData.cart.reduce((sum, item) => {
            const rate = item.tax_context?.tax_rate || 0;
            const itemTotal = item.price * item.selected_qty;
            return sum + itemTotal / (1 + rate);
        }, 0);

        return parseFloat((productHTVA + this.getDeliveryFee()).toFixed(2));
    }

    getCartTotal() {
        const maxRate = this.purchaseProduct.formData.cart.reduce((max, item) => {
            return Math.max(max, item.tax_context?.tax_rate || 0);
        }, 0);
        const deliveryTTC = this.getDeliveryFee() * (1 + maxRate);
        return parseFloat(
            (this.getCartSubTotal() + deliveryTTC).toFixed(2)
        );
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('fr-BE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value || 0);
    }

    onDeliveryOptionChange(option) {
        const optionKey = option.vendor ? `${option.type}::${option.vendor}` : option.type;

        this.purchaseProduct = {
            ...this.purchaseProduct,
            formData: {
                ...this.purchaseProduct.formData,
                delivery_option: optionKey,
                delivery_type: option.type,
                delivery_vendor: option.vendor || null,
                delivery_rate: parseFloat(option.rate) || 0,
            }
        };

        this.handleUpdateState();
    }

    onInputChange(e, propName) {
        const { name, value, type, checked, options } = e.target;

        // Option selection is now handled by onOptionChange() — no special case needed here
        
        // 1) full path = propName segments + name segments
        const fullPath = [...propName.split('.'), ...name.split('.')];
        // 2) the top-level property on `this` is the first segment…
        const root = fullPath.shift();            // e.g. "parent"
        // 3) shallow-clone that top-level prop
        const updated = { ...(this[root] || {}) };
        // 4) walk & clone all intermediate levels
        let obj = updated;
        for (let i = 0; i < fullPath.length - 1; i++) {
            const seg = fullPath[i];
            obj[seg] = { ...(obj[seg] || {}) };
            obj = obj[seg];
        }
        // 5) final key + set
        const key = fullPath[fullPath.length - 1];
        if (type === 'checkbox') {
            if (Array.isArray(obj[key])) {
                const arr = obj[key];
                obj[key] = checked
                    ? [...arr, value]
                    : arr.filter(v => v !== value);
            } else {
                obj[key] = checked;
            }
        } else if (type === 'select-multiple') {
            obj[key] = Array.from(options)
                .filter(o => o.selected)
                .map(o => o.value);
        } else {
            obj[key] = value;
        }

        // Combo cross-filtering is now handled by onOptionChange()
        
        // 6) re-assign and request update
        this[root] = updated;
        this.requestUpdate(root, updated);

        this.handleUpdateState();
    }

    handleClosePanel() {
        this.dispatchEvent(new CustomEvent("panel-closed", {
            detail: { name: "purchaseProduct" },
            bubbles: true,
            composed: true,
        }))

        // this.handleUpdateState();
    };

    handleUpdateState() {
        this.dispatchEvent(new CustomEvent("update-state", {
            detail: {data: this.purchaseProduct, name: 'purchaseProduct'},
            bubbles: true,
            composed: true
        }));
    };
}

customElements.define("purchase-product-component", purchaseProductComponent);