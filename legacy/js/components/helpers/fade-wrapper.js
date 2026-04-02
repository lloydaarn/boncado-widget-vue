import { LitElement, html, css, svg, keyed } from "/vendors/lit/lit-all.min.js";

class FadeWrapper extends LitElement {
    static properties = {
        type: { type: String }
    }

    static styles = css`
        :host {
            display: block;
            opacity: 0;
        }

        :host([type="fade-in"]) {
            animation: fadeIn 0.5s ease forwards;
        }

        :host([type="fade-top"]) {
            animation: fadeTop 0.5s ease forwards;
        }

        :host([type="fade-bottom"]) {
            animation: fadeBottom 0.5s ease forwards;
        }

        :host([type="fade-left"]) {
            animation: fadeLeft 0.5s ease forwards;
        }

        :host([type="fade-right"]) {
            animation: fadeRight 0.5s ease forwards;
        }

        @keyframes fadeIn {
            to {
                opacity: 1;
            }
        }

        @keyframes fadeTop {
            from {
                transform: translateY(-20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        @keyframes fadeBottom {
            from {
                transform: translateY(20px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        @keyframes fadeLeft {
            from {
                transform: translateX(-20px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes fadeRight {
            from {
                transform: translateX(20px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;

    render() {
        return html`<slot></slot>`;
    }
}

customElements.define("fade-wrapper", FadeWrapper);