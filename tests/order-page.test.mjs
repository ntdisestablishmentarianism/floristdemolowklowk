import test from 'node:test'
import assert from 'node:assert/strict'
import { summaryRows, whatsAppLink } from '../assets/js/pages/order.js'
import { config } from '../assets/js/site.config.js'

const totals = { subtotal: 1298, discount: 130, deliveryFee: 0, total: 1168 }

test('summaryRows lists Subtotal, Discount, Delivery and Total with formatted values', () => {
  const rows = summaryRows(totals)
  assert.deepEqual(
    rows.map((r) => r.label),
    ['Subtotal', 'Discount', 'Delivery', 'Total'],
  )
  assert.equal(rows[0].value, '₹1,298')
  assert.match(rows[1].value, /130/)
  assert.equal(rows[3].value, '₹1,168')
})

test('summaryRows shows Free delivery when there is no fee', () => {
  const rows = summaryRows({ ...totals, deliveryFee: 0 })
  assert.equal(rows.find((r) => r.label === 'Delivery').value, 'Free')
})

test('summaryRows shows the fee when delivery is chargeable', () => {
  const rows = summaryRows({ subtotal: 300, discount: 0, deliveryFee: 49, total: 349 })
  assert.equal(rows.find((r) => r.label === 'Delivery').value, '₹49')
})

test('whatsAppLink points at the owner number and carries the reference', () => {
  const link = whatsAppLink(config, 'KOP-260114-AB12')
  assert.ok(link.startsWith('https://wa.me/919954193440?text='))
  assert.ok(decodeURIComponent(link).includes('KOP-260114-AB12'))
})
