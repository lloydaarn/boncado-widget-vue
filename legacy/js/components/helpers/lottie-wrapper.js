// lottie-animation.js
import { LitElement, html, css } from '/vendors/lit/lit-all.min.js';
import lottie from 'https://cdn.skypack.dev/lottie-web@5.13.0';

export class LottieWrapper extends LitElement {
    static properties = {
        /** URL to your .json Lottie file */
        src: { type: String },
        /** whether the animation should loop */
        loop: { type: Boolean },
        /** whether to start playing immediately */
        autoplay: { type: Boolean },
    };

    constructor() {
        super();
        this.src = '';
        this.loop = true;
        this.autoplay = true;
    }

    static styles = css`
    :host { display: block; }
    .anim { width: 100%; height: 100%; }
  `;

    render() {
        return html`<div class="anim"></div>`;
    }

    firstUpdated() {
        lottie.loadAnimation({
            container: this.renderRoot.querySelector('.anim'),
            renderer: 'svg',
            loop: this.loop,
            autoplay: this.autoplay,
            path: this.src
        });
    }
}

customElements.define('lottie-wrapper', LottieWrapper);
