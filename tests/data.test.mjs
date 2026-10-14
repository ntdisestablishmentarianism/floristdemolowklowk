import test from 'node:test'
import assert from 'node:assert/strict'
import {
  OCCASIONS,
  CATEGORIES,
  PRODUCTS,
  productById,
  featuredProducts,
} from '../assets/js/data.js'

test('catalogue has exactly 14 products', () => {
  assert.equal(PRODUCTS.length, 14)
})

test('every product has a valid occasion and category', () => {
  for (const p of PRODUCTS) {
    assert.ok(OCCASIONS.includes(p.occasion), `${p.id} occasion ${p.occasion}`)
    assert.ok(CATEGORIES.includes(p.category), `${p.id} category ${p.category}`)
  }
})

test('ids are unique and prices are positive integers', () => {
  const ids = new Set(PRODUCTS.map((p) => p.id))
  assert.equal(ids.size, PRODUCTS.length)
  for (const p of PRODUCTS) {
    assert.ok(Number.isInteger(p.price) && p.price > 0, `${p.id} price`)
  }
})

test('every product image is a hotlinked https url', () => {
  for (const p of PRODUCTS) {
    assert.match(p.image, /^https:\/\//, p.id)
  }
})

test('featuredProducts returns at least three featured items', () => {
  const featured = featuredProducts()
  assert.ok(featured.length >= 3)
  for (const p of featured) assert.equal(p.featured, true)
})

test('productById finds a known id and returns undefined otherwise', () => {
  assert.equal(productById(PRODUCTS[0].id), PRODUCTS[0])
  assert.equal(productById('does-not-exist'), undefined)
})

test('categories are exactly Flowers and Plants', () => {
  assert.deepEqual(CATEGORIES, ['Flowers', 'Plants'])
})
