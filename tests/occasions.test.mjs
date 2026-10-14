import test from 'node:test'
import assert from 'node:assert/strict'
import { byOccasion, OCCASION_ORDER } from '../assets/js/pages/occasions.js'

const P = [
  { id: 'a', occasion: 'Birthday' },
  { id: 'b', occasion: 'Festive (Bihu)' },
  { id: 'c', occasion: 'Birthday' },
  { id: 'd', occasion: 'Sympathy' },
]

test('returns only the requested occasion', () => {
  assert.deepEqual(byOccasion(P, 'Birthday').map((p) => p.id), ['a', 'c'])
})

test('preserves the input order of the matches', () => {
  const mixed = [P[2], P[0], P[1]]
  assert.deepEqual(byOccasion(mixed, 'Birthday').map((p) => p.id), ['c', 'a'])
})

test('an occasion with no products returns an empty array', () => {
  assert.deepEqual(byOccasion(P, 'Get Well'), [])
})

test('Bihu leads the occasion order', () => {
  assert.equal(OCCASION_ORDER[0], 'Festive (Bihu)')
})
