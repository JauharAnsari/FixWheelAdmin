(function () {
  'use strict';

  const STATUS_CANCEL = '__fixwheel_cancel__';
  const REASON_GROUPS = [
    {
      id: 'operations',
      title: 'Operational reasons',
      description: 'The order cannot be fulfilled by FixWheel or its partner.',
      reasons: [
        { value: 'Cancel - spare parts', label: 'Spare parts unavailable' },
        { value: 'Cancel - mechanic not available', label: 'Mechanic not available' },
        { value: 'Cancel - Duplicate order', label: 'Duplicate order' },
        { value: 'Cancel - Non serviceable area', label: 'Non-serviceable area' }
      ]
    },
    {
      id: 'customer',
      title: 'Customer reasons',
      description: 'The customer asked for the order to be cancelled.',
      reasons: [
        { value: 'Customer cancel', label: 'Customer requested cancellation' },
        { value: 'Customer cancel - order taken by competitor', label: 'Order taken by competitor' },
        { value: 'Customer cancel - rate high', label: 'Rate too high' },
        { value: 'Customer cancel - order delay', label: 'Order delayed' }
      ]
    }
  ];

  let dialog = null;
  let returnFocus = null;
  let cancelHandler = null;
  let confirmHandler = null;
  let keyHandler = null;

  function statusControlValue(status) {
    const normalized = String(status || '').trim().toLowerCase();
    if (normalized.includes('cancel')) return STATUS_CANCEL;
    return status || 'Pending';
  }

  function statusControlLabel(value) {
    if (value === STATUS_CANCEL) return 'Cancel order';
    return value;
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function ensureStyles() {
    if (document.getElementById('cancellation-dialog-styles')) return;
    const style = document.createElement('style');
    style.id = 'cancellation-dialog-styles';
    style.textContent = `
      .cancel-reason-overlay{position:fixed;inset:0;z-index:12000;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.78)}
      .cancel-reason-dialog{width:min(640px,100%);max-height:min(760px,calc(100vh - 40px));overflow:auto;border:1px solid var(--border,#333);border-radius:16px;background:var(--surface,#151515);color:var(--text-1,#fff);box-shadow:0 28px 80px rgba(0,0,0,.58)}
      .cancel-reason-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:24px 24px 18px;border-bottom:1px solid var(--border,#2b2b2b)}
      .cancel-reason-title{margin:0;font:700 24px/1.15 'Syne',sans-serif;color:var(--text-1,#fff)}
      .cancel-reason-copy{max-width:54ch;margin:8px 0 0;color:var(--text-2,#b4b4bd);font:400 13px/1.55 'DM Mono',monospace}
      .cancel-reason-close{flex:0 0 auto;width:38px;height:38px;border:1px solid var(--border,#3a3a3a);border-radius:10px;background:transparent;color:inherit;font-size:22px;line-height:1;cursor:pointer}
      .cancel-reason-close:hover{border-color:var(--border-hi,#666);background:var(--surface-2,#1d1d1d)}
      .cancel-reason-options{display:grid;gap:22px;padding:20px 24px 24px}
      .cancel-reason-group{display:grid;gap:10px}
      .cancel-reason-group-head{display:flex;align-items:baseline;justify-content:space-between;gap:16px}
      .cancel-reason-group-title{margin:0;font:700 15px/1.3 'Syne',sans-serif;color:var(--text-1,#fff)}
      .cancel-reason-group-copy{margin:0;color:var(--text-3,#92929c);font:400 11px/1.45 'DM Mono',monospace;text-align:right}
      .cancel-reason-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .cancel-reason-option{display:grid;grid-template-columns:18px minmax(0,1fr);align-items:center;gap:12px;min-height:58px;padding:14px 15px;border:1px solid var(--border,#333);border-radius:12px;background:var(--surface-2,#1d1d1d);cursor:pointer;transition:border-color .15s ease,background .15s ease,transform .15s ease}
      .cancel-reason-option:hover{border-color:var(--border-hi,#666);transform:translateY(-1px)}.cancel-reason-option:has(input:checked){border-color:var(--red,#ff474d);background:rgba(255,71,77,.1)}
      .cancel-reason-option input{width:18px;height:18px;margin:0;accent-color:var(--red,#ff474d)}
      .cancel-reason-option-label{font:650 14px/1.35 'Syne',sans-serif;color:var(--text-1,#fff)}
      .cancel-reason-actions{position:sticky;bottom:0;display:flex;justify-content:flex-end;gap:10px;padding:16px 24px 24px;border-top:1px solid var(--border,#2b2b2b);background:var(--surface,#151515)}
      .cancel-reason-button{min-height:44px;padding:0 18px;border:1px solid var(--border,#3a3a3a);border-radius:10px;background:var(--surface-2,#202020);color:inherit;font:600 13px 'Syne',sans-serif;cursor:pointer}
      .cancel-reason-button:hover:not(:disabled){border-color:var(--border-hi,#666)}.cancel-reason-button.primary{border-color:var(--red,#ff474d);background:var(--red,#ff474d);color:#fff}.cancel-reason-button:disabled{opacity:.45;cursor:not-allowed}
      @media(max-width:600px){.cancel-reason-overlay{align-items:end;padding:0}.cancel-reason-dialog{max-height:92vh;border-radius:16px 16px 0 0}.cancel-reason-head{padding:20px 18px 16px}.cancel-reason-title{font-size:21px}.cancel-reason-options{gap:20px;padding:16px 18px 20px}.cancel-reason-group-head{display:grid;gap:4px}.cancel-reason-group-copy{text-align:left}.cancel-reason-grid{grid-template-columns:1fr}.cancel-reason-option{min-height:56px}.cancel-reason-actions{padding:14px 18px 18px}.cancel-reason-button{flex:1}}
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
            <h2 class="cancel-reason-title" id="cancel-reason-title">Cancel order</h2>
            <p class="cancel-reason-copy">Choose the reason that best explains why this order is being cancelled.</p>
          </div>
          <button class="cancel-reason-close" type="button" aria-label="Close">&times;</button>
        </header>
        <div class="cancel-reason-options">
          ${REASON_GROUPS.map(group => `
            <section class="cancel-reason-group" aria-labelledby="cancel-group-${group.id}">
              <div class="cancel-reason-group-head">
                <h3 class="cancel-reason-group-title" id="cancel-group-${group.id}">${escapeHtml(group.title)}</h3>
                <p class="cancel-reason-group-copy">${escapeHtml(group.description)}</p>
              </div>
              <div class="cancel-reason-grid">
                ${group.reasons.map(reason => `
                  <label class="cancel-reason-option">
                    <input type="radio" name="cancel-reason" value="${escapeHtml(reason.value)}" ${reason.value.toLowerCase() === currentStatus.toLowerCase() ? 'checked' : ''}>
                    <span class="cancel-reason-option-label">${escapeHtml(reason.label)}</span>
                  </label>`).join('')}
              </div>
            </section>`).join('')}
        </div>
        <footer class="cancel-reason-actions">
          <button class="cancel-reason-button cancel" type="button">Keep order</button>
          <button class="cancel-reason-button primary confirm" type="button" disabled>Cancel order</button>
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
  window.FIXWHEEL_CUSTOMER_CANCEL_STATUS = STATUS_CANCEL;
  window.getStatusControlValue = statusControlValue;
  window.getStatusControlLabel = statusControlLabel;
  window.openCancellationReasonDialog = openCancellationReasonDialog;
})();
