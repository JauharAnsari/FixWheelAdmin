(function () {
  'use strict';

  const STATUS_CANCEL = '__fixwheel_cancel__';
  const STATUS_PAYMENT = '__fixwheel_payment__';
  const STATUS_DUPLICATE = 'Cancel - Duplicate order';
  const CANCEL_GROUPS = [
    { id: 'operations', label: 'Operational reason', options: [
      ['Cancel - Spare parts unavailable', 'Spare parts unavailable'],
      ['Cancel - Mechanic not available', 'Mechanic not available'],
      ['Cancel - Non-serviceable area', 'Non-serviceable area']
    ]},
    { id: 'customer', label: 'Customer reason', options: [
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
  let menu = null, outsideHandler = null, keyHandler = null;

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
  function ensureStyles() {
    if (document.getElementById('order-choice-dropdown-styles')) return;
    const style = document.createElement('style');
    style.id = 'order-choice-dropdown-styles';
    style.textContent = `.order-choice-menu{position:relative;z-index:2;width:100%;margin-top:6px;padding:3px 0;border-top:1px solid var(--border,#353535);border-bottom:1px solid var(--border,#353535);background:transparent;color:var(--text-1,#fff);font-family:'Syne',sans-serif}.order-choice-heading{padding:9px 2px 7px;color:var(--text-3,#92929c);font:600 9px/1.3 'DM Mono',monospace;letter-spacing:.08em;text-transform:uppercase}.order-choice-group,.order-choice-item{width:100%;min-height:40px;border:0;border-bottom:1px solid var(--border,#353535);border-radius:0;background:transparent;color:inherit;text-align:left;cursor:pointer}.order-choice-group{display:flex;align-items:center;justify-content:space-between;padding:0 3px;font:650 12px/1.3 'Syne',sans-serif}.order-choice-group:hover,.order-choice-group[aria-expanded=true],.order-choice-item:hover,.order-choice-item:focus-visible{color:var(--text-1,#fff);background:var(--surface-2,#202020)}.order-choice-chevron{width:16px;height:16px;color:var(--text-3,#92929c);transition:transform .16s ease}.order-choice-group[aria-expanded=true] .order-choice-chevron{transform:rotate(180deg)}.order-choice-submenu{display:none;padding:2px 0 4px}.order-choice-submenu.open{display:block}.order-choice-item{display:block;padding:9px 14px;font:550 11px/1.35 'Syne',sans-serif}.order-choice-item.current{color:var(--red,#ff474d);background:rgba(255,71,77,.08)}.order-choice-item:focus-visible,.order-choice-group:focus-visible{outline:2px solid var(--blue,#3b82f6);outline-offset:-2px}.order-choice-saving{opacity:.55;pointer-events:none}`;
    document.head.appendChild(style);
  }
  function closeOrderChoiceDropdown(cancelled) {
    if (!menu) return;
    const trigger = menu._trigger, onCancel = menu._onCancel;
    document.removeEventListener('pointerdown', outsideHandler, true);
    document.removeEventListener('keydown', keyHandler, true);
    menu.remove(); menu = null; outsideHandler = null; keyHandler = null;
    if (cancelled && typeof onCancel === 'function') onCancel();
    if (cancelled && trigger && trigger.isConnected) trigger.focus();
  }
  function optionButton(value, label, currentStatus) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `order-choice-item${String(currentStatus).toLowerCase() === value.toLowerCase() ? ' current' : ''}`;
    button.dataset.value = value; button.textContent = label;
    return button;
  }
  function openOrderChoiceDropdown(options) {
    closeOrderChoiceDropdown(true); ensureStyles();
    const trigger = options && options.trigger;
    if (!(trigger instanceof HTMLElement)) return;
    const kind = options.kind === 'payment' ? 'payment' : 'cancel';
    const currentStatus = String(options.currentStatus || '');
    menu = document.createElement('div'); menu.className = 'order-choice-menu'; menu.setAttribute('role', 'menu');
    menu._trigger = trigger; menu._onCancel = options.onCancel;
    menu.innerHTML = `<div class="order-choice-heading">${kind === 'payment' ? 'Payment received by' : 'Cancellation reason'}</div>`;
    if (kind === 'cancel') {
      CANCEL_GROUPS.forEach((group, index) => {
        const groupButton = document.createElement('button');
        groupButton.type = 'button'; groupButton.className = 'order-choice-group'; groupButton.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
        groupButton.innerHTML = `<span>${group.label}</span><svg class="order-choice-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m5 7 5 5 5-5"/></svg>`;
        const submenu = document.createElement('div'); submenu.className = `order-choice-submenu${index === 0 ? ' open' : ''}`;
        group.options.forEach(([value, label]) => submenu.appendChild(optionButton(value, label, currentStatus)));
        groupButton.addEventListener('click', () => {
          const open = groupButton.getAttribute('aria-expanded') === 'true';
          menu.querySelectorAll('.order-choice-group').forEach(item => item.setAttribute('aria-expanded', 'false'));
          menu.querySelectorAll('.order-choice-submenu').forEach(item => item.classList.remove('open'));
          if (!open) { groupButton.setAttribute('aria-expanded', 'true'); submenu.classList.add('open'); }
        });
        menu.append(groupButton, submenu);
      });
    } else PAYMENT_OPTIONS.forEach(([value, label]) => menu.appendChild(optionButton(value, label, currentStatus)));
    menu.addEventListener('click', async event => {
      const item = event.target.closest('.order-choice-item');
      if (!item || typeof options.onConfirm !== 'function') return;
      menu.classList.add('order-choice-saving');
      try { const saved = await options.onConfirm(item.dataset.value); if (saved === false) { menu.classList.remove('order-choice-saving'); return; } closeOrderChoiceDropdown(false); }
      catch (error) { console.error('Order status update failed:', error); menu.classList.remove('order-choice-saving'); }
    });
    trigger.insertAdjacentElement('afterend', menu);
    outsideHandler = event => { if (menu && !menu.contains(event.target) && event.target !== trigger) closeOrderChoiceDropdown(true); };
    keyHandler = event => { if (event.key === 'Escape') closeOrderChoiceDropdown(true); };
    setTimeout(() => document.addEventListener('pointerdown', outsideHandler, true), 0);
    document.addEventListener('keydown', keyHandler, true); menu.querySelector('button')?.focus();
  }
  window.FIXWHEEL_CANCEL_STATUS = STATUS_CANCEL;
  window.FIXWHEEL_PAYMENT_STATUS = STATUS_PAYMENT;
  window.FIXWHEEL_DUPLICATE_STATUS = STATUS_DUPLICATE;
  window.getStatusControlValue = statusControlValue;
  window.getStatusControlLabel = statusControlLabel;
  window.openOrderChoiceDropdown = openOrderChoiceDropdown;
  window.closeOrderChoiceDropdown = closeOrderChoiceDropdown;
})();
