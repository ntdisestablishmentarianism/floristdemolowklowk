/**
 * Cart state, backed by localStorage when available. Every storage access is
 * wrapped so a blocked/throwing storage (private mode, disabled cookies) still
 * yields a working in-memory cart for the session rather than an exception.
 */
import { productById } from './data.js'

export const CART_KEY = 'kopou.cart.v1'

function defaultStorage() {
  try {
    if (typeof localStorage !== 'undefined') return localStorage
  } catch {
    /* access itself can throw under some privacy settings */
  }
  return null
}

/**
 * @param {Storage|{getItem,setItem,removeItem}|null} [storage]
 */
export function createCart(storage = defaultStorage()) {
  let memory = {}
  let persistent = storage !== null && storage !== undefined

  function read() {
    if (!persistent) return memory
    try {
      const raw = storage.getItem(CART_KEY)
      if (!raw) return {}
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' ? parsed : {}
    } catch {
      persistent = false // fall back to memory for the rest of the session
      return memory
    }
  }

  function write(next) {
    state = next
    memory = next
    if (!persistent) return
    try {
      storage.setItem(CART_KEY, JSON.stringify(next))
    } catch {
      persistent = false
    }
  }

  let state = read()
  const subscribers = new Set()

  function notify() {
    for (const fn of subscribers) {
      try {
        fn()
      } catch {
        /* a bad subscriber must not break the cart */
      }
    }
  }

  function items() {
    return Object.entries(state)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ id, qty }))
  }

  function count() {
    return items().reduce((sum, i) => sum + i.qty, 0)
  }

  function subtotal() {
    return items().reduce((sum, i) => sum + (productById(i.id)?.price ?? 0) * i.qty, 0)
  }

  function detailed() {
    return items()
      .map((i) => ({ product: productById(i.id), qty: i.qty }))
      .filter((d) => d.product)
      .map((d) => ({ ...d, lineTotal: d.product.price * d.qty }))
  }

  function add(id, qty = 1) {
    if (!productById(id) || !(qty > 0)) return
    write({ ...state, [id]: (state[id] || 0) + qty })
    notify()
  }

  function setQty(id, qty) {
    if (!productById(id)) return
    const next = { ...state }
    if (qty > 0) next[id] = qty
    else delete next[id]
    write(next)
    notify()
  }

  function remove(id) {
    if (!(id in state)) return
    const next = { ...state }
    delete next[id]
    write(next)
    notify()
  }

  function clear() {
    write({})
    notify()
  }

  function subscribe(fn) {
    subscribers.add(fn)
    return () => subscribers.delete(fn)
  }

  return { items, detailed, add, setQty, remove, clear, count, subtotal, subscribe }
}
