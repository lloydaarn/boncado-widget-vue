import { LitElement, html, css } from "/vendors/lit/lit-all.min.js";

/**
 * <confirm-dialog> – Reusable confirmation dialog for the Boncado Lit widget.
 * Renders inside the widget's shadow DOM, not on the page body.
 *
 * ═══════════════════════════════════════════════════════════
 *  SETUP — call once in the widget's connectedCallback or constructor
 * ═══════════════════════════════════════════════════════════
 *
 *   import { BcDialog } from "./components/ui-components/confirm-dialog.js";
 *
 *   connectedCallback() {
 *       super.connectedCallback();
 *       BcDialog.init(this);   // pass the widget host (LitElement)
 *   }
 *
 * ═══════════════════════════════════════════════════════════
 *  PROGRAMMATIC USAGE (bootbox-style)
 * ═══════════════════════════════════════════════════════════
 *
 *   // Simple confirm
 *   BcDialog.confirm("Delete this product?", () => {
 *       this.deleteProduct();
 *   });
 *
 *   // With full options
 *   BcDialog.confirm({
 *       title: "Delete product",
 *       message: "This action cannot be undone.",
 *       acceptLabel: "Delete",
 *       cancelLabel: "Cancel",
 *       danger: true,
 *       onAccept: () => this.deleteProduct(),
 *       onCancel: () => console.log('cancelled'),
 *   });
 *
 *   // Alert (single OK button)
 *   BcDialog.alert("Operation successful!");
 *
 *   BcDialog.alert({
 *       title: "Error",
 *       message: "Unable to connect to the server.",
 *       acceptLabel: "OK",
 *       onAccept: () => this.retry(),
 *   });
 *
 * ═══════════════════════════════════════════════════════════
 *  DECLARATIVE USAGE (in Lit templates)
 * ═══════════════════════════════════════════════════════════
 *
 *   <confirm-dialog
 *     .open=${this.showDialog}
 *     .title=${"Confirm"}
 *     .message=${"Are you sure?"}
 *     .onAccept=${() => this.handleAccept()}
 *     .onCancel=${() => this.handleCancel()}
 *     @close=${() => this.showDialog = false}
 *   ></confirm-dialog>
 */

class ConfirmDialog extends LitElement {

    static properties = {
        open:        { type: Boolean, reflect: true },
        title:       { type: String },
        message:     { type: String },
        acceptLabel: { type: String },
        cancelLabel: { type: String },
        onAccept:    { type: Object },
        onCancel:    { type: Object },
        danger:      { type: Boolean },
        alertOnly:   { type: Boolean },
    };

    constructor() {
        super();
        this.open = false;
        this.title = '';
        this.message = '';
        this.acceptLabel = 'Confirmer';
        this.cancelLabel = 'Annuler';
        this.onAccept = null;
        this.onCancel = null;
        this.danger = false;
        this.alertOnly = false;

        this._onKeyDown = this._onKeyDown.bind(this);
    }

    /* ── Lifecycle ─────────────────────────────── */

    updated(changed) {
        if (changed.has('open')) {
            if (this.open) {
                document.addEventListener('keydown', this._onKeyDown);
            } else {
                document.removeEventListener('keydown', this._onKeyDown);
            }
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('keydown', this._onKeyDown);
    }

    /* ── Event handlers ────────────────────────── */

    _onKeyDown(e) {
        if (e.key === 'Escape') {
            this.alertOnly ? this._handleAccept() : this._handleCancel();
        }
    }

    _onBackdropClick(e) {
        if (e.target === e.currentTarget) {
            this.alertOnly ? this._handleAccept() : this._handleCancel();
        }
    }

    _handleAccept() {
        if (typeof this.onAccept === 'function') {
            this.onAccept();
        }
        this.dispatchEvent(new CustomEvent('accept'));
        this._requestClose();
    }

    _handleCancel() {
        if (typeof this.onCancel === 'function') {
            this.onCancel();
        }
        this.dispatchEvent(new CustomEvent('cancel'));
        this._requestClose();
    }

    _requestClose() {
        this.dispatchEvent(new CustomEvent('close'));
        // If spawned programmatically, remove from shadow DOM
        if (this._autoRemove) {
            this.open = false;
            setTimeout(() => this.remove(), 200);
        }
    }

    /* ── Render ─────────────────────────────────── */

    render() {
        if (!this.open) return html``;

        return html`
            <div class="backdrop" @click=${this._onBackdropClick}>
                <div class="dialog" role="dialog" aria-modal="true" @click=${(e) => e.stopPropagation()}>

                    ${this.title ? html`
                        <div class="header">
                            <h2 class="title">${this.title}</h2>
                        </div>
                    ` : ''}

                    <div class="body">
                        ${this.message ? html`<p class="message">${this.message}</p>` : ''}
                        <slot></slot>
                    </div>

                    <div class="footer">
                        ${!this.alertOnly ? html`
                            <button class="btn btn-cancel" @click=${this._handleCancel}>
                                ${this.cancelLabel}
                            </button>
                        ` : ''}
                        <button class="btn ${this.danger ? 'btn-danger' : 'btn-accept'}" @click=${this._handleAccept}>
                            ${this.acceptLabel}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /* ── Styles ─────────────────────────────────── */

    static styles = css`
        :host {
            display: contents;
        }

        .backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.15s ease-out;
        }

        .dialog {
            background: white;
            border-radius: 8px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 425px;
            width: calc(100% - 2rem);
            padding: 1.5rem;
            animation: dialogEnter 0.15s ease-out;
        }

        .header {
            margin-bottom: 0.5rem;
        }

        .title {
            font-size: 1.125rem;
            font-weight: 600;
            color: #0f172a;
            margin: 0;
        }

        .body {
            margin: 1rem 0;
        }

        .message {
            font-size: 0.875rem;
            color: #64748b;
            margin: 0;
            line-height: 1.5;
        }

        .footer {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
            margin-top: 1.5rem;
        }

        .btn {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            border: 1px solid transparent;
            transition: background-color 0.15s ease, border-color 0.15s ease;
            line-height: 1.25;
        }

        .btn-cancel {
            background: white;
            color: #374151;
            border-color: #d1d5db;
        }
        .btn-cancel:hover {
            background: #f9fafb;
            border-color: #9ca3af;
        }

        .btn-accept {
            background: var(--accent);
            color: white;
        }
        .btn-accept:hover {
            background: var(--accent);
        }

        .btn-danger {
            background: #ef4444;
            color: white;
        }
        .btn-danger:hover {
            background: #dc2626;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to   { opacity: 1; }
        }

        @keyframes dialogEnter {
            from {
                opacity: 0;
                transform: scale(0.95);
            }
            to {
                opacity: 1;
                transform: scale(1);
            }
        }
    `;
}

customElements.define('confirm-dialog', ConfirmDialog);


/* ═══════════════════════════════════════════════════════════
 *  BcDialog – Programmatic API (bootbox-style)
 *  Spawns inside the widget's shadow DOM.
 * ═══════════════════════════════════════════════════════════ */

const BcDialog = {

    /** @type {LitElement|null} The widget host element */
    _host: null,

    /**
     * Initialize with the widget host so dialogs render inside its shadow DOM.
     * Call once: BcDialog.init(this) from the widget's connectedCallback.
     * @param {LitElement} host
     */
    init(host) {
        this._host = host;
    },

    /**
     * BcDialog.confirm("Message", onAccept)
     * BcDialog.confirm({ title, message, onAccept, onCancel, danger, ... })
     */
    confirm(optionsOrMessage, onAcceptShorthand, { host } = {}) {
        const opts = typeof optionsOrMessage === 'string'
            ? { message: optionsOrMessage, onAccept: onAcceptShorthand }
            : optionsOrMessage;

        return this._spawn({
            alertOnly: false,
            acceptLabel: 'Confirmer',
            cancelLabel: 'Annuler',
            ...opts,
        }, host);
    },

    /**
     * BcDialog.alert("Message")
     * BcDialog.alert("Message", onAccept)
     * BcDialog.alert({ title, message, onAccept, ... })
     */
    alert(optionsOrMessage, onAcceptShorthand, { host } = {}) {
        const opts = typeof optionsOrMessage === 'string'
            ? { message: optionsOrMessage, onAccept: onAcceptShorthand }
            : optionsOrMessage;

        return this._spawn({
            alertOnly: true,
            acceptLabel: 'OK',
            ...opts,
        }, host);
    },

    /**
     * Internal: create & append a <confirm-dialog> inside the widget's shadow root.
     * @param {Object} opts
     * @returns {ConfirmDialog}
     */
    _spawn(opts, host) {
        const target = host ?? this._host;
        const container = target?.renderRoot ?? target?.shadowRoot;

        if (!container) {
            console.error('[BcDialog] No host set. Call BcDialog.init(widgetElement) first.');
            return null;
        }

        const el = document.createElement('confirm-dialog');

        if (opts.title)       el.title = opts.title;
        if (opts.message)     el.message = opts.message;
        if (opts.acceptLabel) el.acceptLabel = opts.acceptLabel;
        if (opts.cancelLabel) el.cancelLabel = opts.cancelLabel;
        if (opts.danger)      el.danger = opts.danger;
        if (opts.alertOnly)   el.alertOnly = opts.alertOnly;
        if (opts.onAccept)    el.onAccept = opts.onAccept;
        if (opts.onCancel)    el.onCancel = opts.onCancel;

        // Mark for auto-cleanup on close
        el._autoRemove = true;

        container.appendChild(el);

        // Open on next frame so the element renders first
        requestAnimationFrame(() => {
            el.open = true;
        });

        return el;
    }
};

export { ConfirmDialog, BcDialog };