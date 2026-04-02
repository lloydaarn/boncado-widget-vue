import { LitElement, html, css } from '/vendors/lit/lit-all.min.js';

class ThemeEditor extends LitElement {
    static properties = {
        theme: { type: Object },
        mode: { type: String }
    };

    static styles = css`
      :host { display: block; font-family: var(--font-family); }
      label { display: block; margin: .5em 0; }
    `;

    constructor() {
        super();
        // fallback until config.json loads
        // this.theme = {
        //     primaryColor: '#000000',
        //     headerColor: '#ffffff',
        //     textFont: 'Arial, sans-serif',
        // };

    }

    // async firstUpdated() {
    //     try {
    //         const resp = await fetch('/config.json');
    //         const { theme } = await resp.json();
    //         this.theme = theme;
    //         this._applyVariables();
    //     } catch (e) {
    //         console.error('Could not load theme defaults:', e);
    //     }
    // }

    connectedCallback() {
        super.connectedCallback();
        this._applyVariables();

        console.log("theme editor");
    }

    render() {

        const {
            accent,
            btnTextColor,
            panelHeadBackgroundColor,
            panelHeadTextColor,
            panelBodyBackgroundColor,
            panelBodyTextColor,
            btnBorderRadius: borderRadius,
            shadowY,
            shadowX,
            shadowBlur,
            position,
            textFont,
            titleFont
        } = this.theme;


        if (this.mode == "prod") return html``;

        return html`
        <label>
          Accent Color:
          <input type="color"
                .value=${accent}
                 @input=${e => this._onChange('accent', e.target.value)} />
        </label>
        <label>
          Button text: 
          <input type="color"
                 .value=${btnTextColor}
                 @input=${e => this._onChange('btnTextColor', e.target.value)} />
        </label>
        <label>
          Title Font:
            <select .value=${titleFont} @change=${e => this._onChange('titleFont', e.target.value)}>
                <option value="Rubik, sans-serif">Rubik</option>
                <option value="Nunito, sans-serif">Nunito</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="Quicksand, sans-serif">Quicksand</option>
            </select>
        </label>
        <label>
          Text Font:
            <select .value=${textFont} @change=${e => this._onChange('textFont', e.target.value)}>
                <option value="Rubik, sans-serif">Rubik</option>
                <option value="Nunito, sans-serif">Nunito</option>
                <option value="Roboto, sans-serif">Roboto</option>
                <option value="Quicksand, sans-serif">Quicksand</option>
          </select>
        </label>
      `;
    }

    _onChange(prop, value) {
        this.theme = { ...this.theme, [prop]: value };
        this._applyVariables();

        // dispatch a “theme-changed” event with the new theme
        this.dispatchEvent(new CustomEvent('theme-changed', {
            detail: { theme: this.theme, changedProp: prop, newValue: value },
            bubbles: true,
            composed: true
        }));
    }

    _applyVariables() {
        console.log(this.theme);
        const rootStyle = document.documentElement.style;
        rootStyle.setProperty('--bs-primary', this.theme.accent);
        rootStyle.setProperty('--accent', this.theme.accent);
        rootStyle.setProperty(`--panel-head-bg-color`, this.theme.panelHeadBackgroundColor);
        rootStyle.setProperty(`--panel-head-text-color`, this.theme.panelHeadTextColor);
        rootStyle.setProperty(`--panel-body-bg-color`, this.theme.panelBodyBackgroundColor);
        rootStyle.setProperty(`--panel-body-text-color`, this.theme.panelBodyTextColor);
        rootStyle.setProperty(`--text-font`, this.theme.textFont);
        rootStyle.setProperty(`--title-font`, this.theme.titleFont);
        const { r, g, b } = this._hexToRgb(this.theme.accent);
        rootStyle.setProperty('--primary-color-rgb', `${r}, ${g}, ${b}`);
        rootStyle.setProperty('--primary-color-dark', this._darken(this.theme.accent, 0.2));
        rootStyle.setProperty('--primary-color-light', this._lighten(this.theme.accent, 0.2));
        // rootStyle.setProperty('--header-color', this.theme.headerColor);
        // rootStyle.setProperty('--title-font', this.theme.titleFont);
        // rootStyle.setProperty('--text-font', this.theme.textFont);
    }

    _clamp(v) {
        return Math.max(0, Math.min(255, v));
    }

    _hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        if (hex.length === 3) {
            hex = hex.split('').map(h => h + h).join('');
        }
        const int = parseInt(hex, 16);
        return {
            r: (int >> 16) & 0xFF,
            g: (int >> 8) & 0xFF,
            b: int & 0xFF
        };
    }

    _rgbToHex({ r, g, b }) {
        const toHex = v => this._clamp(Math.round(v)).toString(16).padStart(2, '0');
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    _mixColors(c1, c2, weight) {
        const rgb1 = this._hexToRgb(c1);
        const rgb2 = this._hexToRgb(c2);
        return {
            r: rgb1.r * (1 - weight) + rgb2.r * weight,
            g: rgb1.g * (1 - weight) + rgb2.g * weight,
            b: rgb1.b * (1 - weight) + rgb2.b * weight
        };
    }

    _lighten(hex, pct) {
        const mixed = this._mixColors(hex, '#ffffff', pct);
        return this._rgbToHex(mixed);
    }

    _darken(hex, pct) {
        const mixed = this._mixColors(hex, '#000000', pct);
        return this._rgbToHex(mixed);
    }
}


customElements.define('theme-editor', ThemeEditor);