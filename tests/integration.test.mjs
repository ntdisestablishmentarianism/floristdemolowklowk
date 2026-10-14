import test from 'node:test'
import assert from 'node:assert/strict'
import { createCart } from '../assets/js/cart.js'
import { computeTotals } from '../assets/js/pricing.js'
import { buildOrderPayload, makeReference } from '../assets/js/order.js'

/**
 * Regression guard: the cart and the totals engine must actually fit together.
 * The bug this catches is subtle — cart.items() carries {id, qty}, while
 * computeTotals() needs {price, qty}. Wiring them up wrong produces ₹NaN, which
 * no unit test of either module alone would notice.
 */

function fakeStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
  }
}

test('pricedItems yields what the totals engine needs', () => {
  const cart = createCart(fakeStorage())
  cart.add('xewali-dawn', 2) // ₹649
  cart.add('peace-lily', 1) // ₹349
  assert.deepEqual(cart.pricedItems(), [
    { price: 649, qty: 2 },
    { price: 349, qty: 1 },
  ])
})

test('cart → totals never produces NaN, with or without a coupon', () => {
  const cart = createCart(fakeStorage())
  cart.add('xewali-dawn', 2)
  cart.add('peace-lily', 1)

  const plain = computeTotals({ items: cart.pricedItems() })
  assert.equal(plain.subtotal, 1647)
  assert.equal(plain.deliveryFee, 0)
  assert.equal(plain.total, 1647)

  const discounted = computeTotals({ items: cart.pricedItems(), couponCode: 'WELCOME10' })
  assert.equal(discounted.subtotal, 1647)
  assert.equal(discounted.discount, 165)
  assert.equal(discounted.total, 1482)
  for (const v of [discounted.subtotal, discounted.discount, discounted.deliveryFee, discounted.total]) {
    assert.equal(Number.isNaN(v), false)
  }
})

test('a full journey builds an order payload with real money, never NaN', () => {
  const cart = createCart(fakeStorage())
  cart.add('xewali-dawn', 2)
  cart.add('peace-lily', 1)
  const totals = computeTotals({ items: cart.pricedItems(), couponCode: 'WELCOME10' })

  const payload = buildOrderPayload({
    reference: makeReference(),
    lines: cart.detailed().map((l) => ({ name: l.product.name, qty: l.qty, lineTotal: l.lineTotal })),
    customer: { name: 'A', phone: '9954193440', address: 'x', payment: 'Cash on delivery' },
    totals,
  })

  assert.equal(payload.subtotal, '₹1,647')
  assert.equal(payload.discount, '₹165')
  assert.equal(payload.delivery, 'Free')
  assert.equal(payload.total, '₹1,482')
  assert.equal(JSON.stringify(payload).includes('NaN'), false)
})
