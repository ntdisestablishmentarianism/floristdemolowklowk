import test from 'node:test'
import assert from 'node:assert/strict'
import { computeTotals, DELIVERY_FEE, FREE_DELIVERY_MIN } from '../assets/js/pricing.js'

const items = (price, qty = 1) => [{ price, qty }]

test('free delivery begins exactly at ₹499', () => {
  assert.equal(computeTotals({ items: items(499) }).deliveryFee, 0)
  assert.equal(computeTotals({ items: items(498) }).deliveryFee, DELIVERY_FEE)
})

test('a coupon never removes free delivery', () => {
  const t = computeTotals({ items: items(520), couponCode: 'WELCOME10' })
  assert.equal(t.discount, 52)
  assert.equal(t.deliveryFee, 0)
  assert.equal(t.total, 468)
})

test('percent discounts stay whole rupees', () => {
  const t = computeTotals({ items: items(649), couponCode: 'WELCOME10' })
  assert.equal(Number.isInteger(t.discount), true)
  assert.equal(Number.isInteger(t.total), true)
})

test('FREEDEL zeroes a fee that would otherwise apply', () => {
  const t = computeTotals({ items: items(300), couponCode: 'FREEDEL' })
  assert.equal(t.deliveryFee, 0)
  assert.equal(t.total, 300)
})

test('an empty cart totals to zero', () => {
  const t = computeTotals({ items: [] })
  assert.deepEqual(
    { s: t.subtotal, d: t.deliveryFee, tot: t.total },
    { s: 0, d: 0, tot: 0 },
  )
})

test('an invalid coupon reports an error and discounts nothing', () => {
  const t = computeTotals({ items: items(300), couponCode: 'NOPE' })
  assert.equal(t.discount, 0)
  assert.ok(t.couponError)
  assert.equal(t.couponCode, '')
})

test('free delivery is measured on the pre-discount subtotal', () => {
  const t = computeTotals({ items: items(498), couponCode: 'SAVE100' })
  assert.equal(FREE_DELIVERY_MIN, 499)
  assert.equal(t.deliveryFee, DELIVERY_FEE)
})
