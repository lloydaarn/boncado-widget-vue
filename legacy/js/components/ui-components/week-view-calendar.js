import { LitElement, html, css } from '/vendors/lit/lit-all.min.js';

class WeekViewCalendar extends LitElement {
    static properties = {
        langvars: { type: Object },
        eventsData: { type: Array },
        currentWeekStart: { type: Object },
        startHour: { type: String },
        endHour: { type: String },
        selectedSlot: { type: String },
        businessHours: { type: Array },
        bookingWindow: { type: Object },
        nextAvailableWeek: { type: Object },
    };

    static styles = css`
        :host { display: block; font-family: Arial, sans-serif; }
        :host { --hour-height: 60px; }
        .nav { margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .nav button { padding: 6px 12px; border: 1px solid #ccc; background: #fff; cursor: pointer; border-radius: 4px; }
        .nav button:hover { background: #f5f5f5; }
        .week-title { font-weight: bold; margin-left: auto; margin-right: 8px; }
        .week-container { width: 100%; position: relative; overflow: hidden; }
        .overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; }
        .overlay a { margin-top: 8px; color: var(--bs-primary, #007bff); text-decoration: underline; cursor: pointer; }
        .header-row { display: grid; grid-template-columns: 50px repeat(7, 1fr); background: #f1f1f1; border-bottom: 1px solid #ccc; }
        .time-label { border-top: 1px solid #eee; font-size: 12px; padding-top: 2px; text-align: right; padding-right: 5px; box-sizing: border-box; height: var(--hour-height); cursor: pointer; }
        .day-header { display: flex; flex-direction: column; align-items: center; padding: 8px 0; border-left: 1px solid #ccc; box-sizing: border-box; }
        .day-number { font-size: 14px; font-weight: bold; }
        .day-label { font-size: 12px; }
        .calendar { display: grid; grid-template-columns: 50px repeat(7, 1fr); position: relative; }
        .day-column { position: relative; border-left: 1px solid #eee; display: grid; }
        .hour-slot { border-top: 1px solid #eee; height: var(--hour-height); }
        .event { position: absolute; left: 5px; right: 5px; border: 1px solid var(--bs-primary, #333); color: var(--bs-primary, #333); padding: 2px 4px; border-radius: 4px; font-size: 12px; box-sizing: border-box; overflow: hidden; cursor: pointer; }
        .event.past-event { opacity: .5; pointer-events: none; }
        .event.selected { background: var(--bs-primary, #333); color: #fff; }

        .day-column.day-closed,
        .day-column.day-outside-window {
            background: repeating-linear-gradient(
                45deg,
                #fafafa,
                #fafafa 10px,
                #f0f0f0 10px,
                #f0f0f0 20px
            );
            pointer-events: none;
        }
        .day-column.day-closed .event,
        .day-column.day-outside-window .event {
            display: none;
        }

        .hour-slot.outside-hours {
            background: repeating-linear-gradient(
                45deg,
                #fafafa,
                #fafafa 5px,
                #f0f0f0 5px,
                #f0f0f0 10px
            );
            pointer-events: none;
        }

        .text-center {
            text-align: center;
        }

        @media (max-width: 575px) {
            :host {
                /* width: calc(100% + 1.5rem);
                margin-right: 1rem; */
            }

            .nav {
                padding-left: 2.5rem;
                padding-right: 2.5rem;
            }

            .week-container {
                overflow-y: hidden;
                overflow-x: auto;
                /* width: auto;
                padding-right: 1.5rem; */
            }

            .header-row,
            .calendar {
                display: grid;
                grid-template-columns: 40px repeat(7, minmax(43px, 1fr));
                /* width: max-content; */
            }

            .time-labels-header {
                position: sticky;
                left: 0;
                z-index: 3;
                background: #f1f1f1;
            }
            .time-labels {
                position: sticky;
                left: 0;
                z-index: 2;
                background: #fff;
            }
            .day-header,
            .hour-slot {
                /* min-width: 50px; */
            }

            .day-header {
                /* min-width: 51px; */
            }

            .calendar > .time-labels + .day-column {
                /* border-left: 0; */
            }

            .time-label {
                /* border-right: 1px solid #eee; */
            }

            .control-label {
                display: none;
            }

            .event {
                left: 2px;
                right: 2px;
                /* background-color: var(--bs-primary);
                color: #fff; */
                font-weight: 700;
                font-size: 10px;
            }

            /* .week-title {
                margin-right: 1.5rem;
            } */
        }
  `;

    constructor() {
        super();
        this.currentWeekStart = this._getMonday(new Date());
        this.startHour = "08:00";
        this.endHour = "18:00";
        this.selectedSlot = '';
        this.eventsData = [];
        this.businessHours = [];
        this.bookingWindow = { earliestDays: 0, latestDays: 300 };
        this.nextAvailableWeek = null;
    }

    _getMonday(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        const day = d.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + diff);
        return d;
    }

    _formatDate(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    _parseHour(timeStr) {
        if (typeof timeStr === 'number') return timeStr;
        const [hours] = timeStr.split(':').map(Number);
        return hours;
    }

    _timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + (minutes || 0);
    }

    _isTimeInBusinessHours(dayIndex, timeStr) {
        if (!this.businessHours || this.businessHours.length === 0) return true;
        
        const dayConfig = this.businessHours.find(bh => parseInt(bh.id) === dayIndex);
        if (!dayConfig || !dayConfig.isOpen) return false;
        if (!dayConfig.hours || dayConfig.hours.length === 0) return true;
        
        const timeMinutes = this._timeToMinutes(timeStr);
        
        return dayConfig.hours.some(range => {
            const fromMinutes = this._timeToMinutes(range.from);
            const toMinutes = this._timeToMinutes(range.to);
            return timeMinutes >= fromMinutes && timeMinutes < toMinutes;
        });
    }

    _isDayClosed(dayIndex) {
        if (!this.businessHours || this.businessHours.length === 0) return false;
        // dayIndex: 0=Sunday, 1=Monday, ... 6=Saturday
        const dayConfig = this.businessHours.find(bh => parseInt(bh.id) === dayIndex);
        return dayConfig ? !dayConfig.isOpen : false;
    }

    _isDateInBookingWindow(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((targetDate - today) / (1000 * 60 * 60 * 24));
        
        return diffDays >= this.bookingWindow.earliestDays && diffDays <= this.bookingWindow.latestDays;
    }

    _getISOWeek(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    _getISOYear(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        return d.getUTCFullYear();
    }

    _dispatchWeekChange() {
        const week = this._getISOWeek(this.currentWeekStart);
        const year = this._getISOYear(this.currentWeekStart);
        this.dispatchEvent(new CustomEvent('week-change', {
            detail: { week, year },
            bubbles: true,
            composed: true
        }));
    }

    _prevWeek() {
        const d = new Date(this.currentWeekStart);
        d.setDate(d.getDate() - 7);
        this.currentWeekStart = d;
        this._dispatchWeekChange();
    }

    _nextWeek() {
        const d = new Date(this.currentWeekStart);
        d.setDate(d.getDate() + 7);
        this.currentWeekStart = d;
        this._dispatchWeekChange();
    }

    _formatWeekTitle() {
        const start = this.currentWeekStart;
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        const startMonth = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(start);
        const endMonth = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(end);
        const startDay = String(start.getDate()).padStart(2, '0');
        const endDay = String(end.getDate()).padStart(2, '0');
        const year = end.getFullYear();
        return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${year}`;
    }

    _isPast(dateStr, time) {
        const dt = new Date(`${dateStr}T${time}`);
        return dt < new Date();
    }

    _onEventSelect(e) {
        if (e.currentTarget.classList.contains('past-event')) return;
        const date = e.currentTarget.dataset.date;
        const time = e.currentTarget.dataset.time;
        this.selectedSlot = `${date}|${time}`;
        this.requestUpdate();
        this.dispatchEvent(new CustomEvent('event-select', { detail: { date, time }, bubbles: true, composed: true }));
    }

    render() {
        const hourHeight = parseFloat(getComputedStyle(this).getPropertyValue('--hour-height'));
        const daysAbbr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const parsedStartHour = this._parseHour(this.startHour);
        const parsedEndHour = this._parseHour(this.endHour);
        const hourCount = parsedEndHour - parsedStartHour;

        const today = new Date();
        const allPast = this.eventsData.length > 0 && this.eventsData.every(e => new Date(e.date) < today);
        const weekDates = daysAbbr.map((_, idx) => {
            const d = new Date(this.currentWeekStart);
            d.setDate(d.getDate() + idx);
            return this._formatDate(d);
        });
        const eventsThisWeek = this.eventsData.filter(e => weekDates.includes(e.date) && e.slots?.length) || [];
        const noInWeek = eventsThisWeek.length === 0;

        const nextEvent = this.nextAvailableWeek;

        return html`
            <div class="nav">
                <button @click=${this._prevWeek}>&larr; <span class="control-label">Previous</span></button>
                <button @click=${this._nextWeek}><span class="control-label">Next</span> &rarr;</button>
                <div class="week-title">${this._formatWeekTitle()}</div>
            </div>
            <div class="week-container">
                ${(allPast || noInWeek) 
                    ? html`
                        <div class="overlay">
                            <div class="text-center">
                                ${allPast 
                                ? html`
                                    ${this.langvars.all_slots_passed}
                                `
                                : html`
                                    ${this.langvars.no_available_slots_week} <br>
                                    (${this._formatWeekTitle()})
                                `}
                            </div>
                            ${nextEvent 
                                ? html`
                                    <a href="#" @click=${e => { 
                                        e.preventDefault(); 
                                        this.currentWeekStart = this._getMonday(new Date(nextEvent.date)); 
                                        this._dispatchWeekChange();
                                    }}>
                                        ${this.langvars.go_to_available_week} (${nextEvent.date})
                                    </a>
                                ` 
                                : null}
                        </div>
                    ` 
                    : null
                }
                
                <div class="header-row">
                    <div class="time-labels-header"></div>
                    ${daysAbbr.map((abbr, idx) => {
                        const date = new Date(this.currentWeekStart);
                        date.setDate(date.getDate() + idx);
                        const dayNum = date.getDate();
                        return html`<div class="day-header"><div class="day-number">${dayNum}</div><div class="day-label">${abbr}</div></div>`;
                    })}
                </div>

                <div class="calendar">
                    <div class="time-labels">
                        ${Array.from({ length: hourCount + 1 }, (_, i) => {
                            const h = parsedStartHour + i;
                            const time = `${h.toString().padStart(2, '0')}:00`;
                            const past = this._isPast(this._formatDate(new Date()), time);
                            const cls = past ? 'past-event' : '';
                            return html`<div class="time-label ${cls}" data-date="" data-time="${time}">${time}</div>`;
                        })}
                    </div>
                    ${daysAbbr.map((_, idx) => {
                        const date = new Date(this.currentWeekStart);
                        date.setDate(date.getDate() + idx);
                        const dateStr = this._formatDate(date);
                        const evt = this.eventsData.find(e => e.date === dateStr);
                        const dayOfWeek = date.getDay();
                        const isClosed = this._isDayClosed(dayOfWeek);
                        const isOutsideWindow = !this._isDateInBookingWindow(date);
                        return html`
                            <div class="day-column ${isClosed ? 'day-closed' : ''} ${isOutsideWindow ? 'day-outside-window' : ''}" style="grid-template-rows: repeat(${hourCount + 1}, var(--hour-height));">
                                ${Array.from({ length: hourCount + 1 }, (_, i) => {
                                    const time = `${(parsedStartHour + i).toString().padStart(2, '0')}:00`;
                                    const key = `${dateStr}|${time}`;
                                    const past = this._isPast(dateStr, time);
                                    const outsideHours = !this._isTimeInBusinessHours(dayOfWeek, time);
                                    const cls = [
                                        past ? 'past-event' : '',
                                        this.selectedSlot === key ? 'selected' : '',
                                        outsideHours ? 'outside-hours' : ''
                                    ].filter(Boolean).join(' ');
                                    return html`<div class="hour-slot ${cls}" data-date="${dateStr}" data-time="${time}"></div>`;
                                })}
                                ${evt ? evt.slots
                                    .filter(time => this._isTimeInBusinessHours(dayOfWeek, time))
                                    .map(time => {
                                        const key = `${dateStr}|${time}`;
                                        const past = this._isPast(dateStr, time);
                                        const selected = this.selectedSlot === key;
                                        const classes = past ? 'past-event' : selected ? 'selected' : '';
                                        const [h, m] = time.split(':').map(Number);
                                        const top = ((h + m / 60) - parsedStartHour) * hourHeight;
                                        const height = 0.5 * hourHeight;
                                        return html`<div class="event ${classes}" data-date="${dateStr}" data-time="${time}" style="top: ${top}px; height: ${height}px;" @click=${this._onEventSelect}>${time}</div>`;
                                    }) : ''}
                            </div>
                        `;
                    })}
                </div>
            </div>
        `;
    }
}

customElements.define('week-view-calendar', WeekViewCalendar);