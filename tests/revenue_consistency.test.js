const assert = require('node:assert/strict');
const analytics = require('../fixwheel_analytics_core.js');

const previouslyExcludedOrders = [
  { bookingRef: 'FW-C6E5E916', customerName: 'Kaankshit Singh', order_status: 'Completed - Payment received by FixWheel', bookingDate: '2026-10-31', finished_at: '2026-11-01T16:14:45.127Z', Final_Amount: 8000, price: 0 },
  { bookingRef: 'FW-E20BE14B', customerName: 'LAKSHYA Singh', order_status: 'Completed - Payment received by FixWheel', source: 'App', bookingDate: '2026-05-20', preferredSlot: '31/10/2026 (11:00 AM - 12:00 PM)', finished_at: '2026-11-02T17:29:58.173Z', Final_Amount: 8000, price: 0 },
  { bookingRef: 'FW-EE163D87', customerName: 'Akash Gupta', order_status: 'Completed - Payment received by FixWheel', bookingDate: '2026-10-19T18:30:00.000Z', finished_at: '2026-11-04T11:56:38.422Z', Final_Amount: 500, price: 0 },
  { bookingRef: 'FW-11470DCE', customerName: 'Vinay Dahiya', order_status: 'Completed - Payment received by FixWheel', bookingDate: '2026-10-26', finished_at: '2026-11-15T05:27:54.589Z', Final_Amount: 14000, price: 0 }
];

for (const order of previouslyExcludedOrders) {
  assert.equal(analytics.isCompletedBooking(order), true, `${order.bookingRef} must be completed`);
  assert.match(analytics.getCompletionTimestamp(order), /^2026-11-/, `${order.bookingRef} must be counted in November by completion date`);
  assert.notEqual(analytics.getCompletionTimestamp(order), order.bookingDate, `${order.bookingRef} must never use its scheduled date for revenue`);
}

assert.equal(
  previouslyExcludedOrders.reduce((total, order) => total + analytics.getRevenueAmount(order), 0),
  30500,
  'The four regression orders must contribute ₹30,500'
);

assert.equal(analytics.isCompletedBooking({ order_status: 'pending', status: 'Completed' }), true, 'Both status fields must be considered');
assert.equal(analytics.getRevenueAmount({ Final_Amount: 0, price: 399 }), 399, 'Price remains the fallback when final amount is absent');
assert.equal(analytics.isTestBooking({ order_status: 'Test Order' }), true, 'Test orders must stay outside production revenue');

console.log('Revenue consistency regression checks passed.');
