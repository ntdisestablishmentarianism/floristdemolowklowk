import test from 'node:test'
import assert from 'node:assert/strict'
import { productCardHTML } from '../assets/js/card.js'

const product = {
  id: 'xewali-dawn',
  name: 'Xewali Dawn',
  composition: '8 white & pink roses, eucalyptus',
  occasion: 'Birthday',
  category: 'Flowers',
  price: 649,
  image: 'https://images.unsplash.com/photo-x?w=900&q=70',
}

test('a product card shows name, composition and Indian-formatted price', () => {
  const html = productCardHTML(product)
  assert.ok(html.includes('Xewali Dawn'))
  assert.ok(html.includes('8 white &amp; pink roses, eucalyptus'))
  assert.ok(html.includes('₹649'))
})

test('a product card carries an add-to-basket hook with the product id', () => {
  const html = productCardHTML(product)
  assert.ok(html.includes('data-add="xewali-dawn"'))
  assert.match(html, /Add to basket/i)
})

test('a product card image has alt text naming the product and a lazy load', () => {
  const html = productCardHTML(product)
  assert.match(html, /<img[^>]*alt="Xewali Dawn[^"]*"/)
  assert.match(html, /loading="lazy"/)
})
