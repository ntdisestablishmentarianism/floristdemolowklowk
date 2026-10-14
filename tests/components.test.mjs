import test from 'node:test'
import assert from 'node:assert/strict'
import { headerHTML, footerHTML, cartDrawerHTML } from '../assets/js/components.js'
import { config } from '../assets/js/site.config.js'

const PAGES = ['/', '/shop.html', '/occasions.html', '/about.html', '/order.html']

test('header shows the shop name and links to all five pages', () => {
  const html = headerHTML(config, '/shop.html')
  assert.ok(html.includes('Kopou'))
  for (const href of PAGES) {
    assert.ok(html.includes(`href="${href}"`), `missing link ${href}`)
  }
})

test('header marks exactly the active path', () => {
  const html = headerHTML(config, '/shop.html')
  const marked = html.match(/aria-current="page"/g) || []
  assert.equal(marked.length, 1)
  const activeTag = html.match(/<a[^>]*aria-current="page"[^>]*>/)[0]
  assert.ok(activeTag.includes('/shop.html'))
})

test('footer carries the WhatsApp link, phone, address, hours and payment line', () => {
  const html = footerHTML(config)
  assert.ok(html.includes('https://wa.me/919954193440'))
  assert.ok(html.includes('tel:'))
  assert.ok(html.includes(config.address))
  assert.ok(html.includes(config.hours))
  assert.match(html, /UPI/)
  assert.match(html, /cash/i)
})

test('an empty drawer shows an empty-basket message', () => {
  const totals = { subtotal: 0, discount: 0, deliveryFee: 0, total: 0 }
  const html = cartDrawerHTML([], totals)
  assert.match(html, /empty/i)
})

test('a drawer with lines lists the item, quantity and line total', () => {
  const lines = [
    { product: { id: 'xewali-dawn', name: 'Xewali Dawn', price: 649 }, qty: 2, lineTotal: 1298 },
  ]
  const totals = { subtotal: 1298, discount: 0, deliveryFee: 0, total: 1298 }
  const html = cartDrawerHTML(lines, totals)
  assert.ok(html.includes('Xewali Dawn'))
  assert.ok(html.includes('₹1,298'))
  assert.ok(html.includes('order.html'))
})
