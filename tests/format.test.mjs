import test from 'node:test'
import assert from 'node:assert/strict'
import { formatINR } from '../assets/js/format.js'

test('formats whole rupees with Indian grouping', () => {
  assert.equal(formatINR(999), '₹999')
  assert.equal(formatINR(1299), '₹1,299')
  assert.equal(formatINR(1899), '₹1,899')
  assert.equal(formatINR(100000), '₹1,00,000')
})
