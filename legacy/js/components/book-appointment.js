import { LitElement, html, css, keyed, unsafeHTML } from "/vendors/lit/lit-all.min.js";
import "../components/ui-components/week-view-calendar.js"

const pageOrigin = window.location.origin;
const scriptOrigin = new URL(import.meta.url).origin;

const isSameDomain = pageOrigin === scriptOrigin;

// Dynamic base paths based on origin check
const basePath = isSameDomain ? './' : 'https://widget.boncado.be/';


class bookAppointment extends LitElement {
    _verifyInterval = null;

    static shadowRootOptions = { mode: 'open', delegateFocus: true};

    static properties = {
        langvars: { type: Object },
        lang: { type: String },
        bookAppointment: { type: Object },
        isPanelMaximized: {type: Boolean},
        eventsData: { type: Array },
        nextAvailableWeek: { type: Object },
        hasMultipleServices: { type: Boolean },
        cacheBookAppointment: { type: Object },
        settings: { type: Object },
    }

    constructor() {
        super();

        this.isPanelMaximized = false;
        this.eventsData = [];
        this.nextAvailableWeek = null;
    }

    createRenderRoot() {
        return this;
    }

    render() {
        return html`
            <div class="${this.isPanelMaximized ? 'panel-maximize': ''} book-appointment-screen bc-widget-screen position-relative d-flex flex-column">
                <div class="panel-top-bar">
                    <div class="panel-actions d-flex align-items-center p-3">
                        ${ !["category", "success", "error", "payment-in-progress"].includes(this.bookAppointment.formData.currentView) && 
                            !(!this.hasMultipleServices && this.bookAppointment.formData.currentView === 'available-hours')
                                ? html`
                                    <div @click=${() => this.navigate({ direction: 'back' })} class="p-1 cursor-pointer">
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

                    ${ !["success", "error", "payment-in-progress"].includes(this.bookAppointment.formData.currentView) 
                        ? html`
                            <div class="progress-bar-container d-flex">
                                ${this.hasMultipleServices 
                                    ? html`
                                        <div class="col progress-bar-partition ${this.bookAppointment.formData.currentView == 'category' ? 'active': null}">
                                            <div class="_progress-bar"></div>
                                        </div>
                                    ` 
                                    : null
                                }
                                <div class="col progress-bar-partition ${this.bookAppointment.formData.currentView == 'available-hours' ? 'active': null}">
                                    <div class="_progress-bar"></div>
                                </div>
                                <div class="col progress-bar-partition ${this.bookAppointment.formData.currentView == 'personal-info' ? 'active': null}">
                                    <div class="_progress-bar"></div>
                                </div>
                                <div class="col progress-bar-partition ${this.bookAppointment.formData.currentView == 'confirmation' ? 'active': null}">
                                    <div class="_progress-bar"></div>
                                </div>
                                <div class="col progress-bar-partition ${this.bookAppointment.formData.currentView == 'payment-section' ? 'active': null}">
                                    <div class="_progress-bar"></div>
                                </div>
                                <div style="width: 50px;"></div>
                            </div>
                        `
                        :null
                    }
                </div>

                <div class="panel-scroll-area">
                    <div class="panel-head">
                        <div class="panel-head-inner pb-3 pt-2">
                            ${keyed(this.bookAppointment.formData.currentView, html`
                                <fade-wrapper type="fade-in">
                                    ${this.bookAppointment.formData.currentView == 'category' 
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${this.langvars.make_appointment}</h4>
                                                <div class="fs-6 fw-md">
                                                    <p>
                                                        ${unsafeHTML(this.langvars.step_choose)}
                                                    </p>
                                                </div>
                                            </div>
                                        ` 
                                        : null}

                                    ${this.bookAppointment.formData.currentView == 'available-hours'
                                        ? html`
                                            <div class="px-4 text-center is-open" id="tae">
                                                <h4 class="fw-bold title-font">${this.langvars.choose_time}</h4>
                                                <div class="fs-6 fw-md">
                                                    <p>
                                                        ${unsafeHTML(this.langvars.step_when)}
                                                    </p>
                                                </div>
                                            </div>
                                        `
                                        : null}

                                    ${this.bookAppointment.formData.currentView == 'personal-info' 
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${this.langvars.almost_there}</h4>
                                                <div class="fs-6 fw-md">
                                                    <p>
                                                        ${unsafeHTML(this.langvars.step_identity)}
                                                    </p>
                                                </div>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.bookAppointment.formData.currentView == 'confirmation' 
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">${this.langvars.are_correct}</h4>
                                                <div class="fs-6 fw-md">
                                                    <p>
                                                        ${unsafeHTML(this.langvars.step_review)}
                                                    </p>
                                                </div>
                                            </div>    
                                        `
                                        : null
                                    }

                                    ${this.bookAppointment.formData.currentView == 'payment-section'
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

                                     ${this.bookAppointment.formData.currentView == 'payment-in-progress'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">Payment confirmation</h4>
                                                
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.bookAppointment.formData.currentView == 'error'
                                        ? html`
                                            <div class="px-4 text-center">
                                                <h4 class="fw-bold title-font">Error</h4>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.bookAppointment.formData.currentView == 'success' 
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

                    <div class="panel-body">
                        <div class="panel-body-inner d-flex flex-column h-100 position-relative">
                            ${keyed(this.bookAppointment.formData.currentView, html`
                                <fade-wrapper type="fade-in">
                            
                                    ${this.bookAppointment.formData.currentView == 'category'
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <form @submit=${e => this.onProcessFormSubmit(e, {nextProcess: 'available-hours'})} class="widget-process-form">
                                                    <div class="mb-40px">
                                                        <label class="mb-2 text-md fw-semibold">${this.langvars.category_label}</label>

                                                        ${this.bookAppointment?.services.length >= 5 
                                                            ? html`
                                                                <div class="input-group-theme">
                                                                    <select 
                                                                        @change="${(e) => this.handleServiceSelect(service)}"
                                                                        .value=${this.bookAppointment.formData.serviceCategory} 
                                                                        name="serviceCategory" 
                                                                        class="form-control form-control-theme form-select"
                                                                        required>
                                                                        <option value="" hidden>${this.langvars.select_category}</option>
                                                                        ${(this.bookAppointment.services || []).map(service => html`
                                                                            <option .value="${service.id}">${service.name}</option>
                                                                        `)}
                                                                    </select>

                                                                    <div class="input-icon">
                                                                        <icon-display icon="angle-down" size="20px"></icon-display>
                                                                    </div>
                                                                </div>
                                                            `
                                                            : html`
                                                                 <div class="d-flex flex-wrap gap-3 mb-3 mt-3">
                                                                    ${(this.bookAppointment.services || []).map(
                                                                        (service) => html`
                                                                        <div class="form-check form-check-theme">
                                                                            <label class="form-check-label">
                                                                                <input
                                                                                    class="form-check-input"
                                                                                    type="radio"
                                                                                    name="serviceCategory"
                                                                                    .value="${service.id}"
                                                                                    .checked="${this.bookAppointment.formData.serviceCategory == service.id}"
                                                                                    @change="${(e) => this.handleServiceSelect(service)}"
                                                                                    required/>
                                                                                <span class="form-theme-input rounded-pill py-10px px-3 fw-semibold">
                                                                                    ${service.name}
                                                                                </span>
                                                                            </label>
                                                                        </div>
                                                                        `
                                                                    )}
                                                                </div>
                                                            `
                                                        }
                                                    </div>

                                                    <button type="submit" class="btn btn-primary btn-theme rounded-pill w-100">${this.langvars.proceed}</button>
                                                </form>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.bookAppointment.formData.currentView == 'available-hours'
                                        ? html`
                                            <div class="d-flex flex-column py-4 px-sm-4 py-sm-5 h-100">
                                                <!-- <div class="text-center text-md mb-40px">
                                                    ${this.langvars.available_slots}
                                                    <br><span class="fw-bold text-primary text-underline">${this.getFormattedReservationDate('bookAppointment')}</span>
                                                </div> -->

                                                <week-view-calendar 
                                                    .langvars="${this.langvars}"
                                                    .startHour=${this.bookAppointment.settings?.hoursRange?.start || "08:00"}
                                                    .endHour=${this.bookAppointment.settings?.hoursRange?.end || "18:00"}
                                                    .businessHours=${this.bookAppointment.settings?.business_hours || []}
                                                    .bookingWindow=${this.bookAppointment.settings?.bookingWindow || { earliestDays: 0, latestDays: 300 }}
                                                    .eventsData=${this.eventsData}
                                                    .selectedSlot="${this.bookAppointment.formData.reservationDate}|${this.bookAppointment.formData.reservationTime}"
                                                    .nextAvailableWeek=${this.nextAvailableWeek}
                                                    @event-select=${(e) => {
                                                        this.bookAppointment.formData.reservationDate = e.detail.date;
                                                        this.bookAppointment.formData.reservationTime = e.detail.time;
                                                    }}
                                                    @week-change=${(e) => this._onWeekChange(e)}>
                                                </week-view-calendar>

                                                <br>
                                                <br>

                                                <div class="px-4">
                                                    <form @submit=${e => this.onProcessFormSubmit(e, {nextProcess: 'personal-info'})} class="widget-process-form">
                                                        <!-- <div class="d-flex justify-content-center flex-wrap gap-10px mb-5">
                                                            ${this.bookAppointment.availableHours.map(
                                                                (hour) => html`
                                                                    <div class="form-check form-check-theme">
                                                                        <label class="form-check-label">
                                                                        <input
                                                                            class="form-check-input"
                                                                            type="radio"
                                                                            name="reservationTime"
                                                                            .value="${hour}"
                                                                            .checked="${this.bookAppointment.formData.reservationTime === hour}"
                                                                            @change="${(e) => (this.onInputChange(e, 'bookAppointment.formData'))}" 
                                                                            required/>
                                                                            
                                                                        <span class="form-theme-input rounded-pill py-10px fw-semibold">
                                                                            ${hour}
                                                                        </span>
                                                                        </label>
                                                                    </div>
                                                                `
                                                            )}
                                                        </div> -->

                                                        <button type="submit" class="btn btn-primary btn-theme rounded-pill w-100">${this.langvars.set_time}</button>
                                                    </form>
                                                </div>

                                                <br>
                                                <br>
                                            </div>
                                        ` 
                                        : null
                                    }

                                    ${this.bookAppointment.formData.currentView == 'personal-info'
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <form @submit=${e => this.onProcessFormSubmit(e, {nextProcess: 'confirmation'})} class="widget-process-form">
                                                    <div class="mb-3">
                                                        <label class="form-label text-md fw-semibold">${this.langvars.first_name} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                        <input 
                                                            @change="${(e) => (this.onInputChange(e, 'bookAppointment.formData'))}" 
                                                            name="firstName" 
                                                            .value=${this.bookAppointment.formData.firstName} 
                                                            type="text" 
                                                            class="form-control form-control-theme"
                                                            required>
                                                    </div>

                                                    <div class="mb-3">
                                                        <label class="form-label text-md fw-semibold">${this.langvars.last_name} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                        <input 
                                                            @change="${(e) => (this.onInputChange(e, 'bookAppointment.formData'))}" 
                                                            name="lastName" 
                                                            .value=${this.bookAppointment.formData.lastName} 
                                                            type="text" 
                                                            class="form-control form-control-theme"
                                                            required>
                                                    </div>

                                                    <div class="mb-3">
                                                        <label class="form-label text-md fw-semibold">${this.langvars.email} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                        <input 
                                                            @change="${(e) => (this.onInputChange(e, 'bookAppointment.formData'))}" 
                                                            name="email" 
                                                            .value=${this.bookAppointment.formData.email} 
                                                            type="email" 
                                                            class="form-control form-control-theme"
                                                            required>
                                                    </div>

                                                    <div class="mb-3">
                                                        <label class="form-label text-md fw-semibold">${this.langvars.phone} <span class="fs-italic fs-8">(${this.langvars.required_field})</span></label>
                                                        <input 
                                                            @change="${(e) => (this.onInputChange(e, 'bookAppointment.formData'))}" 
                                                            name="phone" 
                                                            .value=${this.bookAppointment.formData.phone} 
                                                            type="tel" 
                                                            class="form-control form-control-theme"
                                                            required>
                                                    </div>

                                                    <div class="mt-40px">
                                                        <button type="submit" class="btn btn-primary btn-theme rounded-pill w-100">${this.langvars.save_spot}</button>
                                                    </div>
                                                </form>
                                            </div>    
                                        ` 
                                        : null
                                    }

                                    ${this.bookAppointment.formData.currentView == 'confirmation'
                                        ? html`
                                            <div class="">
                                                <div class="p-4 p-sm-5">
                                                    <form @submit=${e => this.onProcessFormSubmit(e, {nextProcess: this.isDepositRequired ? 'payment-section': 'success'})}> 
                                                        <div class="text-md">
                                                            <div class="mb-30px text-md fw-bold">Appointment details</div>

                                                            <div class="d-flex align-items-start mb-30px">
                                                                <icon-display icon="calendar" size="20px"></icon-display>
                                                                
                                                                <div class="col ms-20px">
                                                                    ${this.getFormattedReservationDate()} ${this.bookAppointment.formData.reservationTime}
                                                                </div>
                                                            </div>

                                                            <div class="d-flex align-items-start mb-30px">
                                                                <icon-display icon="circle-check" size="20px"></icon-display>

                                                                <div class="col ms-20px">
                                                                    <span class="text-capitalize">${this.selectedServiceName}</span>
                                                                </div>

                                                                ${this.isDepositRequired ? html`
                                                                    <div class="d-flex align-items-start mb-30px">
                                                                        <icon-display icon="credit-card" size="20px"></icon-display>
                                                                        <div class="col ms-20px">
                                                                            <span class="fs-6">${this.langvars.deposit_required}: ${this.depositAmount}€</span>
                                                                        </div>
                                                                    </div>
                                                                ` : null}
                                                            </div>

                                                            <br>

                                                            <div class="mb-30px text-md fw-bold">Scheduled by</div>

                                                            <div class="d-flex align-items-start mb-30px">
                                                                <icon-display icon="info" size="20px"></icon-display>
                                                                
                                                                <div class="col ms-20px">
                                                                    <strong>${this.bookAppointment.formData.firstName} ${this.bookAppointment.formData.lastName}</strong>
                                                                    <br>${this.bookAppointment.formData.email}
                                                                    <br>${this.bookAppointment.formData.phone}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div class="mt-40px mb-3">
                                                            <button type="submit" class="btn btn-primary btn-theme rounded-pill w-100">Yes, I confirm</button>
                                                        </div>

                                                        <div class="fs-7 text-center mb-4">
                                                            ${this.langvars.agreement} <a href="#" class="text-underline text-info">${this.langvars.terms}.</a>
                                                        </div>
                                                    </form>
                                                </div>

                                                ${!this.isDepositRequired
                                                    ? html`
                                                        <div class="text-center py-3 border-top">
                                                            <img src="${basePath}img/bc-logo-round-1.svg" alt="">
                                                        </div>
                                                    ` 
                                                    : null
                                                }
                                                
                                            </div>
                                        ` 
                                        : null
                                    }

                                    ${this.bookAppointment.formData.currentView == 'payment-section'
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <div class="col-xl-10 mx-auto">
                                                    <h6 class="mb-1 fw-bold text-md">${this.langvars.payment_method_prompt}</h6>

                                                    <p>${this.langvars.redirect_notice}</p>

                                                    <form @submit=${e => this.onProcessFormSubmit(e, {nextProcess: 'payment-in-progress', action: 'confirm-appointment'})} class="widget-process-form mt-4">
                                                        <div class="d-flex flex-wrap gap-3 mb-5">
                                                            <div class="col">
                                                                <div class="form-check form-check-theme">
                                                                    <label class="form-check-label">
                                                                        <input 
                                                                            @change="${(e) => (this.onInputChange(e, 'bookAppointment.formData'))}" 
                                                                            value="bancontact" 
                                                                            .checked="${this.bookAppointment.formData.payment_method == 'bancontact'}" 
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
                                                                            @change="${(e) => (this.onInputChange(e, 'bookAppointment.formData'))}" 
                                                                            value="card" 
                                                                            .checked="${this.bookAppointment.formData.payment_method == 'card'}" 
                                                                            name="payment_method" 
                                                                            class="form-check-input" type="radio"
                                                                            required>
                                                                        <span class="form-theme-input py-10px rounded fw-semibold d-flex justify-content-start gap-3 px-40px py-3" style="height: 69px;"><img src="${basePath}img/VISA-MC.svg" style="height: 27px; width: 84px;" alt=""> ${this.langvars.payment_card} </span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div class="text-center">
                                                            <button type="submit" .disabled="${this.bookAppointment.formData.payment_method == undefined}" class="btn btn-primary btn-theme rounded-pill px-5">${this.langvars.pay_deposit_of} ${this.depositAmount}€</button>

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

                                    ${this.bookAppointment.formData.currentView == 'payment-in-progress'
                                        ? html`
                                            <div class="p-4 p-sm-5">
                                                <div class="p-3 bg-gray-2 py-4 text-center rounded-2">
                                                    <h4 class="fw-bold">Payment in progress</h4>
                                                    <p class="m-0">Waiting for payment confirmation.</p>

                                                    <div class="mt-5 mini-loader mx-auto"></div>

                                                    <div class="mt-5">
                                                        <a href="#" class="d-flex justify-content-center align-items-center gap-2 fs-6">
                                                            <icon-display icon="circle-question" size="18" color="var(--bs-primary)"></icon-display>
                                                            <span class="mt-1">Order help</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        `
                                        : null
                                    }

                                    ${this.bookAppointment.formData.currentView == 'success'
                                        ? html`
                                            <div class="success-tab-content d-flex flex-column h-100">
                                                <div class="p-4 p-sm-5">
                                                    <div class="text-center text-md">
                                                        <div class="mb-4">
                                                            <lottie-wrapper .loop=${false} src="${basePath}img/lottie/success.json" class="mx-auto" style="height: 220px"></lottie-wrapper>
                                                        </div>

                                                        <div class="mb-4">
                                                            <h5 class="fw-bold">${this.langvars.thank_you}, ${this.bookAppointment.formData.firstName}.</h5>
                                                        </div>

                                                        <p>
                                                            ${this.langvars.confirmation_msg_agenda}
                                                        </p>

                                                        <div class="mt-4 d-flex justify-content-center">
                                                            <div @click=${(e) => this.reset()} class="cursor-pointer text-underline fs-6 fw-bold text-primary">${this.langvars.book_another_appointment}</div>
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

                                    ${this.bookAppointment.formData.currentView == 'error'
                                        ? html`
                                            <div class="d-flex flex-column h-100">
                                                <div class="p-4 p-sm-5">
                                                    <div class="text-center text-md">
                                                        Error
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

    connectedCallback() {
        super.connectedCallback();

        this.initialize();

        this.cacheBookAppointment = JSON.parse(JSON.stringify(this.bookAppointment));
        this.hasMultipleServices = (this.bookAppointment.services || []).length > 1;

        switch (this.bookAppointment.formData.currentView) {
            case "payment-in-progress":
                this._verifyInterval = setInterval(() => this._pollVerify(), 3000);

                break;
            
            case "available-hours":
                this.getAvailableDates();

                break;
        
            default:
                break;
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
        // this.hasMultipleServices = (this.bookAppointment.services || []).length > 1;


        // console.log(this.hasMultipleServices);
        // if (changedProps.has("hasMultipleServices")) {
        //     console.log("al;kdj;lakjdf");
        //     this.bookAppointment.formData.currentView = this.hasMultipleServices ? "category" : 'available-hours';

        //     this.requestUpdate();
        // }

        // this.bookAppointment.formData.serviceCategory = this.bookAppointment?.formData.serviceCategory == "" && !this.hasMultipleServices ? this.bookAppointment.services[0].id : this.bookAppointment?.formData.serviceCategory;
    }

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
            context: "bookAppointment",
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
        console.log("get checkout");

        const data = {
            action: "getCheckout",
            uid: this.uid,
            pk: this.publicKey,
            context: "bookAppointment",
            formData:  JSON.stringify(this.bookAppointment.formData)
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

    reset() {
        this.bookAppointment = {
            ...this.bookAppointment,
            formData: {
                isPanelActive: true,
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

        this.handleUpdateState();
    }

    devHandleHasMultipleServices(e) {
        console.log(e.target.checked);
        console.log("dev handle multiple services");
        if (e.target.checked) {
            this.bookAppointment = {...this.bookAppointment, services: this.cacheBookAppointment.services};
        } else {
            this.bookAppointment = {...this.bookAppointment, services: this.cacheBookAppointment.services.slice(0, 1)};
        }

        this.hasMultipleServices = (this.bookAppointment.services || []).length > 1;

        this.bookAppointment.formData.currentView = this.hasMultipleServices ? "category" : 'available-hours';

        this.bookAppointment.formData.serviceCategory = this.bookAppointment?.formData.serviceCategory == "" && !this.hasMultipleServices ? this.bookAppointment.services[0].id : this.bookAppointment?.formData.serviceCategory;

        this.requestUpdate();
    }

    get isDepositRequired() {
        return this.bookAppointment?.services
            .find(item => item.id == this.bookAppointment?.formData?.serviceCategory)
            ?.deposit_required === true;
    }

    get selectedServiceName() {
        return this.bookAppointment?.services.find(item => item.id == this.bookAppointment?.formData?.serviceCategory)?.name;
    }

    async initialize() {
        await this.getAppointmentServices();

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

    get depositAmount() {
        const service = this.bookAppointment?.services
            ?.find(item => item.id == this.bookAppointment?.formData?.serviceCategory);

        if (!service || !service.deposit_required) return 0;

        return service.deposit_amount;
    }

    async getAvailableDates(week = null, year = null) {
        const data = {
            action: "getAppointmentAvailabilities",
            uid: this.uid,
            pk: this.publicKey,
            service: this.bookAppointment.formData.serviceCategory,
            ...(week !== null && { week }),
            ...(year !== null && { year })
        };
      
        const params = new URLSearchParams(data);

        const url = this.isLocal ? '/mock-data/getAppointmentAvailabilities.json' : basePath+'calls.php';
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

            this.eventsData = result?.endpoint.dates;
            this.nextAvailableWeek = result?.endpoint.next_available_week || null;

            this.handleUpdateState();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

     _onWeekChange(e) {
        const { week, year } = e.detail;
        const serviceId = this.bookAppointment.formData.serviceCategory;
        if (serviceId) {
            this.getAvailableDates(week, year);
        }
    }


    normalizeService(s) {
        return {
            ...s,
            deposit_required: s.deposit_required === "true" || s.deposit_required === true,
            deposit_amount: parseFloat(s.deposit_amount) || 0,
            duration: parseInt(s.duration) || 0,
            isActive: s.isActive === "true" || s.isActive === true,
        };
    }

    async getAppointmentServices() {
        const data = {
            action: "getAppointmentServices",
            uid: this.uid,
            pk: this.publicKey
        }

        const params = new URLSearchParams(data);

        const url = this.isLocal ? '/mock-data/getAppointmentServices.json' : basePath + 'calls.php';

        const fetchOptions = this.isLocal 
            ? {}
            : {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: params
            }
        
        try {
            const response = await fetch(url, fetchOptions);
            const result = await response.json();

            this.bookAppointment = {
                ...this.bookAppointment,
                services: (result?.endpoint || []).map(this.normalizeService)
            };

            console.log(this.bookAppointment);

            this.handleUpdateState();
        } catch (error) {
            console.error("Error fetching data: " + error);
        }
    }

    
    
    async onProcessFormSubmit(e, payload) {
        e.preventDefault();
        
        if (payload.action) {
            switch (payload.action) {
                case 'confirm-appointment':
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
                this.navigate({view: payload.nextProcess})
            }
        }

        this.handleUpdateState();
    };

    navigate(payload) {
        if (payload?.direction == 'back') {
            this.bookAppointment.formData.viewHistory.pop();
        } else {
            this.bookAppointment.formData.viewHistory.push(payload.view);
        }

        this.bookAppointment = {...this.bookAppointment, formData: {...this.bookAppointment.formData, currentView: this.bookAppointment.formData.viewHistory.at(-1)}};
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

    async handleServiceSelect(service) {
        this.bookAppointment = {...this.bookAppointment, formData: {...this.bookAppointment.formData, serviceCategory: service.id}};

        const now = new Date();
        const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        const year = d.getUTCFullYear();

        await this.getAvailableDates(week, year);
    }

    getFormattedReservationDate() {
        const date = new Date(this.bookAppointment.formData.reservationDate);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };

        return `${date.toLocaleDateString('fr-BE', options)}`;
    };

    handleClosePanel() {
        this.dispatchEvent(new CustomEvent("panel-closed", {
            detail: { name: "bookAppointment" },
            bubbles: true,
            composed: true,
        }))
       
        // this.handleUpdateState();
    };

    handleUpdateState() {
        this.dispatchEvent(new CustomEvent("update-state", {
            detail: {data: this.bookAppointment, name: 'bookAppointment'},
            bubbles: true,
            composed: true
        }));
    };
}

customElements.define("book-appointment", bookAppointment);