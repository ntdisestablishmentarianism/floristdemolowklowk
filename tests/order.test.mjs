import test from 'node:test'
import assert from 'node:assert/strict'
import {
  makeReference,
  validateOrderForm,
  buildOrderPayload,
  submitOrder,
} from '../assets/js/order.js'

const validForm = {
  name: 'Ananya Baruah',
  phone: '9954193440',
  altPhone: '',
  address: '12, MG Road',
  landmark: 'near the post office',
  pincode: '786001',
  date: '2026-10-20',
  slot: 'Morning (8am – 12pm)',
  recipient: 'Ritu',
  occasion: 'Birthday',
  cardMessage: 'Many happy returns',
  payment: 'Cash on delivery',
  notes: '',
}

const lines = [{ name: 'Xewali Dawn', qty: 2, lineTotal: 1298 }]
const totals = { subtotal: 1298, discount: 130, deliveryFee: 0, total: 1168 }

test('makeReference looks like KOP-YYMMDD-XXXX', () => {
  assert.match(makeReference(), /^KOP-\d{6}-[A-Z0-9]{4}$/)
})

test('makeReference is deterministic when given a date and rand', () => {
  const ref = makeReference(new Date(2026, 0, 14), () => 0)
  assert.equal(ref, 'KOP-260114-AAAA')
})

test('an empty form reports errors for name, phone and address', () => {
  const { ok, errors } = validateOrderForm({})
  assert.equal(ok, false)
  assert.ok(errors.name)
  assert.ok(errors.phone)
  assert.ok(errors.address)
})

test('a valid form passes validation', () => {
  const { ok, errors } = validateOrderForm(validForm)
  assert.equal(ok, true)
  assert.deepEqual(errors, {})
})

test('a form without a valid payment method is rejected', () => {
  const { ok, errors } = validateOrderForm({ ...validForm, payment: 'Bitcoin' })
  assert.equal(ok, false)
  assert.ok(errors.payment)
})

test('buildOrderPayload carries every customer field and formatted money', () => {
  const p = buildOrderPayload({
    reference: 'KOP-260114-AB12',
    lines,
    customer: validForm,
    totals,
  })
  assert.ok(p._subject)
  assert.equal(p.reference, 'KOP-260114-AB12')
  assert.equal(p.name, 'Ananya Baruah')
  assert.equal(p.phone, '9954193440')
  assert.equal(p.address.includes('MG Road'), true)
  assert.equal(p.pincode, '786001')
  assert.equal(p.payment, 'Cash on delivery')
  assert.match(p.items, /Xewali Dawn/)
  assert.match(p.items, /2/)
  assert.equal(p.subtotal, '₹1,298')
  assert.equal(p.discount, '₹130')
  assert.equal(p.total, '₹1,168')
})

test('buildOrderPayload shows delivery as Free when there is no fee', () => {
  const p = buildOrderPayload({ reference: 'r', lines, customer: validForm, totals })
  assert.equal(p.delivery, 'Free')
})

test('buildOrderPayload preserves an emoji and quotes in the card message', () => {
  const message = 'Happy birthday! 🎉 "with love"'
  const p = buildOrderPayload({
    reference: 'r',
    lines,
    customer: { ...validForm, cardMessage: message },
    totals,
  })
  assert.equal(p.cardMessage, message)
})

test('a non-2xx response is reported as a failure', async () => {
  const fakeFetch = async () => ({ ok: false, status: 429 })
  const r = await submitOrder({}, 'https://example.test/f/x', fakeFetch)
  assert.equal(r.ok, false)
  assert.ok(r.error)
})

test('a network error is reported as a failure, not a success', async () => {
  const fakeFetch = async () => {
    throw new Error('offline')
  }
  const r = await submitOrder({}, 'https://example.test/f/x', fakeFetch)
  assert.equal(r.ok, false)
})

test('a 2xx response is a success and posts JSON with an Accept header', async () => {
  let seen
  const fakeFetch = async (url, init) => {
    seen = init
    return { ok: true, status: 200 }
  }
  const r = await submitOrder({ a: 'b' }, 'https://example.test/f/x', fakeFetch)
  assert.equal(r.ok, true)
  assert.equal(seen.method, 'POST')
  assert.equal(seen.headers['Accept'], 'application/json')
  assert.equal(JSON.parse(seen.body).a, 'b')
})
