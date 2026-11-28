(function () {
  'use strict';

  const STATUS_CANCEL = '__fixwheel_cancel__';
  const STATUS_PAYMENT = '__fixwheel_payment__';
  const STATUS_DUPLICATE = 'Cancel - Duplicate order';
  const CANCEL_GROUPS = [
    { label: 'Operational reason', options: [
      ['Cancel - Spare parts unavailable', 'Spare parts unavailable'],
      ['Cancel - Mechanic not available', 'Mechanic not available'],
      ['Cancel - Non-serviceable area', 'Non-serviceable area']
    ]},
    { label: 'Customer reason', options: [
      ['Cancel - Customer requested cancellation', 'Customer requested cancellation'],
      ['Cancel - Order taken by competitor', 'Order taken by competitor'],
      ['Cancel - Rate too high', 'Rate too high'],
      ['Cancel - Order delayed', 'Order delayed']
    ]}
  ];
  const PAYMENT_OPTIONS = [
    ['Completed - Payment received by FixWheel', 'FixWheel'],
    ['Completed - Payment received by Mechanic', 'Mechanic']
  ];
  let dialog = null, returnFocus = null, cancelHandler = null, keyHandler = null;

  function statusControlValue(status) {
    const value = String(status || '').trim(), normalized = value.toLowerCase();
    if (normalized.includes('duplicate order')) return STATUS_DUPLICATE;
    if (normalized === 'cancel' || normalized === 'cancel order') return STATUS_CANCEL;
    if (normalized === 'completed - payment received' || normalized === 'payment received') return STATUS_PAYMENT;
    return value || 'Pending';
  }
  function statusControlLabel(value) {
    if (value === STATUS_CANCEL) return 'Cancel order';
    if (value === STATUS_PAYMENT) return 'Completed - Payment received';
    if (value === STATUS_DUPLICATE) return 'Duplicate order';
    return value;
  }
  function escapeHtml(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function ensureStyles() {
    if (document.getElementById('order-choice-dialog-styles')) return;
    const style = document.createElement('style');
    style.id = 'order-choice-dialog-styles';
    style.textContent = `.order-choice-overlay{position:fixed;inset:0;z-index:14000;display:grid;place-items:center;padding:20px;background:rgba(0,0,0,.76);backdrop-filter:blur(6px)}.order-choice-dialog{width:min(760px,100%);max-height:calc(100vh - 40px);overflow:auto;border:1px solid var(--border,#303030);border-radius:18px;background:var(--surface,#151515);color:var(--text-1,#fff);box-shadow:0 28px 90px rgba(0,0,0,.62)}.order-choice-head{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:24px 28px 20px;border-bottom:1px solid var(--border,#303030)}.order-choice-title{margin:0;font:700 25px/1.15 'Syne',sans-serif}.order-choice-copy{margin:8px 0 0;color:var(--text-3,#92929c);font:400 12px/1.5 'DM Mono',monospace}.order-choice-close{flex:0 0 auto;width:40px;height:40px;border:1px solid var(--border,#3a3a3a);border-radius:10px;background:transparent;color:inherit;font-size:22px;cursor:pointer}.order-choice-body{display:grid;gap:22px;padding:22px 28px}.order-choice-group-title{margin:0 0 10px;font:650 15px/1.3 'Syne',sans-serif}.order-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.order-choice-option{display:flex;align-items:center;gap:12px;min-height:58px;padding:14px 16px;border:1px solid var(--border,#353535);border-radius:12px;background:var(--surface-2,#202020);cursor:pointer;transition:border-color .15s,background .15s}.order-choice-option:hover{border-color:var(--border-hi,#5a5a5a)}.order-choice-option:has(input:checked){border-color:var(--red,#ff474d);background:rgba(255,71,77,.1)}.order-choice-option input{width:18px;height:18px;margin:0;accent-color:var(--red,#ff474d)}.order-choice-option span{font:600 13px/1.35 'Syne',sans-serif}.order-choice-actions{display:flex;justify-content:flex-end;gap:10px;padding:0 28px 24px}.order-choice-button{min-height:44px;padding:0 18px;border:1px solid var(--border,#3a3a3a);border-radius:10px;background:var(--surface-2,#202020);color:inherit;font:650 13px 'Syne',sans-serif;cursor:pointer}.order-choice-button.primary{border-color:var(--red,#ff474d);background:var(--red,#ff474d);color:#fff}.order-choice-button:disabled{opacity:.45;cursor:not-allowed}@media(max-width:650px){.order-choice-overlay{align-items:end;padding:10px}.order-choice-dialog{max-height:calc(100vh - 20px)}.order-choice-head{padding:20px 18px 16px}.order-choice-body{padding:18px}.order-choice-grid{grid-template-columns:1fr}.order-choice-actions{padding:0 18px 18px}.order-choice-button{flex:1}}`;
    document.head.appendChild(style);
  }
  function closeOrderChoiceDropdown(cancelled) {
    if (!dialog) return;
    const focusTarget = returnFocus, onCancel = cancelHandler;
    document.removeEventListener('keydown', keyHandler);
    dialog.remove(); dialog = null; returnFocus = null; cancelHandler = null; keyHandler = null;
    if (cancelled && typeof onCancel === 'function') onCancel();
    if (focusTarget?.isConnected) focusTarget.focus();
  }
  function optionMarkup(value, label, currentStatus) {
    const checked = String(currentStatus).toLowerCase() === value.toLowerCase() ? ' checked' : '';
    return `<label class="order-choice-option"><input type="radio" name="order-choice" value="${escapeHtml(value)}"${checked}><span>${escapeHtml(label)}</span></label>`;
  }
  function openOrderChoiceDropdown(options) {
    closeOrderChoiceDropdown(true); ensureStyles();
    const kind = options?.kind === 'payment' ? 'payment' : 'cancel';
    const currentStatus = String(options?.currentStatus || '');
    returnFocus = options?.trigger instanceof HTMLElement ? options.trigger : document.activeElement;
    cancelHandler = options?.onCancel;
    const content = kind === 'cancel'
      ? CANCEL_GROUPS.map(group => `<section><h3 class="order-choice-group-title">${group.label}</h3><div class="order-choice-grid">${group.options.map(item => optionMarkup(item[0], item[1], currentStatus)).join('')}</div></section>`).join('')
      : `<section><h3 class="order-choice-group-title">Payment received by</h3><div class="order-choice-grid">${PAYMENT_OPTIONS.map(item => optionMarkup(item[0], item[1], currentStatus)).join('')}</div></section>`;
    dialog = document.createElement('div'); dialog.className = 'order-choice-overlay';
    dialog.innerHTML = `<section class="order-choice-dialog" role="dialog" aria-modal="true" aria-labelledby="order-choice-title"><header class="order-choice-head"><div><h2 class="order-choice-title" id="order-choice-title">${kind === 'cancel' ? 'Cancel order' : 'Payment received'}</h2><p class="order-choice-copy">${kind === 'cancel' ? 'Select the cancellation reason.' : 'Select who received the payment.'}</p></div><button class="order-choice-close" type="button" aria-label="Close">&times;</button></header><div class="order-choice-body">${content}</div><footer class="order-choice-actions"><button class="order-choice-button cancel" type="button">Back</button><button class="order-choice-button primary confirm" type="button" disabled>${kind === 'cancel' ? 'Cancel order' : 'Mark completed'}</button></footer></section>`;
    document.body.appendChild(dialog);
    const confirm = dialog.querySelector('.confirm');
    const selected = dialog.querySelector('input:checked');
    confirm.disabled = !selected;
    dialog.querySelectorAll('input[name="order-choice"]').forEach(input => input.addEventListener('change', () => { confirm.disabled = false; }));
    dialog.querySelector('.order-choice-close').addEventListener('click', () => closeOrderChoiceDropdown(true));
    dialog.querySelector('.cancel').addEventListener('click', () => closeOrderChoiceDropdown(true));
    dialog.addEventListener('click', event => { if (event.target === dialog) closeOrderChoiceDropdown(true); });
    confirm.addEventListener('click', async () => {
      const choice = dialog?.querySelector('input[name="order-choice"]:checked');
      if (!choice || typeof options?.onConfirm !== 'function') return;
      confirm.disabled = true; const original = confirm.textContent; confirm.textContent = 'Saving…';
      try {
        const saved = await options.onConfirm(choice.value);
        if (saved === false) { confirm.disabled = false; confirm.textContent = original; return; }
        closeOrderChoiceDropdown(false);
      } catch (error) { console.error('Order choice update failed', error); confirm.disabled = false; confirm.textContent = original; }
    });
    keyHandler = event => {
      if (event.key === 'Escape') closeOrderChoiceDropdown(true);
      if (event.key === 'Tab' && dialog) {
        const focusable = [...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled)')];
        if (!focusable.length) return;
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', keyHandler);
    (selected || dialog.querySelector('input') || dialog.querySelector('.order-choice-close')).focus();
  }
  window.FIXWHEEL_CANCEL_STATUS = STATUS_CANCEL;
  window.FIXWHEEL_PAYMENT_STATUS = STATUS_PAYMENT;
  window.FIXWHEEL_DUPLICATE_STATUS = STATUS_DUPLICATE;
  window.getStatusControlValue = statusControlValue;
  window.getStatusControlLabel = statusControlLabel;
  window.openOrderChoiceDropdown = openOrderChoiceDropdown;
  window.closeOrderChoiceDropdown = closeOrderChoiceDropdown;
})();
