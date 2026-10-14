import test from 'node:test'
import assert from 'node:assert/strict'
import { byOccasion, occasionId, occasionSectionHTML, OCCASION_ORDER } from '../assets/js/pages/occasions.js'

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

test('occasion ids are valid, space-free DOM ids', () => {
  assert.equal(occasionId('Festive (Bihu)'), 'occ-festive-bihu')
  assert.equal(occasionId('Love & Romance'), 'occ-love-romance')
  assert.equal(occasionId('Thank You'), 'occ-thank-you')
})

test('the label id in a section matches the aria-labelledby reference', () => {
  const html = occasionSectionHTML('Festive (Bihu)', [
    { id: 'a', name: 'X', price: 1, image: 'x', occasion: 'Festive (Bihu)', category: 'Flowers' },
  ])
  const id = occasionId('Festive (Bihu)')
  assert.ok(html.includes(`aria-labelledby="${id}"`))
  assert.ok(html.includes(`<h2 id="${id}">`))
})
