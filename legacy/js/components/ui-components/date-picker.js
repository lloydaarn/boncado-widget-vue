import { LitElement, html, css } from '/vendors/lit/lit-all.min.js';

class DatePicker extends LitElement {
    static properties = {
        selectedDate: { type: String, attribute: 'selected-date' },
        excludedDates: {
            attribute: 'excluded-dates',
            converter: { fromAttribute: v => { try { return JSON.parse(v); } catch { return []; } } }
        },
        excludedWeekdays: {
            attribute: 'excluded-weekdays',
            converter: { fromAttribute: v => { try { return JSON.parse(v); } catch { return []; } } }
        },
        _currentDate: { state: true },
        _internalSelected: { state: true }
    };

    static styles = css`
        :host { display: block; width: var(--dp-width, 100%); font-family: var(--bs-font-sans-serif); }
        #calendar { display: grid; grid-template-columns: repeat(7, 1fr); gap: var(--dp-gap, 0.25rem); border: 1px solid var(--bs-border-color); border-radius: var(--bs-border-radius); background-color: var(--bs-white); }
        .header { text-transform: capitalize; grid-column: span 7; display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background-color: var(--bs-light); border-bottom: 1px solid var(--bs-border-color); border-top-left-radius: var(--bs-border-radius); border-top-right-radius: var(--bs-border-radius); }
        .header button { border: none; background: none; font-size: 1.1rem; color: var(--bs-primary); }
        .weekday, .day { padding: .75rem 0.5rem; text-align: center; border: 1px solid transparent; }
        .weekday { font-weight: 600; color: var(--bs-secondary); }
        .day { cursor: pointer; border-radius: var(--bs-border-radius); }
        .day:hover:not(.disabled):not(.selected) { background-color: var(--bs-gray-100); }
        .day:not(.disabled) {font-weight: 500}
        .disabled {opacity: .4; pointer-events: none; }
        .selected { background-color: var(--bs-primary); color: var(--bs-white); }
        p { margin-top: 0.5rem; font-size: 0.9rem; }
      `;

    constructor() {
        super();
        this.selectedDate = null;
        this.excludedDates = [];
        this.excludedWeekdays = [];
        this._currentDate = new Date();
        this._internalSelected = null;
    }

    updated(changed) {
        if (changed.has('selectedDate') && this.selectedDate) {
            this._internalSelected = this.selectedDate;
            const [y, m] = this.selectedDate.split('-').map(Number);
            this._currentDate = new Date(y, m - 1, 1);
        }
        this._drawCalendar();
    }

    render() {
        return html`
          <div id="calendar"></div>
        `;
    }

    firstUpdated() {
        this._drawCalendar();
    }

    _drawCalendar() {
        const container = this.shadowRoot.getElementById('calendar');
        container.innerHTML = '';

        const year = this._currentDate.getFullYear();
        const month = this._currentDate.getMonth();
        const first = new Date(year, month, 1);
        const last = new Date(year, month + 1, 0);
        const daysInMonth = last.getDate();
        const startDay = (first.getDay() + 6) % 7;

        // Today's ISO for disabling past dates
        const today = new Date();
        const todayIso = [
            today.getFullYear(),
            String(today.getMonth() + 1).padStart(2, '0'),
            String(today.getDate()).padStart(2, '0')
        ].join('-');

        const header = document.createElement('div'); header.className = 'header';
        const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(this._currentDate);
        header.innerHTML = `
          <button id="prev">&lt;</button>
          <strong>${monthLabel}</strong>
          <button id="next">&gt;</button>
        `;
        container.appendChild(header);

        header.querySelector('#prev').addEventListener('click', () => {
            this._currentDate = new Date(year, month - 1, 1);
        });
        header.querySelector('#next').addEventListener('click', () => {
            this._currentDate = new Date(year, month + 1, 1);
        });

        ['L', 'M', 'M', 'J', 'V', 'S', 'D'].forEach(letter => {
            const wd = document.createElement('div'); wd.className = 'weekday'; wd.textContent = letter;
            container.appendChild(wd);
        });

        for (let i = 0; i < startDay; i++) container.appendChild(document.createElement('div'));

        for (let d = 1; d <= daysInMonth; d++) {
            const day = new Date(year, month, d);
            const iso = [day.getFullYear(), String(day.getMonth() + 1).padStart(2, '0'), String(day.getDate()).padStart(2, '0')].join('-');

            const div = document.createElement('div'); div.className = 'day'; div.textContent = d;
            const isExcludedDate = this.excludedDates.includes(iso);
            const isExcludedWeekday = this.excludedWeekdays.includes(day.getDay());
            const isPast = iso < todayIso;
            if (isExcludedDate || isExcludedWeekday || isPast) {
                div.classList.add('disabled');
            } else {
                div.addEventListener('click', () => {
                    this._internalSelected = iso;
                    this.dispatchEvent(new CustomEvent('date-selected', { detail: { date: iso }, bubbles: true, composed: true }));
                });
            }
            if (iso === this._internalSelected) div.classList.add('selected');
            container.appendChild(div);
        }
    }
}

customElements.define('date-picker', DatePicker);