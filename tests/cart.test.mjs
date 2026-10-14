import test from 'node:test'
import assert from 'node:assert/strict'
import { createCart, CART_KEY } from '../assets/js/cart.js'

/** A minimal in-memory stand-in for localStorage. */
function fakeStorage() {
  const map = new Map()
  return {
    map,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
  }
}

test('add increases quantity and count', () => {
  const cart = createCart(fakeStorage())
  cart.add('xewali-dawn')
  cart.add('xewali-dawn')
  assert.equal(cart.count(), 2)
  assert.deepEqual(cart.items(), [{ id: 'xewali-dawn', qty: 2 }])
})

test('setQty updates a line and setQty(id, 0) removes it', () => {
  const cart = createCart(fakeStorage())
  cart.add('blush-bunch', 1)
  cart.setQty('blush-bunch', 4)
  assert.equal(cart.count(), 4)
  cart.setQty('blush-bunch', 0)
  assert.equal(cart.count(), 0)
  assert.deepEqual(cart.items(), [])
})

test('remove deletes a line and clear empties the cart', () => {
  const cart = createCart(fakeStorage())
  cart.add('sunflower-smile')
  cart.add('lily-serenade')
  cart.remove('sunflower-smile')
  assert.deepEqual(cart.items().map((i) => i.id), ['lily-serenade'])
  cart.clear()
  assert.equal(cart.count(), 0)
})

test('a new cart over the same storage restores state', () => {
  const storage = fakeStorage()
  const first = createCart(storage)
  first.add('peace-lily', 3)
  const second = createCart(storage)
  assert.equal(second.count(), 3)
  assert.equal(storage.getItem(CART_KEY).includes('peace-lily'), true)
})

test('subtotal and detailed line totals are correct', () => {
  const cart = createCart(fakeStorage())
  cart.add('xewali-dawn', 2) // ₹649 x2
  cart.add('peace-lily', 1) // ₹349
  assert.equal(cart.subtotal(), 649 * 2 + 349)
  const detailed = cart.detailed()
  assert.equal(detailed[0].lineTotal, 1298)
  assert.equal(detailed[0].product.id, 'xewali-dawn')
})

test('unknown product ids are ignored', () => {
  const cart = createCart(fakeStorage())
  cart.add('not-a-product')
  assert.equal(cart.count(), 0)
})

test('a throwing storage does not break the cart', () => {
  const broken = {
    getItem() {
      throw new Error('blocked')
    },
    setItem() {
      throw new Error('blocked')
    },
    removeItem() {
      throw new Error('blocked')
    },
  }
  const cart = createCart(broken)
  cart.add('xewali-dawn')
  assert.equal(cart.count(), 1)
})

test('subscribers are notified on change and unsubscribe stops them', () => {
  const cart = createCart(fakeStorage())
  let calls = 0
  const off = cart.subscribe(() => calls++)
  cart.add('xewali-dawn')
  assert.equal(calls, 1)
  off()
  cart.add('blush-bunch')
  assert.equal(calls, 1)
})
