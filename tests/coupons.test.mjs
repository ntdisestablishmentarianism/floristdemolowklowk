import test from 'node:test'
import assert from 'node:assert/strict'
import { applyCoupon, COUPONS } from '../assets/js/coupons.js'

test('WELCOME10 gives 10% off at or above the minimum', () => {
  const r = applyCoupon('WELCOME10', 1000)
  assert.equal(r.ok, true)
  assert.equal(r.discount, 100)
})

test('coupon below its minimum is rejected with a message', () => {
  const r = applyCoupon('WELCOME10', 400)
  assert.equal(r.ok, false)
  assert.match(r.error, /minimum|₹499/i)
})

test('codes are case-insensitive and ignore surrounding spaces', () => {
  const r = applyCoupon('  welcome10 ', 1000)
  assert.equal(r.ok, true)
  assert.equal(r.code, 'WELCOME10')
})

test('an unknown code is rejected, never a silent zero discount', () => {
  const r = applyCoupon('NOPE', 1000)
  assert.equal(r.ok, false)
  assert.ok(typeof r.error === 'string' && r.error.length > 0)
})

test('FREEDEL waives delivery with no discount', () => {
  const r = applyCoupon('FREEDEL', 300)
  assert.equal(r.ok, true)
  assert.equal(r.discount, 0)
  assert.equal(r.freeDelivery, true)
})

test('BIHU15 gives 15% off at its ₹999 minimum and rounds to whole rupees', () => {
  const r = applyCoupon('BIHU15', 999)
  assert.equal(r.ok, true)
  assert.equal(r.discount, 150)
  assert.equal(Number.isInteger(r.discount), true)
  assert.equal(applyCoupon('BIHU15', 998).ok, false)
})

test('SAVE100 takes a flat ₹100 at its ₹899 minimum', () => {
  const r = applyCoupon('SAVE100', 899)
  assert.equal(r.ok, true)
  assert.equal(r.discount, 100)
  assert.equal(applyCoupon('SAVE100', 898).ok, false)
})

test('the four documented coupons are the whole table', () => {
  assert.deepEqual(Object.keys(COUPONS).sort(), ['BIHU15', 'FREEDEL', 'SAVE100', 'WELCOME10'])
})
