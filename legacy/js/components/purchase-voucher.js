import { LitElement, html, css, keyed, unsafeHTML } from "/vendors/lit/lit-all.min.js";
import { BcDialog } from "../components/helpers/dialog.js";


const pageOrigin = window.location.origin;
const scriptOrigin = new URL(import.meta.url).origin;

const isSameDomain = pageOrigin === scriptOrigin;

// Dynamic base paths based on origin check
const basePath = isSameDomain ? './' : 'https://widget.boncado.be/';

class purchaseVoucherComponent extends LitElement {
    _verifyInterval = null;

    static shadowRootOptions = { mode: 'open', delegatesFocus: true };

    static properties = {
        purchaseVoucher: { type: Object },
        lang: { type: String },
        langvars: { type: Object },
        isPanelMaximized: {type: Boolean},
        featureReady: { type: Boolean },
        showMajorationEmailDialog: { type: Boolean },
        majorationEmail: { type: String },
    }

    constructor() {
        super();

        this.isPanelMaximized = false;
        this.featureReady = false;
        this.showMajorationEmailDialog = false;
        this.majorationEmail = '';
    }

    // This disables Shadow DOM
    createRenderRoot() {
        return this;
    }

    connectedCallback() {
        super.connectedCallback();

        this.initialize();

        if (this.purchaseVoucher.formData.currentView == "payment-in-progress") {
            this._verifyInterval = setInterval(() => this._pollVerify(), 3000);
        }

        // console.log("purchase voucher component");
    }

    // render
    render() {
        if (!this.featureReady) return html ``;

        return html`
            <div class="${this.isPanelMaximized ? 'panel-maximize': ''} purchase-voucher-screen bc-widget-screen d-flex flex-column">

                <!-- <div class="in-development-overlay position-fixed start-0 w-100 h-100 d-flex align-items-center justify-content-center" style="top: 155px !important; background-color: rgb(109 109 109); z-index: 1050">
                    <div class="bg-white p-4 rounded shadow-lg text-center" style="max-width: 400px;">
                        <h2 class="fs-4 fw-bold mb-3">🚧 Under Development</h2>
                        <p class="mb-0">This feature is currently being worked on.</p>
                    </div>
                </div> -->

                <div class="panel-top-bar">
                    <div class="panel-actions d-flex align-items-center p-3">
                        ${ this.purchaseVoucher.formData.currentView !== 'suggestions' && 
                            this.purchaseVoucher.formData.currentView !== 'success' && 
                            !(!this.purchaseVoucher.hasSuggestions && this.purchaseVoucher.formData.currentView === 'gift-details')
                                ? html`
                                    <div @click=${(e) => this.navigate({ direction: 'back' })} class="p-1 cursor-pointer">
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
                        <div class="panel-head-inner pb-3">
                            ${keyed(this.purchaseVoucher.formData.currentView, html`
                                <fade-wrapper type="fade-in">
                                    ${this.purchaseVoucher.formData.currentView == 'suggestions' 
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">
                                                ${unsafeHTML(this.langvars.voucher_intro)}
                                                </h4>
                                                <div class="fs-6 fw-md">
                                                    <p>
                                                        ${unsafeHTML(this.langvars.voucher_emotion)}
                                                    </p>
                                                </div>
                                            </div>
                                        ` 
                                        : null
                                    }

                                    ${this.purchaseVoucher.formData.currentView == 'gift-details'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">
                                                    ${unsafeHTML(this.langvars.voucher_send_someone)}
                                                </h4>
                                                <div class="fs-6 fw-md">
                                                    <p>
                                                        ${unsafeHTML(this.langvars.voucher_personalize)}
                                                    </p>
                                                </div>
                                            </div>
                                        ` 
                                        : null
                                    }

                                    ${this.purchaseVoucher.formData.currentView == 'library'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">
                                                    ${unsafeHTML(this.langvars.make_extra_special)}
                                                </h4>
                                                <div class="fs-6 fw-md">
                                                    <p>
                                                        ${unsafeHTML(this.langvars.voucher_personalize)}
                                                    </p>
                                                </div>
                                            </div>
                                        ` 
                                        : null
                                    }


                                    ${this.purchaseVoucher.formData.currentView == 'send-gift'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">
                                                    ${unsafeHTML(this.langvars.voucher_spread_joy)}
                                                </h4>

                                                <div class="fs-6 fw-md">
                                                    <p>
                                                        ${unsafeHTML(this.langvars.voucher_delivery_options)}
                                                    </p>
                                                </div>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseVoucher.formData.currentView == 'payment-section'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">
                                                    ${unsafeHTML(this.langvars.seal_the_deal)}
                                                </h4>
                                                <div class="fs-6 fw-md">
                                                    <p>
                                                        ${unsafeHTML(this.langvars.voucher_finalize)}
                                                    </p>
                                                </div>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseVoucher.formData.currentView == 'payment-in-progress'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${unsafeHTML(this.langvars.payment_confirmation)}</h4>
                                                
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseVoucher.formData.currentView == 'error'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${unsafeHTML(this.langvars.error)}</h4>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseVoucher.formData.currentView == 'success'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${unsafeHTML(this.langvars.success)}!</h4>
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
                            ${keyed(this.purchaseVoucher.formData.currentView, html`
                                <fade-wrapper type="fade-in">
                                    ${this.purchaseVoucher.formData.currentView == 'suggestions'
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <div class="row">
                                                    <div class="col-sm-6">
                                                        <div @click=${(e) => {
                                                            this.handleSuggestionSelect(undefined)
                                                        }} class="suggestion-item d-flex flex-column h-100 cursor-pointer">
                                                            <div class="item-img mb-3"><img src="${this.displayVouchers[0].img}" class="img-fluid" alt=""></div>
                                                            <div class="item-title fw-bold mb-3">${this.langvars.voucher_custom_amount_title}</div>
                                                            <div class="item-desc text-muted-1 mb-3">
                                                                ${this.langvars.voucher_custom_amount_desc}
                                                            </div>
                                                            
                                                            <div class="mt-auto">
                                                                <div class="item-value d-inline-flex px-3 py-1 bg-primary rounded-1 text-white fw-bold">${this.langvars.voucher_custom_amount_cta}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <hr class="my-40px">
                                                
                                                <div class="row gy-5">
                                                    ${(this.purchaseVoucher.suggestions || []).map((suggestion) => html`
                                                        <div class="col-sm-6">
                                                            <div @click=${(e) => this.handleSuggestionSelect(suggestion)} class="suggestion-item d-flex flex-column h-100 cursor-pointer">
                                                                <div class="item-img mb-3"><img .src=${suggestion.img} class="img-fluid" alt=""></div>
                                                                <div class="item-title fw-bold mb-3">${suggestion.title}</div>
                                                                <div class="item-desc text-muted-1 mb-3">${suggestion.desc}</div>
                                                                
                                                                <div class="mt-auto">
                                                                    <div class="item-value d-inline-flex px-3 py-1 bg-primary rounded-1 text-white fw-bold">${suggestion.value}€</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    `)}
                                                </div>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseVoucher.formData.currentView == 'gift-details'
                                        ? html`
                                            <div class="p-4 px-sm-5">
                                                <div class="col-xl-10 mx-auto">
                                                    <div class="d-flex justify-content-center">
                                                        <div class="mb-4 d-flex flex-column justify-content-center">
                                                            <div class="d-flex justify-content-end mb-3">
                                                                <div @click=${(e) => {
                                                                    this.renderRoot.querySelector(".voucher-preview").classList.toggle("flip");
                                                                }} 
                                                                class="d-inline-flex bg-primary rounded-pill px-10px py-1 cursor-pointer">
                                                                    <icon-display icon="arrows-rotate" color="#fff" size="20px"></icon-display>
                                                                </div>
                                                            </div>

                                                            <div class="voucher-preview img-container cursor-pointer mx-auto" title="${this.langvars.voucher_click_preview}">
                                                                <div class="img-container">
                                                                    <img src="${this.defaultVoucherImage}" class="front img-fluid" alt="">
                                                                    
                                                                    <div class="voucher-container back ">
                                                                        <div class="voucher-scaler">
                                                                            <iframe src="https://www.boncado.be/BoncadoPreview?zoom=0.875&lang=fr" frameborder="0" class="w-100 h-100 d-block" style="backface-visibility: hidden"></iframe>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            ${this.purchaseVoucher.hasLibrary ? 
                                                                html`
                                                                    <div @click=${(e) => this.navigate({view: 'library'})} class="mt-3 d-flex justify-content-center text-center">
                                                                        <div class="fw-bold text-primary cursor-pointer text-underline">${this.langvars.browse_vouchers}</div>
                                                                    </div>
                                                                ` 
                                                                : null 
                                                            }
                                                        </div>
                                                    </div>

                                                    ${this.purchaseVoucher.formData?.selectedSuggestion !== undefined && !this.purchaseVoucher.formData?.selectedSuggestion.isFree
                                                        ? html`
                                                            <h6 class="fw-bold text-md">${unsafeHTML(this.selected_suggestion)}</h6>
                                                            <div class="selected-suggestion-preview d-flex mb-2 mb-5">            
                                                                <div class="suggestion-img"><img .src=${this.purchaseVoucher.formData?.selectedSuggestion?.img} alt=""></div>
                                                                <div class="suggestion-details col">
                                                                    <h4 class="fs-5 suggestion-title mt-0 fw-bold">${this.purchaseVoucher.formData?.selectedSuggestion?.title}</h4>
                                                                    <div class="suggestion-actions d-flex gap-3">
                                                                        <div @click=${(e) => {this.navigate({view: 'suggestions'})}} 
                                                                            class="rounded-1 py-1 px-2 cursor-pointer d-flex align-items-center gap-2 bg-gray-2">
                                                                                <icon-display icon="pencil" color="#000" size="14px"></icon-display> 
                                                                                ${unsafeHTML(this.langvars.edit)}
                                                                        </div>
                                                                        <div @click=${(e) => {this.purchaseVoucher.formData.selectedSuggestion = undefined; this.requestUpdate()}} 
                                                                            class="cursor-pointer d-flex align-items-center gap-2">
                                                                            <icon-display icon="trash-2" color="#dc3545" size="16px"></icon-display> 
                                                                            ${unsafeHTML(this.langvars.delete)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        `
                                                        : null
                                                    }


                                                    <form @submit=${e => this.onProcessFormSubmit(e, {nextProcess: 'send-gift'})} class="widget-process-form">
                                                        <div class="row g-40px mb-5 mb-sm-8">
                                                            <div class="col-sm-6">
                                                                <div>
                                                                    <label class="mb-2 text-md fw-semibold">${this.langvars.value} 
                                                                        <span class="fs-italic fs-8">(${this.langvars.required_field})</span>
                                                                    </label>
                                                                    <input 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                        .value=${this.purchaseVoucher.formData.voucher_value} 
                                                                        name="voucher_value" 
                                                                        type="text" 
                                                                        class="currencyInput form-control form-control-theme text-center" 
                                                                        placeholder="0 €"
                                                                        required>
                                                                </div>
                                                            </div>

                                                            <div class="col-sm-6">
                                                                <div>
                                                                    <label class="mb-2 text-md fw-semibold">${this.langvars.quantity}</label>
                                                                    
                                                                    <div class="qty-input-group input-group">
                                                                        <button 
                                                                            @click="${(e) => this.handleQtyChange({action: 'dec', input: 'voucher_qty'})}" 
                                                                            .disabled="${this.purchaseVoucher.formData.voucher_qty == 1}" 
                                                                            class="btn btn-outline-secondary decrease" type="button"> - 
                                                                        </button>
                                                                        <input 
                                                                            @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                            .value="${this.purchaseVoucher.formData.voucher_qty}" 
                                                                            name="voucher_qty" 
                                                                            type="number" 
                                                                            class="form-control form-control-theme text-center quantity" 
                                                                            min="1" />
                                                                        <button 
                                                                            @click="${(e) => this.handleQtyChange({action: 'inc', input: 'voucher_qty'})}" 
                                                                            class="btn btn-outline-secondary increase" type="button"> + 
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            ${this.purchaseVoucher.majoration !== null
                                                                ? html`
                                                                    <div class="col-sm-12">
                                                                        ${this.purchaseVoucher.formData.majoration_accepted === false
                                                                            ? html`
                                                                                <div class="majoration-card border rounded-3 p-3">
                                                                                    <div class="mb-4">
                                                                                        <span class="fs-7 fw-bold">${this.langvars.majoration_declined_message}</span>
                                                                                    </div>
                                                                                    <button
                                                                                        type="button"
                                                                                        @click=${() => this.resetMajorationChoice()}
                                                                                        class="btn btn-primary btn-theme rounded-pill px-4 ms-2 fs-7 px-5">
                                                                                        ${this.langvars.reset}
                                                                                    </button>
                                                                                </div>
                                                                            `
                                                                            : null
                                                                        }

                                                                        ${this.purchaseVoucher.formData.majoration_accepted === null
                                                                            ? html`
                                                                                <div class="majoration-card border rounded-3 p-3">
                                                                                    <div class="d-flex justify-content-between align-items-start fw-bold mb-2">
                                                                                        <span>${this.purchaseVoucher.majoration.title}</span>
                                                                                        <span class="ms-2 text-nowrap text-primary">+${this.purchaseVoucher.majoration.value}${this.purchaseVoucher.majoration.unit}</span>
                                                                                    </div>
                                                                                    <p class="fs-7 mb-3 text-center">${this.purchaseVoucher.majoration.description}</p>

                                                                                    ${Number(this.purchaseVoucher.formData.voucher_value) < Number(this.purchaseVoucher.majoration.min)
                                                                                        ? html`
                                                                                            <div class="text-center fs-7 text-muted fst-italic mb-3">
                                                                                                ${this.langvars.majoration_min_notice?.replace('{min}', this.formatCurrency(Number(this.purchaseVoucher.majoration.min)))}
                                                                                            </div>
                                                                                        `
                                                                                        : html`
                                                                                            <div class="d-flex gap-2 justify-content-center">
                                                                                                <button 
                                                                                                    type="button"
                                                                                                    @click=${() => this.handleMajorationChoice(true)}
                                                                                                    class="btn btn-primary btn-theme rounded-pill px-4">
                                                                                                    ${this.langvars.majoration_accept}
                                                                                                </button>
                                                                                                <button 
                                                                                                    type="button"
                                                                                                    @click=${() => this.handleMajorationChoice(false)}
                                                                                                    class="btn btn-outline-secondary rounded-pill px-4">
                                                                                                    ${this.langvars.majoration_decline}
                                                                                                </button>
                                                                                            </div>
                                                                                        `
                                                                                    }
                                                                                </div>
                                                                            `
                                                                            : null
                                                                        }

                                                                        ${this.purchaseVoucher.formData.majoration_accepted
                                                                            ? html`
                                                                                <div class="majoration-card border rounded-3 p-3">
                                                                                    <div class="d-flex justify-content-between align-items-start fw-bold mb-2">
                                                                                        <span>${this.purchaseVoucher.majoration.title}</span>
                                                                                        <span class="ms-2 text-nowrap text-primary">+${this.purchaseVoucher.majoration.value}${this.purchaseVoucher.majoration.unit}</span>
                                                                                    </div>
                                                                                    <p class="fs-7 mb-3">${this.purchaseVoucher.majoration.description}</p>
                                                                                    <div class="text-center fs-7 mb-3">${this.langvars.majoration_accepted_message}</div>
                                                                                    <div class="text-center">
                                                                                        <button
                                                                                            type="button"
                                                                                            @click=${() => this.handleMajorationChoice(false)}
                                                                                            class="btn btn-outline-secondary rounded-pill px-4 fs-7">
                                                                                            ${this.langvars.majoration_cancel_decision}
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            `
                                                                            : null
                                                                        }
                                                                    </div>
                                                                `
                                                                : null
                                                            }

                                                            <div class="col-sm-6">
                                                                <div>
                                                                    <label class="mb-2 text-md fw-semibold">${this.langvars.voucher_from} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>

                                                                    <input 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                        .value=${this.purchaseVoucher.formData.gift_from} 
                                                                        name="gift_from" 
                                                                        type="text" 
                                                                        class="form-control form-control-theme text-center"
                                                                        required>
                                                                </div>
                                                            </div>

                                                            <div class="col-sm-6">
                                                                <div>
                                                                    <label class="mb-2 text-md fw-semibold">${this.langvars.voucher_to} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>

                                                                    <input 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                        .value=${this.purchaseVoucher.formData.gift_to} 
                                                                        name="gift_to" 
                                                                        type="text" 
                                                                        class="form-control form-control-theme text-center"
                                                                        required>
                                                                </div>
                                                            </div>

                                                            <div class="col-sm-12">
                                                                <div>
                                                                    <label class="mb-2 text-md fw-semibold">${this.langvars.message}</label>
                                                                    <textarea 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                        .value=${this.purchaseVoucher.formData.gift_reason} 
                                                                        name="gift_reason" 
                                                                        class="form-control form-control-theme rounded-3" 
                                                                        rows="6">
                                                                    </textarea>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div class="text-center mb-4">
                                                            <button type="submit" class="btn btn-primary btn-theme rounded-pill px-5 px-lg-9">${this.langvars.next}</button>
                                                        </div>

                                                    </form>
                                                </div>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseVoucher.formData.currentView == 'library' 
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <div @click="${(e) => this.navigate({direction: 'back'})}" class="d-inline-flex mb-4 cursor-pointer align-items-center px-3 py-2 bg-primary rounded-pill text-white fw-bold gap-1">
                                                    <icon-display icon="arrow-left" size="18px" color="#fff"></icon-display> ${this.langvars.back}
                                                </div>

                                                <div class="row">
                                                    ${(this.displayVouchers || []).map((voucher) => html`
                                                        <div class="col-6 col-sm-4">
                                                            <div @click=${(e) => this.handleVoucherSelect(voucher)} class="voucher-item cursor-pointer">
                                                                <div class="item-img mb-3"><img .src=${voucher.img} class="img-fluid" data-lang=${voucher.lang} data-public=${voucher.public} alt=""></div>
                                                            </div>
                                                        </div>
                                                    `)}
                                                </div>
                                            </div>
                                        ` 
                                        : null
                                    }


                                    ${this.purchaseVoucher.formData.currentView == 'send-gift'
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <div class="col-xl-10 mx-auto">

                                                    <ul class="nav nav-tabs nav-tabs-theme" role="tablist">
                                                        <li class="nav-item col" role="presentation">
                                                            <span @click="${() => this.setDeliveryOption('email')}" class="nav-link ${this.purchaseVoucher.formData.deliveryOption == 'email' ? 'active' : ''}" type="button" role="tab">
                                                                <i class="me-2 fa-lg fa-regular fa-envelope"></i> ${this.langvars.by_email}
                                                            </span>
                                                        </li>
                                                        <li class="nav-item col" role="presentation">
                                                            <span @click="${() => this.setDeliveryOption('post')}" class="nav-link ${this.purchaseVoucher.formData.deliveryOption == 'post' ? 'active' : ''}" type="button" role="tab">
                                                                <i class="me-2 fa-lg fa-regular fa-mailbox"></i> ${this.langvars.by_post}
                                                            </span>
                                                        </li>
                                                    </ul>


                                                    <div class="tab-content">
                                                        ${keyed(this.purchaseVoucher.formData.deliveryOption, html`
                                                            <fade-wrapper type="fade-in">
                                                                ${this.purchaseVoucher.formData.deliveryOption == 'post' 
                                                                    ? html`
                                                                        <div class="tab-pane" id="buy-tab-pane" role="tabpanel" tabindex="0">
                                                                            <div class="px-sm-3 py-4">
                                                                                <div class="mb-5 fs-7 fs-italic text-muted">
                                                                                    <p>
                                                                                        ${unsafeHTML(this.langvars.voucher_post_description)}
                                                                                    </p>
                                                                                </div>

                                                                                <form @submit=${e => {this.setDeliveryOption('post'); this.onProcessFormSubmit(e, {nextProcess: 'payment-section'});}} class="widget-process-form">
                                                                                    <div class="row g-40px">
                                                                                        <div class="col-md-6">
                                                                                            <div>
                                                                                                <label class="mb-2 text-md fw-semibold">${this.langvars.first_name} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>

                                                                                                <input 
                                                                                                    @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                                                    .value=${this.purchaseVoucher.formData.delivery_first_name} 
                                                                                                    name="delivery_first_name" 
                                                                                                    type="text" 
                                                                                                    class="form-control form-control-theme"
                                                                                                    required>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div class="col-md-6">
                                                                                            <div>
                                                                                                <label class="mb-2 text-md fw-semibold">${this.langvars.last_name} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>

                                                                                                <input 
                                                                                                    @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                                                    .value=${this.purchaseVoucher.formData.delivery_last_name} 
                                                                                                    name="delivery_last_name" 
                                                                                                    type="text" 
                                                                                                    class="form-control form-control-theme"
                                                                                                    required>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div class="col-md-6">
                                                                                            <div>
                                                                                                <label class="mb-2 text-md fw-semibold">${this.langvars.delivery_house_number} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>

                                                                                                <input 
                                                                                                    @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                                                    .value=${this.purchaseVoucher.formData.delivery_house_number} 
                                                                                                    name="delivery_house_number" 
                                                                                                    type="text" 
                                                                                                    class="form-control form-control-theme"
                                                                                                    required>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div class="col-md-6">
                                                                                            <div>
                                                                                                <label class="mb-2 text-md fw-semibold">${this.langvars.delivery_street} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>

                                                                                                <input 
                                                                                                    @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                                                    .value=${this.purchaseVoucher.formData.delivery_street} 
                                                                                                    name="delivery_street" 
                                                                                                    type="text" 
                                                                                                    class="form-control form-control-theme"
                                                                                                    required>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div class="col-md-6">
                                                                                            <div>
                                                                                                <label class="mb-2 text-md fw-semibold">${this.langvars.city} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                                                <input 
                                                                                                    @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                                                    .value=${this.purchaseVoucher.formData.delivery_city} 
                                                                                                    name="delivery_city" 
                                                                                                    type="text" 
                                                                                                    class="form-control form-control-theme"
                                                                                                    required>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div class="col-md-6">
                                                                                            <div>
                                                                                                <label class="mb-2 text-md fw-semibold">${this.langvars.postal_code} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                                                <input 
                                                                                                    @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                                                    .value=${this.purchaseVoucher.formData.delivery_pc} 
                                                                                                    name="delivery_pc" 
                                                                                                    type="text" 
                                                                                                    class="form-control form-control-theme"
                                                                                                    required>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div class="col-md-6">
                                                                                            <div>
                                                                                                <label class="mb-2 text-md fw-semibold">${this.langvars.voucher_contact} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>

                                                                                                <input 
                                                                                                    @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                                                    .value=${this.purchaseVoucher.formData.delivery_security_email} 
                                                                                                    name="delivery_security_email" 
                                                                                                    type="text" 
                                                                                                    class="form-control form-control-theme"
                                                                                                    required>

                                                                                                <div class="fs-8 mt-2 fs-italic">
                                                                                                    ${this.langvars.voucher_cc_email} 
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                    </div>

                                                                                    <div class="text-center mb-4 mt-4 mt-sm-6">
                                                                                        <button type="submit" class="btn btn-primary btn-theme rounded-pill px-5 px-lg-9">${this.langvars.next}</button>
                                                                                    </div>
                                                                                </form>
                                                                            </div>
                                                                        </div>
                                                                    ` 
                                                                    : null
                                                                }

                                                                ${this.purchaseVoucher.formData.deliveryOption == 'email' 
                                                                    ? html`
                                                                        <div class="tab-pane" id="profile-tab-pane" role="tabpanel" tabindex="0">
                                                                            <div class="px-sm-3 py-4">
                                                                                <div class="mb-5 fs-7 fs-italic text-muted">
                                                                                    <p>
                                                                                        ${this.langvars.voucher_delivery_planning}
                                                                                    </p>
                                                                                </div>

                                                                                <form @submit=${e => {this.setDeliveryOption('email'); this.onProcessFormSubmit(e, {nextProcess: 'payment-section'})}} class="widget-process-form">

                                                                                    <div class="row g-40px">
                                                                                        <div class="col-sm-6">
                                                                                            <div>
                                                                                                <label class="mb-2 text-md fw-semibold">${unsafeHTML(this.langvars.first_name)} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                                                <input 
                                                                                                    @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                                                    .value=${this.purchaseVoucher.formData.email_first_name} 
                                                                                                    name="email_first_name" 
                                                                                                    type="text" 
                                                                                                    class="form-control form-control-theme"
                                                                                                    required>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div class="col-sm-6">
                                                                                            <div>
                                                                                                <label class="mb-2 text-md fw-semibold">${unsafeHTML(this.langvars.last_name)} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                                                <input 
                                                                                                    @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                                                    .value=${this.purchaseVoucher.formData.email_last_name} 
                                                                                                    name="email_last_name" 
                                                                                                    type="text" 
                                                                                                    class="form-control form-control-theme"
                                                                                                    required>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div class="col-sm-6">
                                                                                            <div>
                                                                                                <label class="mb-2 text-md fw-semibold">${unsafeHTML(this.langvars.plan)}</label>
                                                                                                <input 
                                                                                                    @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                                                    .value=${this.purchaseVoucher.formData.email_planify} 
                                                                                                    name="email_planify" 
                                                                                                    type="datetime-local" 
                                                                                                    class="form-control form-control-theme"
                                                                                                    >
        
                                                                                                    <div class="fs-8 mt-2 fs-italic">
                                                                                                    ${this.langvars.email_planify_helper}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div class="col-sm-6">
                                                                                            <div>
                                                                                                <label class="mb-2 text-md fw-semibold">${unsafeHTML(this.langvars.email_or_tel)} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                                                                <input  
                                                                                                    @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                                                    .value=${this.purchaseVoucher.formData.email_email} 
                                                                                                    name="email_email" 
                                                                                                    type="text" 
                                                                                                    class="form-control form-control-theme"
                                                                                                    required>
                                                                                            </div>
                                                                                        </div>

                                                                                        <div class="col-sm-6">
                                                                                            <div>
                                                                                                <label class="mb-2 text-md fw-semibold">${unsafeHTML(this.langvars.secondary_email)}</label>
                                                                                                <input  
                                                                                                    @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')} 
                                                                                                    .value=${this.purchaseVoucher.formData.email_security_email} 
                                                                                                    name="email_security_email" 
                                                                                                    type="text" 
                                                                                                    class="form-control form-control-theme"
                                                                                                    >

                                                                                                <div class="fs-8 mt-2 fs-italic">
                                                                                                    ${this.langvars.voucher_cc_email}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div class="text-center mb-4 mt-4 mt-sm-6">
                                                                                        <button type="submit" class="btn btn-primary btn-theme rounded-pill px-5 px-lg-9">${this.langvars.next}</button>
                                                                                    </div>
                                                                                </form>

                                                                            </div>
                                                                        </div>
                                                                    ` 
                                                                    : null
                                                                }
                                                            </fade-wrapper>
                                                        `)}
                                                        
                                                    </div>

                                                </div>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseVoucher.formData.currentView == 'payment-section'
                                        ? html`
                                            <div class="px-3 py-4 p-sm-4 p-lg-5">
                                                <div class="col-xl-10 mx-auto">
                                              

                                                    <form @submit=${e => this.onProcessFormSubmit(e, {nextProcess: 'payment-in-progress', action: 'confirm-order'})} class="widget-process-form">
                                                        <div class="mb-1 fw-bold text-md"> ${this.langvars.payment_details} </div>
                                                        <div class="fs-italic fs-8 mb-4"> ${this.langvars.complete_purchase_prompt} </div>
                                                        
                                                        <div class="row g-4">
                                                            <div class="col-sm-6">
                                                                <div class="form-group">
                                                                    <label class="fs-7 mb-2">${this.langvars.first_name} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label> 
                                                                    <input 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')}
                                                                        .value=${this.purchaseVoucher.formData.payment_first_name}
                                                                        name="payment_first_name"
                                                                        type="text" class="form-control form-control-theme" required>
                                                                </div>
                                                            </div>
                                                            <div class="col-sm-6">
                                                                <div class="form-group">
                                                                    <label class="fs-7 mb-2">${this.langvars.last_name} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label> 
                                                                    <input 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')}
                                                                        .value=${this.purchaseVoucher.formData.payment_last_name}
                                                                        name="payment_last_name"
                                                                        type="text" class="form-control form-control-theme" required>
                                                                </div>
                                                            </div>

                                                            <div class="col-12">
                                                                <div class="form-group">
                                                                    <label class="fs-7 mb-2">${this.langvars.email} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label> 
                                                                    <input 
                                                                        @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')}
                                                                        .value=${this.purchaseVoucher.formData.payment_email}
                                                                        name="payment_email"
                                                                        type="email" class="form-control form-control-theme" required>
                                                                </div>
                                                            </div>

                                                            <div class="col-12">
                                                                <div class="form-check">
                                                                    <label class="form-check-label m-0 fs-5">
                                                                        <input 
                                                                            @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')}
                                                                            .value=${this.purchaseVoucher.formData.payment_}
                                                                            .checked=${this.purchaseVoucher.formData.get_billing_form}
                                                                            name="get_billing_form" type="checkbox" class="form-check-input"> 
                                                                        <span class="fs-6">${this.langvars.i_want_invoice}</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                           

                                                            ${this.purchaseVoucher.formData.get_billing_form ? 
                                                                html`
                                                                    <div class="col-12">
                                                                        <div class="mb-1 fw-bold text-md">${this.langvars.billing_information}</div>
                                                                    </div>
                                                                    
                                                                    <div class="col-sm-6">
                                                                        <div class="form-group">
                                                                            <label class="fs-7 mb-2">${this.langvars.company}</label> 
                                                                            <input 
                                                                                @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')}
                                                                                .value=${this.purchaseVoucher.formData.payment_billing_company}
                                                                                name="payment_billing_company"
                                                                                type="text" value="" class="form-control form-control-theme">
                                                                        </div>
                                                                    </div>

                                                                    <div class="col-sm-6">
                                                                        <div class="form-group">
                                                                            <label class="fs-7 mb-2">${this.langvars.company_number}</label> 
                                                                            <input 
                                                                                @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')}
                                                                                .value=${this.purchaseVoucher.formData.payment_billing_vatNumber}
                                                                                name="payment_billing_vatNumber"
                                                                                type="text" value="" class="form-control form-control-theme">
                                                                        </div>
                                                                    </div>

                                                                    <div class="col-sm-12">
                                                                        <div class="form-group">
                                                                            <label class="fs-7 mb-2">${this.langvars.address}</label> 
                                                                            <input 
                                                                                @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')}
                                                                                .value=${this.purchaseVoucher.formData.payment_billing_address}
                                                                                name="payment_billing_address"
                                                                                type="text" value="" class="form-control form-control-theme">
                                                                        </div>
                                                                    </div>

                                                                    <div class="col-md-6">
                                                                        <div class="form-group">
                                                                            <label class="fs-7 mb-2">${this.langvars.postal_code}</label> 
                                                                            <input 
                                                                                @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')}
                                                                                .value=${this.purchaseVoucher.formData.payment_billing_pc}
                                                                                name="payment_billing_pc"
                                                                                type="text" value="" class="form-control form-control-theme">
                                                                        </div>
                                                                    </div>
                                                                    <div class="col-md-6">
                                                                        <div class="form-group">
                                                                            <label class="fs-7 mb-2">${this.langvars.city}</label> 
                                                                            <input 
                                                                                @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')}
                                                                                .value=${this.purchaseVoucher.formData.payment_billing_city}
                                                                                name="payment_billing_city"
                                                                                type="text" value="" class="form-control form-control-theme">
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div class="col-sm-12">
                                                                        <div class="form-group">
                                                                            <label class="fs-7 mb-2">${this.langvars.country}</label> 
                                                                            <select 
                                                                                @change=${(e) => this.onInputChange(e, 'purchaseVoucher.formData')}
                                                                                .value=${this.purchaseVoucher.formData.payment_billing_fk_countries}
                                                                                name="payment_billing_fk_countries"
                                                                                class="form-select form-control form-control-theme">
                                                                                <option value=""></option>
                                                                                <option value="de">Allemagne</option>
                                                                                <option value="be">Belgique</option>
                                                                                <option value="bg">Bulgarie</option>
                                                                                <option value="es">Espagne</option>
                                                                                <option value="fr">France (Métro. et Corse)</option>
                                                                                <option value="lu">Luxembourg</option>
                                                                                <option value="nl">Pays-Bas</option>
                                                                                <option value="ch">Suisse</option>
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                `:
                                                                null
                                                            }
                                                        </div>

                                                        <br>
                                                        <br>

                                                        <div class="order-summary-table mb-4 p-3 rounded-3" style="background-color: #eff3f4;">
                                                            <table class="table table-borderless fs-md table-theme-1 mb-0">
                                                                <tbody>
                                                                    <tr>
                                                                        <td class="bg-transparent">${this.langvars.check} (<span class="fs-7">${this.purchaseVoucher.formData.voucher_qty}</span>)</td> 
                                                                        <td class="bg-transparent"><span class="d-block fw-semibold text-end">${this.formattedVouchersTotal()}</span></td>
                                                                    </tr> 
                                                                    ${this.purchaseVoucher.formData.majoration_accepted
                                                                        ? html`
                                                                            <tr>
                                                                                <td class="bg-transparent">${this.langvars.majoration} (<span class="fs-7">${this.purchaseVoucher.formData.voucher_qty} x ${this.formatCurrency(this.computeMajorationBonus())}</span>)</td>
                                                                                <td class="bg-transparent">
                                                                                    <span class="d-block fw-semibold text-end">
                                                                                        <span class="fs-7 fw-normal">${this.langvars.majoration_voucher_worth}:</span> ${this.formatCurrency(Number(this.purchaseVoucher.formData.voucher_value) + this.computeMajorationBonus())}
                                                                                        ${(() => {
                                                                                            const qty = Number(this.purchaseVoucher.formData.voucher_qty);
                                                                                            const maxqty = Number(this.purchaseVoucher.majoration?.maxqty);
                                                                                            return maxqty > 0 && qty > maxqty
                                                                                                ? html`<br><span class="fs-8 text-muted fst-italic">${this.langvars.majoration_partial?.replace('{n}', maxqty).replace('{total}', qty)}</span>`
                                                                                                : null;
                                                                                        })()}
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        `
                                                                        : null
                                                                    }
                                                                    <tr>
                                                                        <td class="bg-transparent">${this.langvars.delivery_cost} (<span class="fs-7">${this.purchaseVoucher.formData.voucher_qty} x ${this.formatCurrency(this.purchaseVoucher.premiumAddonValue)}</span>)</td> 
                                                                        <td class="bg-transparent"> <span class="d-block fw-semibold text-end"> ${this.purchaseVoucher.formData.deliveryOption == 'post' ?  this.formatCurrency(this.purchaseVoucher.formData.voucher_qty * this.purchaseVoucher.premiumAddonValue) : '0.00 €'} </span> </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table> 
                                                            <hr class="m-2"> 
                                                            <div class="d-flex fw-bold fs-md px-2 py-2">
                                                                <div>${this.langvars.total}</div>
                                                                <div class="ms-auto"> ${this.formattedTotal()}</div>
                                                            </div>
                                                            
                                                        </div>    

                                                        <br>

                                                        <h6 class="mb-1 fw-bold text-md">${this.langvars.payment_method_prompt}</h6>

                                                        <p>${this.langvars.redirect_notice}</p>

                                                        <div class="d-flex flex-wrap flex-column flex-sm-row gap-3 mb-5">
                                                            <div class="col">
                                                                <div class="form-check form-check-theme">
                                                                    <label class="form-check-label">
                                                                        <input 
                                                                            @change="${(e) => this.onInputChange(e, 'purchaseVoucher.formData')}" 
                                                                            value="bancontact" 
                                                                            .checked="${this.purchaseVoucher.formData.payment_method == 'bancontact'}" 
                                                                            name="payment_method" 
                                                                            class="form-check-input" type="radio"
                                                                            required>
                                                                        <span class="form-theme-input py-10px rounded fw-semibold d-flex justify-content-start gap-3 px-3 px-md-40px py-3" style="height: 69px;"><img src="${basePath}img/Payconiq.svg" style="height: 47px; width: 84px;" alt=""> Bancontact</span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <div class="col">
                                                                <div class="form-check form-check-theme">
                                                                    <label class="form-check-label">
                                                                        <input 
                                                                            @change="${(e) => this.onInputChange(e, 'purchaseVoucher.formData')}" 
                                                                            value="card" 
                                                                            .checked="${this.purchaseVoucher.formData.payment_method == 'card'}" 
                                                                            name="payment_method" 
                                                                            class="form-check-input" type="radio"
                                                                            required>
                                                                        <span class="form-theme-input py-10px rounded fw-semibold d-flex justify-content-start gap-3 px-3 px-md-40px py-3" style="height: 69px;"><img src="${basePath}img/VISA-MC.svg" style="height: 27px; width: 84px;" alt=""> ${this.langvars.payment_card} </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        ${this.mode !== 'dev'
                                                            ? html `
                                                                <div class="text-center">
                                                                    <button type="submit" .disabled="${this.purchaseVoucher.formData.payment_method == undefined}"  class="btn btn-primary btn-theme rounded-pill px-5 px-lg-9">${this.langvars.complete_order}</button>

                                                                    <div class="fs-8 mt-4">
                                                                        ${this.langvars.payment_secure} <span class="text-info">${this.langvars.ssl_notice}.</span>
                                                                    </div>
                                                                </div>
                                                            `
                                                            : html`
                                                                <div class="text-center">
                                                                    Last step is disabled in dev mode.
                                                                </div>
                                                            `
                                                        }

                                                    </form>

                                                    <div class="text-center mt-7">
                                                        <img src="${basePath}img/bc-logo-round-1.svg" class="img-fluid" alt="">
                                                    </div>
                                                </div>
                                            </div>
                                        ` 
                                        : null
                                    }

                                    ${this.purchaseVoucher.formData.currentView == 'payment-in-progress'
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <div class="p-3 bg-gray-2 py-4 text-center rounded-2">
                                                    <h4 class="fw-bold">${unsafeHTML(this.langvars.payment_in_progress)}</h4>
                                                    <p class="m-0">${unsafeHTML(this.langvars.waiting_payment_confirmation)}</p>

                                                    <div class="mt-5 mini-loader mx-auto"></div>

                                                    <div class="mt-5">
                                                        <a href="#" class="d-flex justify-content-center align-items-center gap-2 fs-6">
                                                            <icon-display icon="circle-question" size="18" color="var(--bs-primary)"></icon-display>
                                                            <span class="mt-1">${unsafeHTML(this.langvars.order_help)}</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.purchaseVoucher.formData.currentView == 'success'
                                        ? html`
                                            <div class="success-tab-content d-flex flex-column h-100">
                                                <div class="p-4 p-sm-5">
                                                    <div class="text-center text-md">
                                                        <div class="mb-4">
                                                            <lottie-wrapper .loop=${false} src="${basePath}img/lottie/success.json" class="mx-auto" style="height: 220px"></lottie-wrapper>
                                                        </div>

                                                        <div class="mb-4">
                                                            <h5 class="fw-bold">${this.langvars.thank_you}, ${this.purchaseVoucher.formData.firstName}.</h5>
                                                        </div>

                                                        <p>
                                                            ${this.langvars.confirmation_msg_voucher}
                                                        </p>

                                                        <div class="mt-4 d-flex justify-content-center">
                                                            <div @click=${(e) => this.reset()} class="cursor-pointer text-underline fs-6 fw-bold text-primary">${this.langvars.purchase_another_voucher}</div>
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

                                    ${this.purchaseVoucher.formData.currentView == 'error'
                                        ? html`
                                            <div class="d-flex flex-column h-100">
                                                <div class="p-4 p-sm-5">
                                                    <div class="text-center text-md">
                                                        ${unsafeHTML(this.langvars.error)}
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

                    <confirm-dialog
                        .open=${this.showMajorationEmailDialog}
                        .title=${this.langvars.majoration_email_title}
                        .onAccept=${() => this.confirmMajorationEmail()}
                        .onCancel=${() => { this.showMajorationEmailDialog = false; }}
                        @close=${() => { this.showMajorationEmailDialog = false; }}
                    >
                        <p class="mb-3">${this.langvars.majoration_email_desc}</p>
                        <input 
                            type="email"
                            class="form-control form-control-theme"
                            placeholder="${this.langvars.email}"
                            .value=${this.majorationEmail}
                            @input=${(e) => { this.majorationEmail = e.target.value; }}
                        >
                        ${this.majorationEmail && !this.majorationEmail.includes('@')
                            ? html`<div class="text-danger fs-7 mt-1">${this.langvars.majoration_email_invalid}</div>`
                            : null
                        }
                    </confirm-dialog>
                </div>
            </div>
        `
    }

    firstUpdated() {
        // On input: just keep the raw number (and allow empty input)
        this.renderRoot.addEventListener('input', (event) => {
            if (event.target && event.target.classList.contains('currencyInput')) {
                let value = event.target.value.replace(/[^\d.]/g, '');
                event.target.value = value;
            }
        });

        // On blur: append the € symbol if there's a value
        this.renderRoot.addEventListener('blur', (event) => {
            if (event.target && event.target.classList.contains('currencyInput')) {
                if (event.target.value) {
                    event.target.value += ' €';
                }
            }
        }, true);

        // On focus: remove the € symbol so user can edit
        this.renderRoot.addEventListener('focus', (event) => {
            if (event.target && event.target.classList.contains('currencyInput')) {
                event.target.value = event.target.value.replace(' €', '');
            }
        }, true);


        this.renderRoot.addEventListener("click", (event) => {
            if (event.target && event.target.classList.contains('currencyInput')) {
                event.target.select();
            }

            if (event.target.closest(".voucher-preview")) {
              this.renderRoot.querySelector(".voucher-preview").classList.toggle("flip");
            }

            if (event.target.closest(".btn-panel-window-toggle")) {
                this.isPanelMaximized = !this.isPanelMaximized;

                this.dispatchEvent(new CustomEvent("panel-window-toggle", {
                    detail: {isPanelMaximized: this.isPanelMaximized},
                    bubbles: true,
                    composed: true,
                }))
            }
        });

       

        // console.log(this.purchaseVoucher);
    }

    updated(changedProps) {
        // console.log(changedProps);
        // console.log(changedProps.get("purchaseVoucher")?.hasSuggestions);
        // console.log(this.purchaseVoucher?.hasSuggestions);
        // if (changedProps.get("purchaseVoucher")?.hasSuggestions !== this.purchaseVoucher?.hasSuggestions) {
        //     // this.purchaseVoucher.formData.currentView = this.purchaseVoucher.hasSuggestions ? "suggestions" : 'gift-details';
        //     this.purchaseVoucher = {...this.purchaseVoucher, currentView: this.purchaseVoucher.hasSuggestions ? "suggestions" : 'gift-details'}
        //     console.log(this.purchaseVoucher.hasSuggestions ? "suggestions" : 'gift-details');
        //     console.log(this.purchaseVoucher.formData.currentView);
        // }
        // this.purchaseVoucher.formData.currentView = this.purchaseVoucher.hasSuggestions ? "gift-details" : 'suggestions';
    }

    async initialize() {
        // await this.getVouchers();

        this.purchaseVoucher.formData.selectedVoucher = this.purchaseVoucher.formData.selectedVoucher 
            ? this.purchaseVoucher.formData.selectedVoucher 
            : this.displayVouchers[0];
        
        const defaultView = this.purchaseVoucher.hasSuggestions ? "suggestions" : "gift-details";

        this.purchaseVoucher.formData.currentView = this.purchaseVoucher.formData.currentView || defaultView;
        this.purchaseVoucher.formData.viewHistory[0] = defaultView;

        this.requestUpdate();

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

    }

    stopPolling() {
        if (this._verifyInterval) {
            clearInterval(this._verifyInterval);
            this._verifyInterval = null;
        }
    }

    async _pollVerify() {
        try {
            await this.verifyCheckout();
            // verifyCheckout() handles navigation + stopping
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
            context: "purchaseVoucher",
        };

        const params = new URLSearchParams(data);

        const url = this.isLocal 
            ? '/mock-data/checkout-success.json' 
            : basePath + 'calls.php';
        
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
            const code = result.endpoint.code;

            switch (code) {
                case 1:
                    // Success - payment confirmed
                    this.stopPolling();
                    this.navigate({view: "success"});
                    break;

                case 2:
                    // Waiting - still processing webhook
                    this.navigate({view: "payment-in-progress"});
                    // Keep polling
                    break;

                case 3:
                    // Canceled - user went back or session expired
                    this.stopPolling();
                    this.navigate({view: "payment-section"});
                    break;

                case -1:
                    // Error - payment failed
                    this.stopPolling();
                    this.navigate({view: "error"});
                    break;

                default:
                    this.navigate({view: "error"});
                    break;
            }

            return result.endpoint;

        } catch (error) {
            console.error("Error verifying checkout:", error);

            if (this.mode === "dev") {
                try {
                    const response = await fetch('/mock-data/checkout-success.json');
                    const result = await response.json();

                    if (result.code === 1) {
                        this.stopPolling();
                        this.navigate({view: "success"});
                    } else if (result.code === -1) {
                        this.stopPolling();
                        this.navigate({view: "error"});
                    }

                    return result;
                } catch (devError) {
                    console.error("Dev fallback error:", devError);
                }
            }

            throw error;
        }
    }

    async getCheckout() {
        const data = {
            action: "getCheckout",
            uid: this.uid,
            pk: this.publicKey,
            context: "purchaseVoucher",
            formData:  JSON.stringify(this.purchaseVoucher.formData),
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
            window.location.href = result.endpoint.url;
            // console.log("result", result.endpoint.url);
            this.isLocal && console.log(result);
            
        } catch (error) {
            console.error("Error:", error);

            if (this.mode == "dev") {
                console.log("fallback dev");
                let response = await fetch('/mock-data/getCheckout.json');
                let result = await response.json();

                window.location.href = result.url;
            }
        }
    }

    reset() {
        const defaultView = this.purchaseVoucher.hasSuggestions ? "suggestions" : "gift-details";

        this.purchaseVoucher = {
            ...this.purchaseVoucher,
            formData: {
                isPanelActive: true,
                viewHistory: [defaultView],
                currentView: defaultView,
                selectedSuggestion: undefined,
                selectedVoucher: this.displayVouchers[0],
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
            }
        }

        this.handleUpdateState();
    }

    async getVouchers() {
        const data = {
            action: "getVoucherDesigns",
            uid: this.uid,
            pk: this.publicKey,
        };
      
        const params = new URLSearchParams(data);

        const url = this.isLocal ? '/mock-data/getVoucherDesigns.json' : basePath+'calls.php';
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

            this.purchaseVoucher = {...this.purchaseVoucher, vouchers: result?.endpoint}

            this.handleUpdateState();
        } catch (error) {
            console.error("Error fetching business data:", error);
        }
    }

    get defaultVoucherImage() {
        if (this.purchaseVoucher?.formData?.selectedVoucher) {
            return this.purchaseVoucher.formData.selectedVoucher.img;
        }

        return this.displayVouchers[0]?.img || '';
    }

    get displayVouchers() {
        const privateVouchers = this.purchaseVoucher?.vouchers.filter(
            voucher => voucher.public === '0' && (voucher.lang == this.lang || voucher.lang == 'all')
        );

        const publicVouchers = this.purchaseVoucher?.vouchers.filter(
            voucher => voucher.public === '1' && (voucher.lang == this.lang || voucher.lang == 'all')
        );

        if (this.purchaseVoucher.hasLibrary && privateVouchers?.length) {
            return privateVouchers;
        }

        return publicVouchers;
    }

    resetMajorationChoice() {
        this.purchaseVoucher = {
            ...this.purchaseVoucher,
            formData: {
                ...this.purchaseVoucher.formData,
                majoration_accepted: null,
                majoration_id: null,
                majoration_email: "",
            }
        };
        this.handleUpdateState();
    }

    handleMajorationChoice(accepted) {
        if (!accepted) {
            this.purchaseVoucher = {
                ...this.purchaseVoucher,
                formData: {
                    ...this.purchaseVoucher.formData,
                    majoration_accepted: false,
                    majoration_id: null,
                    majoration_email: "",
                }
            };
            this.handleUpdateState();
            return;
        }

        this.majorationEmail = '';
        this.showMajorationEmailDialog = true;
    }

    async confirmMajorationEmail() {
        const email = this.majorationEmail?.trim();
        this.showMajorationEmailDialog = false;

        console.log(!email || !email.includes('@'));
        if (!email || !email.includes('@')) {
            setTimeout(() => {
                console.log(BcDialog._host);
                BcDialog.alert(this.langvars.majoration_email_invalid, null, { host: this });
            }, 150);
            return;
        }

        try {
            const response = await fetch(basePath + 'calls.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    action: 'verifyMajorationEmail',
                    uid: this.uid,
                    pk: this.publicKey,
                    email: email,
                })
            });
            const result = await response.json();

             if (!result.endpoint.valid) {
                setTimeout(() => {
                    BcDialog.alert(this.langvars.majoration_email_invalid, null, { host: this });
                }, 150);
                return;
            }
        } catch (error) {
            console.error('verifyMajorationEmail error:', error);
        }

        this.purchaseVoucher = {
            ...this.purchaseVoucher,
            formData: {
                ...this.purchaseVoucher.formData,
                majoration_accepted: true,
                majoration_id: this.purchaseVoucher.majoration.id,
                majoration_email: email,
            }
        };
        this.handleUpdateState();

        setTimeout(() => {
            BcDialog.alert(this.langvars.majoration_email_confirmed_message, null, { host: this });
        }, 150);
    }

    computeMajorationBonus() {
        const m = this.purchaseVoucher.majoration;
        const amount = Number(this.purchaseVoucher.formData.voucher_value);
        if (!m || amount < Number(m.min)) return 0;

        if (Number(m.per) > 0) {
            const brackets = Math.floor(amount / Number(m.per));
            if (m.unit === '%') return brackets * (Number(m.per) * Number(m.value) / 100);
            return brackets * Number(m.value);
        }

        // per = 0, flat bonus
        if (m.unit === '%') return amount * (Number(m.value) / 100);
        return Number(m.value);
    }

    async onProcessFormSubmit(e, payload) {
        e.preventDefault();

        if (payload.action) {
            switch(payload.action) {
                case "confirm-order":
                    this.navigate({view: payload.nextProcess});
                    
                    this.handleUpdateState();

                    setTimeout(async () => {
                        await this.getCheckout();
                    }, 2000);

                    break;
                
                default: 
                    break;
            }
        } else {
            if (payload.nextProcess) {
                this.navigate({view: payload.nextProcess});
            }
        }

        // this.handleUpdateState();
        // console.log(this.purchaseVoucher.formData);
    }

    // functions
    navigate(payload) {
        if (payload?.direction == 'back') {
            this.purchaseVoucher.formData.viewHistory.pop();
        } else {
            this.purchaseVoucher.formData.viewHistory.push(payload.view);
        }

        this.purchaseVoucher = {...this.purchaseVoucher, formData: {...this.purchaseVoucher.formData, currentView: this.purchaseVoucher.formData.viewHistory.at(-1)}};
        this.handleUpdateState();
        
        this.renderRoot.querySelector(".panel-scroll-area").scrollTop = 0;
    };

    setDeliveryOption(option) {
        this.purchaseVoucher = { 
            ...this.purchaseVoucher, 
            formData: { 
                ...this.purchaseVoucher.formData, 
                deliveryOption: option 
            } 
        }
        // this.purchaseVoucher.formData.deliveryOption = option;
        // this.requestUpdate();
    }

    handleSuggestionSelect(suggestion) {
        this.purchaseVoucher.formData.selectedSuggestion = suggestion;

        if (suggestion !== undefined) {
            
            this.purchaseVoucher.formData.voucher_value = suggestion.value;
        }
        // this.requestUpdate();

        this.navigate({view: 'gift-details'});
        setTimeout(() => {
            this.renderRoot.querySelector(".currencyInput").dispatchEvent(new InputEvent('blur', {
                bubbles: true,
                composed: true,
                cancelable: false
            }))
        }, 150)

    }

    handleVoucherSelect(voucher) {
        this.purchaseVoucher.formData.selectedVoucher = voucher;
        this.requestUpdate();

        this.navigate({view: 'gift-details'});
    }

    onInputChange(e, propName) {
        const { name, value, type, checked, options } = e.target;
        // 1) full path = propName segments + name segments
        const fullPath = [...propName.split('.'), ...name.split('.')];
        // 2) the top‐level property on `this` is the first segment…
        const root = fullPath.shift();            // e.g. "parent"
        // 3) shallow‐clone that top‐level prop
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
        // 6) re‑assign and request update
        this[root] = updated;
        this.requestUpdate(root, updated);

        // reset majoration if voucher_value drops below minimum
        if (name === 'voucher_value' && this.purchaseVoucher.majoration) {
            const amount = Number(value);
            const min = Number(this.purchaseVoucher.majoration.min);
            if (amount < min && this.purchaseVoucher.formData.majoration_accepted !== null) {
                this.purchaseVoucher = {
                    ...this.purchaseVoucher,
                    formData: {
                        ...this.purchaseVoucher.formData,
                        majoration_accepted: null,
                        majoration_id: null,
                        majoration_email: "",
                    }
                };
            }
        }

        this.handleUpdateState();
    }

    handleQtyChange(payload) {
        const { input, action } = payload;
        const currentValue = Number(this.purchaseVoucher?.formData?.[input]) || 0;
    
        let newValue = currentValue;
        if (action === 'dec') {
            newValue = Math.max(0, currentValue - 1); // prevent negative values
        } else if (action === 'inc') {
            newValue = currentValue + 1;
        } else {
            return; // invalid action, exit early
        }
    
        this.purchaseVoucher = {
            ...this.purchaseVoucher,
            formData: {
                ...this.purchaseVoucher.formData,
                [input]: newValue
            }
        };

    }

    handleClosePanel() {
        this.dispatchEvent(new CustomEvent("panel-closed", {
            detail: { name: "purchaseVoucher" },
            bubbles: true,
            composed: true,
        }))
       
        // this.handleUpdateState();
    }


    handleUpdateState() {
        // console.log(this.purchaseVoucher);
        this.dispatchEvent(new CustomEvent("update-state", {
            detail: {data: this.purchaseVoucher, name: 'purchaseVoucher'},
            bubbles: true,
            composed: true
        }));
    }

    dev_hasSuggestions(e) {
        this.purchaseVoucher.hasSuggestions = e.target.checked;
        this.purchaseVoucher.formData.currentView = e.target.checked ? 'suggestions' : 'gift-details';
        this.requestUpdate();
    }

    formattedVouchersTotal() {
        return this.formatCurrency(this.purchaseVoucher.formData.voucher_value * this.purchaseVoucher.formData.voucher_qty)
    }

    formattedTotal() {
        const vouchersTotal = this.purchaseVoucher.formData.voucher_value * this.purchaseVoucher.formData.voucher_qty;
        const total = vouchersTotal + (this.purchaseVoucher.formData.deliveryOption == 'post' ? this.purchaseVoucher.premiumAddonValue * this.purchaseVoucher.formData.voucher_qty : 0);
        return this.formatCurrency(total);
    }

    formattedMajorationBonus() {
        const qty = Number(this.purchaseVoucher.formData.voucher_qty);
        const maxqty = Number(this.purchaseVoucher.majoration?.maxqty);
        const majoratedQty = maxqty > 0 ? Math.min(qty, maxqty) : qty;
        return this.formatCurrency(this.computeMajorationBonus() * majoratedQty);
    }

    formatCurrency(value) {
        if (!value)
            return "0,00 €";
        return new Intl.NumberFormat('fr-BE', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    }
}

customElements.define("purchase-voucher-component", purchaseVoucherComponent);