import { LitElement, html, css, keyed, unsafeHTML } from "/vendors/lit/lit-all.min.js";
import "../components/ui-components/date-picker.js"

const pageOrigin = window.location.origin;
const scriptOrigin = new URL(import.meta.url).origin;

const isSameDomain = pageOrigin === scriptOrigin;

// Dynamic base paths based on origin check
const basePath = isSameDomain ? './' : 'https://widget.boncado.be/';

class bookTable extends LitElement {

    _verifyInterval = null;

    static shadowRootOptions = { mode: 'open', delegateFocus: true};

    static properties = {
        langvars: { type: Object },
        lang: { type: String },
        bookTable: { type: Object },
        isPanelMaximized: {type: Boolean},
    }

    

    constructor() {
        super();

        this.isPanelMaximized = false;
    }

    createRenderRoot() {
        return this;
    }

    render() {
        return html`
            <div class="${this.isPanelMaximized ? 'panel-maximize': ''} book-resto-screen bc-widget-screen d-flex flex-column">
                <div class="panel-top-bar">
                    <div class="panel-actions d-flex align-items-center p-3">    
                        ${!["guests-count", "success", "payment-in-progress", "error"].includes(this.bookTable.formData.currentView)
                            ? html`
                                <div @click="${(e) => this.navigate({direction: 'back'})}" class="p-1 cursor-pointer">
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

                    ${!["success", "error", "payment-in-progress"].includes(this.bookTable.formData.currentView) ? html`
                            <div class="progress-bar-container d-flex">
                                <div class="col progress-bar-partition ${this.bookTable.formData.currentView == 'guests-count' ? 'active': null}">
                                    <div class="_progress-bar"></div>
                                </div>
                                <div class="col progress-bar-partition ${this.bookTable.formData.currentView == 'date-picker' ? 'active': null}">
                                    <div class="_progress-bar"></div>
                                </div>
                                <div class="col progress-bar-partition ${this.bookTable.formData.currentView == 'available-hours' ? 'active': null}">
                                    <div class="_progress-bar"></div>
                                </div>
                                <div class="col progress-bar-partition ${this.bookTable.formData.currentView == 'meal-plan' ? 'active': null}">
                                    <div class="_progress-bar"></div>
                                </div>
                                <div class="col progress-bar-partition ${this.bookTable.formData.currentView == 'personal-info' ? 'active': null}">
                                    <div class="_progress-bar"></div>
                                </div>
                                <div class="col progress-bar-partition ${this.bookTable.formData.currentView == 'confirmation' ? 'active': null}">
                                    <div class="_progress-bar"></div>
                                </div>
                                <div class="col progress-bar-partition ${this.bookTable.formData.currentView == 'payment-section' ? 'active': null}">
                                    <div class="_progress-bar"></div>
                                </div>
                                <div style="width: 50px;"></div>
                            </div>
                        `
                        : null
                    }

                </div>

                <div class="panel-scroll-area">
                    <div class="panel-head">
                        <div class="panel-head-inner pt-2 pb-3">
                            ${keyed(this.bookTable.formData.currentView, html`
                                <fade-wrapper type="fade-in">
                                    ${this.bookTable.formData.currentView == 'guests-count' || this.bookTable.formData.currentView == 'date-picker'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${unsafeHTML(this.langvars.grab_seat)}</h4>
                                                <div class="fs-6 fw-md">
                                                    <p>
                                                        ${unsafeHTML(this.langvars.motivation)}
                                                    </p>
                                                </div>
                                            </div>
                                        ` 
                                        : null}

                                    ${this.bookTable.formData.currentView == 'available-hours'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${unsafeHTML(this.langvars.time_slot)}</h4>
                                                <div class="fs-6 fw-md">
                                                    <p>
                                                        ${unsafeHTML(this.langvars.choose_hour)}
                                                    </p>
                                                </div>
                                            </div>
                                        `
                                        : null}

                                    ${this.bookTable.formData.currentView == 'meal-plan'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${unsafeHTML(this.langvars.what_your_pmeal_plan)}</h4>
                                                <div class="fs-6 fw-md">
                                                    <p>
                                                        ${unsafeHTML(this.langvars.what_your_pmeal_plan_desc)}
                                                    </p>
                                                </div>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.bookTable.formData.currentView == 'personal-info'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${unsafeHTML(this.langvars.almost_there)}</h4>
                                                <div class="fs-6 fw-md">
                                                    <p>
                                                        ${unsafeHTML(this.langvars.identity_prompt)}
                                                    </p>
                                                </div>
                                            </div>    
                                        `
                                        : null
                                    }

                                    ${this.bookTable.formData.currentView == 'confirmation'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${unsafeHTML(this.langvars.are_correct)}</h4>
                                                <div class="fs-6 fw-md">
                                                    <p>
                                                        ${unsafeHTML(this.langvars.review_prompt)}
                                                    </p>
                                                </div>
                                            </div>
                                            `
                                        : null
                                    }

                                    ${this.bookTable.formData.currentView == 'payment-section'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${this.langvars.deposit_required}</h4>
                                                <div class="fs-6 fw-md">
                                                    <p></p>
                                                </div>
                                            </div>
                                            `
                                        : null
                                    }

                                    ${this.bookTable.formData.currentView == 'payment-in-progress'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${this.langvars.payment_confirmation}</h4>
                                                
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.bookTable.formData.currentView == 'error'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${this.langvars.error}</h4>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.bookTable.formData.currentView == 'success' 
                                        ? html`
                                            <div class="success-tab-content">
                                                <div class="px-4 text-center">
                                                    <h4 class="fw-bold title-font">${unsafeHTML(this.langvars.success)}!</h4>
                                                </div>
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
                            ${keyed(this.bookTable.formData.currentView, html`
                                <fade-wrapper type="fade-in">
                                    ${this.bookTable.formData.currentView == 'guests-count'
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <form @submit=${e => this.onProcessFormSubmit(e, {nextProcess: 'date-picker'})} class="widget-process-form">
                                                    <div class="mb-5">
                                                        <label class="mb-3 text-md fw-semibold">${this.langvars.guest_count}</label>

                                                        <div class="guests-count-group row g-2 mb-4">
                                                            ${[...Array(9)].map(
                                                                (_, i) => html`
                                                                    <div class="group-item col-2">
                                                                        <div class="form-check form-check-theme h-100 w-100">
                                                                            <label class="form-check-label h-100 w-100">
                                                                            <input
                                                                                @change="${(e) => (this.bookTable = {...this.bookTable, formData: {...this.bookTable.formData, guests_count: (i + 1)}})}"
                                                                                class="form-check-input"
                                                                                type="radio"
                                                                                name="guests-count"
                                                                                .value="${i + 1}"
                                                                                .checked="${this.bookTable.formData.guests_count == (i + 1)}"
                                                                                required/>
                                                                                <span class="form-theme-input btn">
                                                                                    ${i + 1}
                                                                                </span>
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                `
                                                            )}

                                                            <div class="group-item col-2">
                                                                <div class="form-check form-check-theme h-100 w-100">
                                                                    <label class="form-check-label h-100 w-100">
                                                                    <input
                                                                        @change="${(e) => (this.bookTable = {...this.bookTable, formData: {...this.bookTable.formData, guests_count: 10}})}"
                                                                        class="form-check-input"
                                                                        type="radio"
                                                                        name="guests-count"
                                                                        value="10"
                                                                        .checked="${this.bookTable.formData.guests_count >= 10}"
                                                                        required/>
                                                                        <span class="form-theme-input btn">
                                                                            <icon-display icon="times" size="18px" class="rotate-45 d-block"></icon-display>
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        ${this.bookTable.formData.guests_count >= 10 
                                                            ? html`
                                                                <div class="d-flex align-items-center gap-3 mb-3">
                                                                    <div class="col border-1 border-top"></div>
                                                                    <div class="text-center text-uppercase fw-semibold fs-7">${this.langvars.more}</div>
                                                                    <div class="col border-1 border-top"></div>
                                                                </div>


                                                                <div class="qty-input-group input-group">
                                                                    <button @click="${(e) => (this.bookTable = {...this.bookTable, formData: {...this.bookTable.formData, guests_count: this.bookTable.formData.guests_count - 1}})}" .disabled="${this.bookTable.formData.guests_count == 1}" class="btn btn-outline-secondary decrease" type="button"> - </button>
                                                                    <input @change="${(e) => this.onInputChange(e, 'bookTable.formData')}" .value="${this.bookTable.formData.guests_count}" type="number" class="form-control form-control-theme text-center quantity" min="1" />
                                                                    <button @click="${(e) => (this.bookTable = {...this.bookTable, formData: {...this.bookTable.formData, guests_count: this.bookTable.formData.guests_count + 1}})}" class="btn btn-outline-secondary increase" type="button"> + </button>
                                                                </div>
                                                            `
                                                            : null
                                                        }
                                                    </div>

                                                    <button type="submit" class="btn btn-primary btn-theme rounded-pill w-100">${this.langvars.check_availability}</button>
                                                </form>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.bookTable.formData.currentView == 'date-picker' 
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <div class="mb-40px">
                                                    <label class="mb-3 text-md fw-semibold">${this.langvars.day_select}</label>
                                                    <date-picker
                                                        @date-selected="${(e) => {
                                                            this.bookTable.formData.reservationDate = e.detail.date;
                                                            this.getAvailableHours();
                                                        }}"
                                                        selected-date=${this.bookTable.formData.reservationDate !== "" ? this.bookTable.formData.reservationDate : null}
                                                        excluded-dates='["2025-07-16","2025-07-23"]'
                                                        excluded-weekdays='[0,1]'
                                                        >
                                                    </date-picker>
                                                </div>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.bookTable.formData.currentView == 'available-hours'
                                        ? html`
                                            <div class="d-flex flex-column p-4 p-sm-5 h-100">
                                                <div class="text-center text-md mb-40px">
                                                    ${this.langvars.available_slots}
                                                    <br><span class="fw-bold text-primary text-underline">${this.getFormattedReservationDate('bookTable')}</span>
                                                </div>

                                                <form @submit=${e => this.onProcessFormSubmit(e, {nextProcess: 'meal-plan'})} class="widget-process-form">
                                                    <div class="d-flex justify-content-center flex-wrap gap-10px mb-5">
                                                        ${(this.bookTable?.formData?.availableHours || []).map(
                                                            (hour) => html`
                                                            <div class="form-check form-check-theme">
                                                                <label class="form-check-label">
                                                                <input
                                                                    class="form-check-input"
                                                                    type="radio"
                                                                    name="reservationTime"
                                                                    .value="${hour}"
                                                                    .checked="${this.bookTable.formData.reservationTime === hour}"
                                                                    @change="${(e) => this.onInputChange(e, 'bookTable.formData')}"
                                                                    required/>
                                                                <span class="form-theme-input rounded-pill py-10px fw-semibold">
                                                                    ${hour}
                                                                </span>
                                                                </label>
                                                            </div>
                                                            `
                                                        )}
                                                    </div>

                                                    <button class="btn btn-primary btn-theme rounded-pill w-100">${this.langvars.set_time}</button>
                                                </form>
                                            </div>
                                        ` 
                                        : null
                                    }

                                    ${this.bookTable.formData.currentView == 'meal-plan'
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                            <form @submit=${e => this.onProcessFormSubmit(e, {nextProcess: 'personal-info'})} class="widget-process-form">
                                                    <div class="text-md mb-3 fw-semibold">
                                                        ${this.langvars.what_vibe}
                                                    </div>

                                                    <div class="d-flex flex-wrap gap-10px mb-5">
                                                        ${(this.bookTable.reservationCategories || []).map(
                                                            (category) => html`
                                                            <div class="form-check form-check-theme">
                                                                <label class="form-check-label">
                                                                <input
                                                                    class="form-check-input"
                                                                    type="radio"
                                                                    name="reservationCategory"
                                                                    .value="${category.value}"
                                                                    .checked="${this.bookTable.formData.reservationCategory === category.value}"
                                                                    @change="${(e) => this.onInputChange(e, 'bookTable.formData')}"
                                                                    required/>
                                                                <span class="form-theme-input rounded-pill py-2 fw-semibold px-4">
                                                                    ${category.label}
                                                                </span>
                                                                </label>
                                                            </div>
                                                            `
                                                        )}
                                                    </div>

                                                    <div class="text-md mb-3 fw-semibold">
                                                        ${this.langvars.additional_notes}
                                                    </div>

                                                    <div class="mb-4">
                                                        ${(this.bookTable.reservationRequests || []).map(
                                                            (request) => html`
                                                                <div class="mb-3 form-check">
                                                                    <label class="form-check-label">
                                                                        <input
                                                                            class="form-check-input border-primary fs-base"
                                                                            type="checkbox"
                                                                            name="reservationRequests"
                                                                            .value="${request.value}"
                                                                            .checked="${this.bookTable.formData.reservationRequests.includes(request.value)}"
                                                                            @change="${(e) => this.onInputChange(e, 'bookTable.formData')}"/>
                                                                        <span class="ms-2 text-md">
                                                                            ${request.label}
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            `
                                                        )}
                                                    </div>

                                                    <div class="text-md mb-3 fw-semibold">
                                                        ${this.langvars.additional_notes}
                                                    </div>

                                                    <div class="mb-4">
                                                        <textarea 
                                                            @change="${(e) => this.onInputChange(e, 'bookTable.formData')}" 
                                                            .value="${this.bookTable.formData.reservationAdditionalRequest}" 
                                                            name="reservationAdditionalRequest" 
                                                            rows="5" 
                                                            class="form-control bg-body-tertiary">
                                                        </textarea>
                                                    </div>

                                                    <button class="btn btn-primary btn-theme rounded-pill w-100">${this.langvars.mood}</button>
                                            </form>
                                            </div>    
                                        ` 
                                        : null
                                    }

                                    ${this.bookTable.formData.currentView == 'personal-info'
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <form @submit=${e => this.onProcessFormSubmit(e, {nextProcess: 'confirmation'})} class="widget-reservation-form">
                                                    <div class="mb-3">
                                                        <label class="form-label text-md fw-semibold">${this.langvars.first_name} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                        <input @change="${(e) => this.onInputChange(e, 'bookTable.formData')}" name="firstName" .value=${this.bookTable.formData.firstName} type="text" class="form-control form-control-theme" required>
                                                    </div>

                                                    <div class="mb-3">
                                                        <label class="form-label text-md fw-semibold">${this.langvars.last_name} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                        <input @change="${(e) => this.onInputChange(e, 'bookTable.formData')}" name="lastName" .value=${this.bookTable.formData.lastName} type="text" class="form-control form-control-theme" required>
                                                    </div>

                                                    <div class="mb-3">
                                                        <label class="form-label text-md fw-semibold">${this.langvars.email} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                        <input @change="${(e) => this.onInputChange(e, 'bookTable.formData')}" name="email" .value=${this.bookTable.formData.email} type="email" class="form-control form-control-theme" required>
                                                    </div>

                                                    <div class="mb-3">
                                                        <label class="form-label text-md fw-semibold">${this.langvars.phone} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                        <input @change="${(e) => this.onInputChange(e, 'bookTable.formData')}" name="phone" .value=${this.bookTable.formData.phone} type="tel" class="form-control form-control-theme" required>
                                                    </div>

                                                    <div class="mt-40px">
                                                        <button type="submit" class="btn btn-primary btn-theme rounded-pill w-100">${this.langvars.save_spot}</button>
                                                    </div>
                                                </form>
                                            </div>    
                                        ` 
                                        : null
                                    }

                                    ${this.bookTable.formData.currentView == 'confirmation'
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <form @submit=${e => this.onProcessFormSubmit(e, {nextProcess: this.bookTable.deposit_required ? 'payment-section' : 'success'})} class="widget-process-form">
                                                    <div class="text-md">
                                                        <div class="mb-30px text-md fw-bold">${this.langvars.reservation_details}</div>

                                                        <div class="d-flex align-items-baseline mb-30px">
                                                            <icon-display icon="calendar" size="20px"></icon-display>

                                                            <div class="col ms-20px">
                                                                <span class="text-capitalize">${this.getFormattedReservationDate('bookTable')} ${this.bookTable.formData.reservationTime}</span>
                                                            </div>
                                                        </div>

                                                        <div class="d-flex align-items-baseline mb-30px">
                                                            <icon-display icon="user" size="20px"></icon-display>
                                                            
                                                            <div class="col ms-20px">
                                                                <strong>${this.bookTable.formData.guests_count}</strong> ${this.langvars.guest_label}
                                                            </div>
                                                        </div>

                                                        <div class="d-flex align-items-baseline mb-30px">
                                                            <icon-display icon="utensils" size="20px"></icon-display>
                                                            
                                                            <div class="col ms-20px">
                                                                <span class="text-capitalize">${this.bookTable.formData.reservationCategory}</span>
                                                            </div>
                                                        </div>

                                                        ${this.bookTable.formData.reservationRequests.length > 1 
                                                            ? html`
                                                                <div class="d-flex align-items-baseline mb-30px">
                                                                    <icon-display icon="utensils" size="20px"></icon-display>    
                                                                    
                                                                    <div class="col ms-20px">
                                                                        ${(this.bookTable.formData.reservationRequests || []).map(
                                                                            (item) => html`
                                                                            <span class="text-capitalize">${item} &nbsp;</span>
                                                                            `
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            `
                                                            :null
                                                        } 

                                                        

                                                        <div class="mb-30px text-md fw-bold">${this.langvars.under_name}</div>

                                                        <div class="d-flex align-items-baseline mb-30px">
                                                            <icon-display icon="info" size="20px"></icon-display>

                                                            <div class="col ms-20px">
                                                                <strong>${this.bookTable.formData.firstName} ${this.bookTable.formData.lastName}</strong>
                                                                <br>${this.bookTable.formData.email}
                                                                <br>${this.bookTable.formData.phone}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div class="mt-40px mb-3">
                                                        <button type="submit" class="btn btn-primary btn-theme rounded-pill w-100">${this.langvars.final_confirm}</button>
                                                    </div>

                                                    <div class="fs-7 text-center mb-4">
                                                        ${this.langvars.agreement} <a href="#" class="text-underline text-info">${this.langvars.terms}.</a>
                                                    </div>
                                                </form>
                                            </div>
                                        ` 
                                        : null
                                    }

                                    ${this.bookTable.formData.currentView == 'payment-section'
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <div class="col-xl-10 mx-auto">
                                                    <h6 class="mb-1 fw-bold text-md">${this.langvars.payment_method_prompt}</h6>

                                                    <p>${this.langvars.redirect_notice}</p>

                                                    <form @submit=${e => this.onProcessFormSubmit(e, {nextProcess: 'payment-in-progress', action: 'confirm-table-reservation'})} class="widget-process-form mt-4">
                                                        <div class="d-flex flex-wrap gap-3 mb-5">
                                                            <div class="col">
                                                                <div class="form-check form-check-theme">
                                                                    <label class="form-check-label">
                                                                        <input 
                                                                            @change="${(e) => this.onInputChange(e, 'bookTable.formData')}" 
                                                                            value="bancontact" 
                                                                            .checked="${this.bookTable.formData.payment_method == 'bancontact'}" 
                                                                            name="payment_method" 
                                                                            class="form-check-input" type="radio"
                                                                            required>
                                                                        <span class="form-theme-input py-10px rounded fw-semibold d-flex justify-content-start gap-3 px-40px py-3" style="height: 69px;"><img src="${basePath}img/Payconiq.svg" style="height: 47px; width: 84px;" alt=""> Bancontact</span>
                                                                    </label>
                                                                </div>
                                                            </div>

                                                            <div class="col">
                                                                <div class="form-check form-check-theme">
                                                                    <label class="form-check-label">
                                                                        <input 
                                                                            @change="${(e) => this.onInputChange(e, 'bookTable.formData')}" 
                                                                            value="card" 
                                                                            .checked="${this.bookTable.formData.payment_method == 'card'}" 
                                                                            name="payment_method" 
                                                                            class="form-check-input" type="radio"
                                                                            required>
                                                                        <span class="form-theme-input py-10px rounded fw-semibold d-flex justify-content-start gap-3 px-40px py-3" style="height: 69px;"><img src="${basePath}img/VISA-MC.svg" style="height: 27px; width: 84px;" alt=""> ${this.langvars.payment_card} </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div class="text-center">
                                                            <button type="submit" .disabled="${this.bookTable.formData.payment_method == undefined}"  class="btn btn-primary btn-theme rounded-pill px-5">${this.langvars.pay_deposit_of} x€</button>

                                                            <div class="fs-8 mt-4">
                                                                ${this.langvars.payment_secure} <span class="text-info">${this.langvars.ssl_notice}.</span>
                                                            </div>
                                                        </div>

                                                    </form>

                                                    <div class="text-center mt-7">
                                                        <img src="${basePath}img/bc-logo-round-1.svg" class="img-fluid" alt="">
                                                    </div>
                                                </div>
                                            </div>
                                        ` 
                                        : null
                                    }

                                    ${this.bookTable.formData.currentView == 'payment-in-progress'
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

                                    ${this.bookTable.formData.currentView == 'success'
                                        ? html`
                                            <div class="d-flex flex-column h-100">
                                                <div class="p-4 p-sm-5">
                                                    <div class="text-center text-md">
                                                        <div class="mb-4">
                                                            <lottie-wrapper .loop=${false} src="${basePath}img/lottie/success.json" class="mx-auto" style="height: 220px"></lottie-wrapper>
                                                        </div>

                                                        <div class="mb-4">
                                                            <h5 class="fw-bold">${this.langvars.thank_you}, ${this.bookTable.formData.firstName}.</h5>
                                                        </div>

                                                        <p>
                                                            ${this.langvars.confirmation_msg_table}
                                                        </p>

                                                        <div class="mt-4 d-flex justify-content-center">
                                                            <div @click=${(e) => this.reset()} class="cursor-pointer text-underline fs-6 fw-bold text-primary">${this.langvars.book_another_table}</div>
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

                                    ${this.bookTable.formData.currentView == 'error'
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
                        </div>    
                    </div>
                </div>

            </div>
        `
    }

    connectedCallback() {
        super.connectedCallback();

        if (this.bookTable.formData.currentView == "payment-in-progress") {
            this._verifyInterval = setInterval(() => this._pollVerify(), 3000);
        }
    }

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
    }

    updated(changedProps) {

    }

    async onProcessFormSubmit(e, payload) {
        e.preventDefault();
        
        if (payload.action) {
            switch (payload.action) {
                case "confirm-table-reservation":
                    this.navigate({view: payload.nextProcess});

                    this.handleUpdateState();

                    setTimeout(async () => {
                        await this.getCheckout();
                    }, 2000)

                    break;
                default: 
                    break;
            }
        } else {
            if (payload.nextProcess) {
                this.navigate({view: payload.nextProcess})
            }
        }

        this.handleUpdateState();
    };

    async _pollVerify() {
        try {
            const result = await this.verifyCheckout();
            
            if (result.code === 1) {
                clearInterval(this._verifyInterval);
                this._verifyInterval = null;
                console.log("stop polling");
            }
        } catch (err) {
            console.error('verifyCheckout error:', err);

            clearInterval(this._verifyInterval);
            this._verifyInterval = null;
        }
    }

    async verifyCheckout() {
        const data = {
            action: "verifyCheckout",
            uid: this.uid,
            pk: this.publicKey,
            context: "bookTable",
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

            if (result.code == 1) {
                this.navigate({view: "success"});
                
            } else if (result.code == -1) {
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
            context: "bookTable",
            formData:  JSON.stringify(this.bookTable.formData)
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

            window.location.href = result.url;
            
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

    async getAvailableHours() {
        const data = {
            action: "getAvailableHours",
            uid: this.uid,
            pk: this.publicKey,
            guestsCount: this.bookTable.formData.guests_count,
            reservationDate: this.bookTable.formData.reservationDate
        };
        
        const params = new URLSearchParams(data);

        const url = this.isLocal ? '/mock-data/getAvailableHours.json' : basePath+'calls.php';
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
            const data = await response.json();

            this.bookTable.formData.availableHours = data.availableHours;
            
            this.navigate({view: 'available-hours'})         
        } catch (error) {
            console.error("Error fetching getAvailableHours data:", error);
        }
    }

    reset() {
        this.bookTable = {
            ...this.bookTable,
            formData: {
                isPanelActive: true,
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
        }
    }

    navigate(payload) {
        if (payload?.direction == 'back') {
            this.bookTable.formData.viewHistory.pop();
        } else {
            this.bookTable.formData.viewHistory.push(payload.view);
        }

        this.bookTable = {...this.bookTable, formData: {...this.bookTable.formData, currentView: this.bookTable.formData.viewHistory.at(-1)}};
        this.handleUpdateState();

        this.renderRoot.querySelector(".panel-scroll-area").scrollTop = 0;
    };

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

        this.handleUpdateState();
    }

    getFormattedReservationDate(objectName) {
        const date = new Date(this[objectName].formData.reservationDate);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };

        return `${date.toLocaleDateString('fr-BE', options)}`;
    }

    handleClosePanel() {
        this.dispatchEvent(new CustomEvent("panel-closed", {
            detail: { name: "bookTable" },
            bubbles: true,
            composed: true,
        }))
       
        // this.handleUpdateState();
    }

    handleUpdateState() {
        this.dispatchEvent(new CustomEvent("update-state", {
            detail: {data: this.bookTable, name: 'bookTable'},
            bubbles: true,
            composed: true
        }));
    }
}

customElements.define("book-table", bookTable);