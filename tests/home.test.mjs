import test from 'node:test'
import assert from 'node:assert/strict'
import { featuredHTML, occasionsHTML } from '../assets/js/pages/home.js'
import { featuredProducts, OCCASIONS } from '../assets/js/data.js'

test('featuredHTML renders one card per featured product', () => {
  const html = featuredHTML(featuredProducts())
  const cards = html.match(/<article class="card"/g) || []
  assert.equal(cards.length, featuredProducts().length)
  assert.ok(cards.length >= 3)
})

test('occasionsHTML links each occasion into the filtered shop, url-encoded', () => {
  const html = occasionsHTML(OCCASIONS)
  assert.equal((html.match(/class="chip"/g) || []).length, OCCASIONS.length)
  assert.ok(html.includes('href="/shop.html?occasion=Festive%20(Bihu)"'))
  assert.ok(html.includes('href="/shop.html?occasion=Love%20%26%20Romance"'))
})
