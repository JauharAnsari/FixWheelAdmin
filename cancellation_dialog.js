(function () {
  'use strict';

  const STATUS_CANCEL = '__fixwheel_cancel__';
  const STATUS_CUSTOMER_CANCEL = '__customer_cancel__';
  const REASONS = {
    business: [
      { value: 'Cancel - spare parts', label: 'Spare parts unavailable' },
      { value: 'Cancel - mechanic not available', label: 'Mechanic not available' },
      { value: 'Cancel - Duplicate order', label: 'Duplicate order' },
      { value: 'Cancel - Non serviceable area', label: 'Non-serviceable area' }
    ],
    customer: [
      { value: 'Customer cancel', label: 'Customer cancelled' },
      { value: 'Customer cancel - order taken by competitor', label: 'Order taken by competitor' },
      { value: 'Customer cancel - rate high', label: 'Rate too high' }
    ]
  };

  let dialog = null;
  let returnFocus = null;
  let cancelHandler = null;
  let confirmHandler = null;
  let keyHandler = null;

  function statusControlValue(status) {
    const normalized = String(status || '').trim().toLowerCase();
    if (normalized.startsWith('customer cancel')) return STATUS_CUSTOMER_CANCEL;
    if (normalized.startsWith('cancel') || normalized === 'cancelled') return STATUS_CANCEL;
    return status || 'Pending';
  }

  function statusControlLabel(value) {
    if (value === STATUS_CANCEL) return 'Cancel';
    if (value === STATUS_CUSTOMER_CANCEL) return 'Customer cancel';
    return value;
  }

  function ensureStyles() {
    if (document.getElementById('cancellation-dialog-styles')) return;
    const style = document.createElement('style');
    style.id = 'cancellation-dialog-styles';
    style.textContent = `
      .cancel-reason-overlay{position:fixed;inset:0;z-index:12000;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.72);backdrop-filter:blur(5px)}
      .cancel-reason-dialog{width:min(520px,100%);max-height:min(680px,calc(100vh - 40px));overflow:auto;border:1px solid var(--border,#333);border-radius:18px;background:var(--surface,#151515);color:var(--text,#fff);box-shadow:0 24px 80px rgba(0,0,0,.55)}
      .cancel-reason-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:24px 24px 18px;border-bottom:1px solid var(--border,#2b2b2b)}
      .cancel-reason-eyebrow{margin:0 0 7px;color:var(--red,#ff474d);font:500 11px/1.3 'DM Mono',monospace;letter-spacing:.12em;text-transform:uppercase}
      .cancel-reason-title{margin:0;font:700 24px/1.15 'Syne',sans-serif;color:var(--text,#fff)}
      .cancel-reason-copy{margin:8px 0 0;color:var(--text-3,#a1a1aa);font:400 13px/1.5 'DM Mono',monospace}
      .cancel-reason-close{flex:0 0 auto;width:38px;height:38px;border:1px solid var(--border,#3a3a3a);border-radius:10px;background:transparent;color:inherit;font-size:22px;line-height:1;cursor:pointer}
      .cancel-reason-options{display:grid;gap:10px;padding:20px 24px}
      .cancel-reason-option{display:flex;align-items:center;gap:13px;padding:15px 16px;border:1px solid var(--border,#333);border-radius:12px;background:var(--surface-2,#1d1d1d);cursor:pointer;transition:border-color .15s,background .15s}
      .cancel-reason-option:hover{border-color:#666}.cancel-reason-option:has(input:checked){border-color:var(--red,#ff474d);background:rgba(255,71,77,.1)}
      .cancel-reason-option input{width:18px;height:18px;margin:0;accent-color:var(--red,#ff474d)}
      .cancel-reason-option span{font:600 14px/1.35 'Syne',sans-serif}
      .cancel-reason-actions{display:flex;justify-content:flex-end;gap:10px;padding:0 24px 24px}
      .cancel-reason-button{min-height:44px;padding:0 18px;border:1px solid var(--border,#3a3a3a);border-radius:10px;background:var(--surface-2,#202020);color:inherit;font:600 13px 'Syne',sans-serif;cursor:pointer}
      .cancel-reason-button.primary{border-color:var(--red,#ff474d);background:var(--red,#ff474d);color:#fff}.cancel-reason-button:disabled{opacity:.45;cursor:not-allowed}
      @media(max-width:600px){.cancel-reason-overlay{align-items:end;padding:12px}.cancel-reason-dialog{border-radius:18px}.cancel-reason-head{padding:20px 18px 16px}.cancel-reason-title{font-size:21px}.cancel-reason-options{padding:16px 18px}.cancel-reason-actions{padding:0 18px 18px}.cancel-reason-button{flex:1}}
    `;
    document.head.appendChild(style);
  }

  function closeDialog(shouldCancel) {
    if (!dialog) return;
    const target = returnFocus;
    const onCancel = cancelHandler;
    if (keyHandler) document.removeEventListener('keydown', keyHandler);
    dialog.remove();
    dialog = null;
    returnFocus = null;
    cancelHandler = null;
    confirmHandler = null;
    keyHandler = null;
    if (shouldCancel && typeof onCancel === 'function') onCancel();
    if (target && typeof target.focus === 'function' && target.isConnected) target.focus();
  }

  async function openCancellationReasonDialog(options) {
    closeDialog(true);
    ensureStyles();
    const category = options && options.category === 'customer' ? 'customer' : 'business';
    const reasons = REASONS[category];
    const currentStatus = String(options && options.currentStatus || '');
    returnFocus = options && options.trigger instanceof HTMLElement ? options.trigger : document.activeElement;
    cancelHandler = options && options.onCancel;
    confirmHandler = options && options.onConfirm;

    dialog = document.createElement('div');
    dialog.className = 'cancel-reason-overlay';
    dialog.innerHTML = `
      <section class="cancel-reason-dialog" role="dialog" aria-modal="true" aria-labelledby="cancel-reason-title">
        <header class="cancel-reason-head">
          <div>
            <p class="cancel-reason-eyebrow">Cancellation</p>
            <h2 class="cancel-reason-title" id="cancel-reason-title">${category === 'customer' ? 'Why did the customer cancel?' : 'Choose cancellation reason'}</h2>
            <p class="cancel-reason-copy">Select one reason before confirming the cancellation.</p>
          </div>
          <button class="cancel-reason-close" type="button" aria-label="Close">&times;</button>
        </header>
        <div class="cancel-reason-options">
          ${reasons.map((reason, index) => `
            <label class="cancel-reason-option">
              <input type="radio" name="cancel-reason" value="${reason.value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" ${reason.value.toLowerCase() === currentStatus.toLowerCase() ? 'checked' : ''}>
              <span>${reason.label}</span>
            </label>`).join('')}
        </div>
        <footer class="cancel-reason-actions">
          <button class="cancel-reason-button cancel" type="button">Back</button>
          <button class="cancel-reason-button primary confirm" type="button" disabled>Confirm cancellation</button>
        </footer>
      </section>`;
    document.body.appendChild(dialog);

    const confirmButton = dialog.querySelector('.confirm');
    const checked = dialog.querySelector('input:checked');
    confirmButton.disabled = !checked;
    dialog.querySelectorAll('input[name="cancel-reason"]').forEach(input => {
      input.addEventListener('change', () => { confirmButton.disabled = false; });
    });
    dialog.querySelector('.cancel-reason-close').addEventListener('click', () => closeDialog(true));
    dialog.querySelector('.cancel').addEventListener('click', () => closeDialog(true));
    dialog.addEventListener('click', event => { if (event.target === dialog) closeDialog(true); });
    confirmButton.addEventListener('click', async () => {
      const selected = dialog && dialog.querySelector('input[name="cancel-reason"]:checked');
      if (!selected || typeof confirmHandler !== 'function') return;
      confirmButton.disabled = true;
      confirmButton.textContent = 'Saving…';
      try {
        const result = await confirmHandler(selected.value);
        if (result === false) {
          confirmButton.disabled = false;
          confirmButton.textContent = 'Try again';
          return;
        }
        closeDialog(false);
      } catch (error) {
        console.error('Cancellation update failed:', error);
        confirmButton.disabled = false;
        confirmButton.textContent = 'Try again';
      }
    });
    keyHandler = event => {
      if (event.key === 'Escape') closeDialog(true);
      if (event.key === 'Tab' && dialog) {
        const focusable = Array.from(dialog.querySelectorAll('button:not(:disabled),input:not(:disabled)'));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keyHandler);
    (checked || dialog.querySelector('input') || dialog.querySelector('.cancel-reason-close')).focus();
  }

  window.FIXWHEEL_CANCEL_STATUS = STATUS_CANCEL;
  window.FIXWHEEL_CUSTOMER_CANCEL_STATUS = STATUS_CUSTOMER_CANCEL;
  window.getStatusControlValue = statusControlValue;
  window.getStatusControlLabel = statusControlLabel;
  window.openCancellationReasonDialog = openCancellationReasonDialog;
})();
