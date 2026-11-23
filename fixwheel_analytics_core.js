(function (root, factory) {
  const analytics = factory();
  if (typeof module === 'object' && module.exports) module.exports = analytics;
  if (root) root.FixWheelAnalytics = analytics;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function statusText(booking) {
    return [booking?.order_status, booking?.status]
      .filter(value => value !== null && value !== undefined && String(value).trim())
      .join(' ')
      .toLowerCase();
  }

  function isTestBooking(booking) {
    const status = statusText(booking);
    return booking?.is_test_order === true
      || booking?.is_test_order === 'true'
      || status.includes('test order')
      || status.includes('sandbox');
  }

  function isCompletedBooking(booking) {
    const status = statusText(booking);
    return status.includes('completed') || status.includes('payment received');
  }

  function getCompletionTimestamp(booking) {
    // Financial reporting must always use an actual lifecycle timestamp.
    // Scheduled fields such as bookingDate/preferredSlot are intentionally
    // excluded because an order may be completed on a different day/month.
    return booking?.finished_at
      || booking?.order_finished_date
      || booking?.createdAt
      || booking?.created_at
      || null;
  }

  function getRevenueAmount(booking) {
    return Number(booking?.Final_Amount) || Number(booking?.price) || 0;
  }

  return Object.freeze({
    statusText,
    isTestBooking,
    isCompletedBooking,
    getCompletionTimestamp,
    getRevenueAmount
  });
});
