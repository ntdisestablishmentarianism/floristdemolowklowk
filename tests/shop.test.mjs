import test from 'node:test'
import assert from 'node:assert/strict'
import { filterAndSort, readFilters } from '../assets/js/pages/shop.js'

const P = [
  { id: 'a', occasion: 'Birthday', category: 'Flowers', price: 500, featured: false, added: 1 },
  { id: 'b', occasion: 'Anniversary', category: 'Flowers', price: 300, featured: true, added: 2 },
  { id: 'c', occasion: 'Birthday', category: 'Plants', price: 900, featured: false, added: 3 },
  { id: 'd', occasion: 'Sympathy', category: 'Plants', price: 700, featured: false, added: 4 },
]
const ids = (list) => list.map((p) => p.id)

test('no filters returns everything in original order', () => {
  assert.deepEqual(ids(filterAndSort(P, {})), ['a', 'b', 'c', 'd'])
})

test('an occasion filter returns only that occasion', () => {
  assert.deepEqual(ids(filterAndSort(P, { occasion: 'Birthday' })), ['a', 'c'])
})

test('a category filter returns only that category', () => {
  assert.deepEqual(ids(filterAndSort(P, { category: 'Plants' })), ['c', 'd'])
})

test('a price range excludes values outside it', () => {
  assert.deepEqual(ids(filterAndSort(P, { minPrice: 400, maxPrice: 800 })), ['a', 'd'])
})

test('price-ascending sort', () => {
  assert.deepEqual(ids(filterAndSort(P, { sort: 'price-asc' })), ['b', 'a', 'd', 'c'])
})

test('price-descending sort', () => {
  assert.deepEqual(ids(filterAndSort(P, { sort: 'price-desc' })), ['c', 'd', 'a', 'b'])
})

test('newest sorts by added, most recent first', () => {
  assert.deepEqual(ids(filterAndSort(P, { sort: 'newest' })), ['d', 'c', 'b', 'a'])
})

test('featured sorts featured first, then original order', () => {
  assert.deepEqual(ids(filterAndSort(P, { sort: 'featured' })), ['b', 'a', 'c', 'd'])
})

test('filters combine', () => {
  assert.deepEqual(ids(filterAndSort(P, { occasion: 'Birthday', maxPrice: 600 })), ['a'])
})

test('readFilters ignores a non-numeric price instead of producing NaN', () => {
  const f = readFilters(new URLSearchParams('minPrice=abc&maxPrice=250'))
  assert.equal(f.minPrice, undefined)
  assert.equal(f.maxPrice, 250)
})

test('readFilters treats blank and missing prices as "no bound"', () => {
  const f = readFilters(new URLSearchParams('minPrice=&sort=newest'))
  assert.equal(f.minPrice, undefined)
  assert.equal(f.maxPrice, undefined)
  assert.equal(f.sort, 'newest')
})
