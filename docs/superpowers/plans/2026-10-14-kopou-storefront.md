# Kopou Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Kopou florist storefront demo — a static, front-end-only five-page shop with a working cart, coupons, and a Formspree-backed order flow.

**Architecture:** Plain HTML pages share a small set of ES modules. All pricing, coupon, cart, and order logic lives in pure, dependency-free modules that Node can import and test directly; pages import them in the browser via `<script type="module">`. No framework, no bundler, no runtime dependencies.

**Tech Stack:** HTML5, CSS (custom properties), vanilla ES modules, Node's built-in test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-10-14-kopou-florist-design.md`

## Global Constraints

- Front-end only. No backend, database, framework, or build step. Zero runtime dependencies.
- Formspree endpoint is exactly `https://formspree.io/f/mdeazbjq`; orders email `nt30527@gmail.com`.
- WhatsApp / phone: `+91 99541 93440` (wa.me form: `919954193440`).
- Prices are whole ₹ integers, formatted with Indian digit grouping (e.g. `₹1,299`).
- Payment is cash or UPI on delivery; the site never claims online payment.
- Delivery: Dibrugarh city-wide. Free when the **pre-discount subtotal** is ≥ ₹499, otherwise ₹49.
- Coupons, exactly: `WELCOME10` (10% off, min ₹499), `BIHU15` (15% off, min ₹999), `SAVE100` (₹100 off, min ₹899), `FREEDEL` (waives delivery fee). One code per order; no stacking; discount applies to subtotal only.
- Catalogue: 14 products; each has exactly one occasion and one category (`Flowers` | `Plants`). No price-on-request items.
- Occasions: Birthday, Anniversary, Love & Romance, Congratulations, Thank You, Get Well, Sympathy, Festive (Bihu).
- Images are **hotlinked** free-stock URLs (Unsplash/Pexels) stored in `data.js`. Nothing self-hosted.
- Palette: ivory `#F7F3EC`, warm paper `#EFE9DF`, ink `#302C29`, taupe `#6B5F52`, dusty rose `#C79A93`, muted plum `#6D4B5E`. Fonts: Fraunces (display), Instrument Sans (body).
- `localStorage` keys: `kopou.cart.v1`, `kopou.coupon.v1`.
- Order references look like `KOP-YYMMDD-XXXX`.

## Review Focus

Five failure modes the spec implies but no task's happy path exercises. Each is pinned by a test in the task named.

1. **Cart storage unavailable or throwing** (Safari private mode, blocked storage) — the cart must still work for the session and no page may throw. Test in Task 5.
2. **Coupon entered with wrong case, stray spaces, or unknown** — must surface a clear inline error, never a silent ₹0 discount. Test in Task 3.
3. **Percent discount producing paise** (10% of ₹649) — totals must stay whole rupees. Test in Task 4.
4. **Formspree submission failing** (offline or non-2xx response) — must show an error and keep the cart, never a false success. Test in Task 6.
5. **Submitting an empty cart or missing required customer fields** — must block with a clear message. Test in Task 6.

---

### Task 1: Scaffold, config, and currency formatting

**Files:**
- Create: `package.json`, `.gitignore`, `scripts/serve.mjs`, `assets/js/site.config.js`, `assets/js/format.js`, `tests/format.test.mjs`

**Interfaces:**
- Produces: `config` object from `site.config.js` with keys `name, city, whatsapp, phone, address, hours, formspree, email`.
- Produces: `formatINR(amount: number): string`.

- [ ] **Step 1: Initialise the repository and package files**

Run: `git init` in `/root/kopou`.

`package.json`:

```json
{
  "name": "kopou",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "serve": "node scripts/serve.mjs"
  }
}
```

`.gitignore`:

```
.superpowers/
node_modules/
.DS_Store
```

- [ ] **Step 2: Write the failing format test**

`tests/format.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { formatINR } from '../assets/js/format.js'

test('formats whole rupees with Indian grouping', () => {
  assert.equal(formatINR(999), '₹999')
  assert.equal(formatINR(1299), '₹1,299')
  assert.equal(formatINR(1899), '₹1,899')
  assert.equal(formatINR(100000), '₹1,00,000')
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node --test tests/format.test.mjs`
Expected: FAIL — cannot find module `../assets/js/format.js`.

- [ ] **Step 4: Implement `formatINR` in `assets/js/format.js`**

Indian grouping: group the last three digits, then every two digits. Implementation (this is an algorithm the test does not determine, so a body is given):

```js
export function formatINR(amount) {
  const n = Math.round(amount)
  const s = String(Math.abs(n))
  const last3 = s.slice(-3)
  const rest = s.slice(0, -3)
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3
  return `${n < 0 ? '-' : ''}₹${grouped}`
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node --test tests/format.test.mjs`
Expected: PASS.

- [ ] **Step 6: Add `site.config.js` and `scripts/serve.mjs`**

`assets/js/site.config.js` exports `config` with the exact values from Global Constraints (`name: 'Kopou'`, `city: 'Dibrugarh'`, `whatsapp: '919954193440'`, `phone: '+91 99541 93440'`, `address: 'Chowkidinghee, Dibrugarh, Assam 786001'`, `hours: '8:00 AM – 8:00 PM, daily'`, `formspree: 'https://formspree.io/f/mdeazbjq'`, `email: 'nt30527@gmail.com'`).

`scripts/serve.mjs`: a zero-dependency static file server on port 8080 that serves the project root, maps `.html/.css/.js/.mjs/.svg` to the right `Content-Type`, defaults `/` to `index.html`, and returns 404 for missing files. No caching headers.

- [ ] **Step 7: Run the whole suite**

Run: `node --test`
Expected: PASS (format tests only).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold project, config, and currency formatting"
```

---

### Task 2: Catalogue data

**Files:**
- Create: `assets/js/data.js`, `tests/data.test.mjs`

**Interfaces:**
- Produces: `OCCASIONS: string[]`, `CATEGORIES: string[]` (`['Flowers','Plants']`), `PRODUCTS: Product[]`, `productById(id): Product | undefined`, `featuredProducts(): Product[]`.
- `Product = { id, name, composition, occasion, category, price, image, featured, added }` — `price` integer ₹; `image` an `https://` stock URL; `added` a sortable number (lower = older, for "newest").

- [ ] **Step 1: Write the failing data test**

`tests/data.test.mjs` asserts: `PRODUCTS.length === 14`; every product's `occasion` is in `OCCASIONS` and `category` in `CATEGORIES`; `id`s are unique; `price` is a positive integer; `image` starts with `https://`; `featuredProducts().length >= 3`; `productById(PRODUCTS[0].id)` returns it and an unknown id returns `undefined`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/data.test.mjs`
Expected: FAIL — cannot find module `../assets/js/data.js`.

- [ ] **Step 3: Implement `data.js`**

Copy the 14 name/composition/occasion/category/price rows **verbatim** from the spec's catalogue table. Mark items 1, 4, 6 as `featured: true`. Assign each a distinct hotlinked free-stock image URL (one per product) covering: mixed roses, pink roses, marigold garlands, foxtail/orchid arrangement, white lilies, sunflowers, carnations, roses with chocolate, gerberas, get-well blooms, mixed basket, potted peace lily, potted pair, fruit-and-flower basket. Where no exact composition exists, choose the closest credible image.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/data.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add assets/js/data.js tests/data.test.mjs
git commit -m "feat: add catalogue data with taxonomy and stock imagery"
```

---

### Task 3: Coupons

**Files:**
- Create: `assets/js/coupons.js`, `tests/coupons.test.mjs`

**Interfaces:**
- Produces: `COUPONS: Record<string, Coupon>`; `Coupon = { code, type: 'percent' | 'flat' | 'freeDelivery', value, minSubtotal }`.
- Produces: `applyCoupon(code: string, subtotal: number): { ok: true, code, discount, freeDelivery } | { ok: false, error: string }`.

- [ ] **Step 1: Write the failing coupon tests**

`tests/coupons.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { applyCoupon } from '../assets/js/coupons.js'

test('WELCOME10 gives 10% off at or above the minimum', () => {
  const r = applyCoupon('WELCOME10', 1000)
  assert.equal(r.ok, true)
  assert.equal(r.discount, 100)
})

test('coupon below its minimum is rejected with a message', () => {
  const r = applyCoupon('WELCOME10', 400)
  assert.equal(r.ok, false)
  assert.match(r.error, /minimum|₹499/i)
})

test('codes are case-insensitive and ignore surrounding spaces', () => {
  assert.equal(applyCoupon('  welcome10 ', 1000).ok, true)
})

test('an unknown code is rejected, never a silent zero discount', () => {
  const r = applyCoupon('NOPE', 1000)
  assert.equal(r.ok, false)
  assert.ok(typeof r.error === 'string' && r.error.length > 0)
})

test('FREEDEL waives delivery with no discount', () => {
  const r = applyCoupon('FREEDEL', 300)
  assert.equal(r.ok, true)
  assert.equal(r.discount, 0)
  assert.equal(r.freeDelivery, true)
})
```

(Also cover `BIHU15` at min ₹999 and `SAVE100` flat ₹100 at min ₹899.)

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/coupons.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `coupons.js`**

Expose the four codes from Global Constraints. `applyCoupon` uppercases and trims the input, looks it up, checks `subtotal >= minSubtotal`, and returns `{ ok: true, code, discount, freeDelivery }` where `discount` is `Math.round(subtotal * value / 100)` for `percent`, `value` for `flat`, and `0` for `freeDelivery`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/coupons.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add assets/js/coupons.js tests/coupons.test.mjs
git commit -m "feat: add coupon rules"
```

---

### Task 4: Pricing and totals

**Files:**
- Create: `assets/js/pricing.js`, `tests/pricing.test.mjs`

**Interfaces:**
- Produces: `DELIVERY_FEE = 49`, `FREE_DELIVERY_MIN = 499`.
- Consumes: `applyCoupon` from Task 3.
- Produces: `computeTotals({ items, couponCode }): Totals` where `items: { price: number, qty: number }[]` and `Totals = { subtotal, discount, deliveryFee, total, freeDeliveryApplied, couponCode, couponError }`.

- [ ] **Step 1: Write the failing totals tests**

`tests/pricing.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { computeTotals } from '../assets/js/pricing.js'

const items = (price, qty = 1) => [{ price, qty }]

test('free delivery begins exactly at ₹499', () => {
  assert.equal(computeTotals({ items: items(499) }).deliveryFee, 0)
  assert.equal(computeTotals({ items: items(498) }).deliveryFee, 49)
})

test('a coupon never removes free delivery', () => {
  const t = computeTotals({ items: items(520), couponCode: 'WELCOME10' })
  assert.equal(t.discount, 52)
  assert.equal(t.deliveryFee, 0)
  assert.equal(t.total, 468)
})

test('percent discounts stay whole rupees', () => {
  const t = computeTotals({ items: items(649), couponCode: 'WELCOME10' })
  assert.equal(Number.isInteger(t.discount), true)
  assert.equal(Number.isInteger(t.total), true)
})

test('FREEDEL zeroes a fee that would otherwise apply', () => {
  const t = computeTotals({ items: items(300), couponCode: 'FREEDEL' })
  assert.equal(t.deliveryFee, 0)
  assert.equal(t.total, 300)
})

test('an empty cart totals to zero', () => {
  const t = computeTotals({ items: [] })
  assert.deepEqual(
    { s: t.subtotal, d: t.deliveryFee, tot: t.total },
    { s: 0, d: 0, tot: 0 },
  )
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/pricing.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `computeTotals` in `assets/js/pricing.js`**

`subtotal = Σ price*qty`. `freeDeliveryApplied = subtotal >= 499`. Call `applyCoupon(couponCode, subtotal)` when a code is present; carry `couponError` on failure and `couponCode` on success. `deliveryFee = (freeDeliveryApplied || couponFreeDelivery) ? 0 : 49`, but `0` when subtotal is `0`. `total = subtotal - discount + deliveryFee`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/pricing.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add assets/js/pricing.js tests/pricing.test.mjs
git commit -m "feat: add totals engine"
```

---

### Task 5: Cart state

**Files:**
- Create: `assets/js/cart.js`, `tests/cart.test.mjs`

**Interfaces:**
- Consumes: `productById` from Task 2.
- Produces: `CART_KEY = 'kopou.cart.v1'`; `createCart(storage?)` returning `{ items(), detailed(), add(id, qty=1), setQty(id, qty), remove(id), clear(), count(), subtotal(), subscribe(fn) }`, where `detailed()` yields `{ product, qty, lineTotal }` and `subscribe` returns an unsubscribe function.

- [ ] **Step 1: Write the failing cart tests**

`tests/cart.test.mjs` uses an in-memory fake storage `{ getItem, setItem, removeItem }` and asserts: `add` increases qty; `setQty` updates and `setQty(id, 0)` removes; `remove` deletes; `clear` empties; a new cart over the same storage restores state; `count`/`subtotal` are correct; unknown product ids are ignored. Plus the Review Focus case:

```js
test('a throwing storage does not break the cart', () => {
  const broken = {
    getItem() { throw new Error('blocked') },
    setItem() { throw new Error('blocked') },
    removeItem() { throw new Error('blocked') },
  }
  const cart = createCart(broken)
  cart.add('xewali-dawn')
  assert.equal(cart.count(), 1)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/cart.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `createCart`**

Keep state as `{ [id]: qty }`. Read/write through the injected storage, wrapped in `try/catch`; on any storage error fall back to an in-memory object so the cart still works for the session (Review Focus 1). Persist on every mutation; notify subscribers.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/cart.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add assets/js/cart.js tests/cart.test.mjs
git commit -m "feat: add storage-backed cart state"
```

---

### Task 6: Order payload, validation, and submission

**Files:**
- Create: `assets/js/order.js`, `tests/order.test.mjs`

**Interfaces:**
- Consumes: `formatINR` (Task 1), `config` (Task 1), `Totals` (Task 4).
- Produces: `makeReference(date?, rand?): string`; `validateOrderForm(values): { ok, errors }`; `buildOrderPayload({ reference, lines, customer, totals }): Record<string, string>`; `submitOrder(payload, endpoint, fetchImpl?): Promise<{ ok: true } | { ok: false, error: string }>`.

- [ ] **Step 1: Write the failing order tests**

`tests/order.test.mjs` asserts: `makeReference()` matches `/^KOP-\d{6}-[A-Z0-9]{4}$/`; `buildOrderPayload` includes `_subject`, `reference`, `name`, `phone`, `address`, `payment`, all customer fields, an itemised `items` string, and `subtotal/discount/delivery/total` as formatted ₹ strings; `validateOrderForm({})` reports errors for name, phone, address (Review Focus 5); a valid form passes; `buildOrderPayload` preserves a card message containing an emoji and quotes. For submission:

```js
test('a non-2xx response is reported as a failure', async () => {
  const fakeFetch = async () => ({ ok: false, status: 429 })
  const r = await submitOrder({}, 'https://example.test/f/x', fakeFetch)
  assert.equal(r.ok, false)
  assert.ok(r.error)
})

test('a network error is reported as a failure, not a success', async () => {
  const fakeFetch = async () => { throw new Error('offline') }
  const r = await submitOrder({}, 'https://example.test/f/x', fakeFetch)
  assert.equal(r.ok, false)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/order.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `order.js`**

`makeReference` builds `KOP-` + `YYMMDD` + `-` + four uppercase alphanumerics from `Math.random`. `buildOrderPayload` returns a flat string map (Formspree-friendly) using `formatINR` for money. `validateOrderForm` requires name, phone, address, and a valid payment choice. `submitOrder` POSTs `JSON.stringify(payload)` with `Accept: application/json` to the endpoint; returns `{ ok: true }` only on a 2xx, otherwise `{ ok: false, error }` — never throw (Review Focus 4).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/order.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add assets/js/order.js tests/order.test.mjs
git commit -m "feat: add order payload, validation, and Formspree submission"
```

---

### Task 7: Design system and site shell

**Files:**
- Create: `assets/css/tokens.css`, `assets/css/base.css`, `assets/css/components.css`, `assets/js/components.js`, `index.html`, `tests/components.test.mjs`

**Interfaces:**
- Consumes: `config` (Task 1).
- Produces: `headerHTML(config, activePath): string`; `footerHTML(config): string`; `cartDrawerHTML(lines, totals): string`; `mountLayout(config, { activePath }): void` (browser-only: injects header/footer/drawer and wires the drawer to a cart instance).

- [ ] **Step 1: Write the failing component tests**

`tests/components.test.mjs` asserts: `headerHTML(config, '/shop.html')` contains the shop name, links to all five pages, and marks the active path; `footerHTML(config)` contains `wa.me/919954193440`, `tel:`, the address, the hours, and the cash/UPI line; `cartDrawerHTML([], totalsZero)` contains an empty-cart message.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/components.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the shell**

`tokens.css` defines the palette, type, spacing, and radius as custom properties, and `@font-face`/font loading for Fraunces + Instrument Sans with system fallbacks. `base.css` handles reset, body typography, layout containers. `components.css` styles the header, nav, footer, buttons, cards, the cart drawer (including its `aria-live` region), and form controls. `components.js` builds markup as strings and `mountLayout` injects it. `index.html` contains the shell and a `<main>` placeholder.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/components.test.mjs`
Expected: PASS.

- [ ] **Step 5: Check the shell in the browser**

Run: `npm run serve`, open `http://localhost:8080`.
Expected: header, nav, footer, and an openable (empty) cart drawer render in the Atelier palette with Fraunces/Instrument Sans.

- [ ] **Step 6: Commit**

```bash
git add assets/css assets/js/components.js index.html tests/components.test.mjs
git commit -m "feat: add design tokens, base styles, and shared site shell"
```

---

### Task 8: Home page

**Files:**
- Modify: `index.html`
- Create: `assets/js/pages/home.js`, `assets/css/pages.css`

**Interfaces:**
- Consumes: `featuredProducts`, `OCCASIONS` (Task 2); `formatINR` (Task 1); `config` (Task 1).

- [ ] **Step 1: Fill the Home content**

`index.html` gets hero (headline, "Order a bouquet" → `order.html`, "Browse the shop" → `shop.html`), a featured-bouquet grid rendered by `home.js` from `featuredProducts()`, an occasions strip linking to `shop.html?occasion=<name>`, a three-step "how ordering works" band, a short about band with one local photo, and a delivery note. `pages.css` holds hero and page-section styles; the hero uses a staggered reveal with `animation-delay` and is disabled under `prefers-reduced-motion`.

- [ ] **Step 2: Verify in the browser**

Run: `npm run serve`, open `http://localhost:8080`.
Expected: hero animates in once; exactly three featured bouquets with prices; each occasion chip navigates to the filtered shop URL; layout holds at 360px, 768px, and 1280px widths.

- [ ] **Step 3: Commit**

```bash
git add index.html assets/js/pages/home.js assets/css/pages.css
git commit -m "feat: build home page"
```

---

### Task 9: Shop page

**Files:**
- Create: `shop.html`, `assets/js/pages/shop.js`, `tests/shop.test.mjs`
- Modify: `assets/css/pages.css`

**Interfaces:**
- Consumes: `PRODUCTS`, `OCCASIONS`, `CATEGORIES` (Task 2); `cart.js` (Task 5).
- Produces: `filterAndSort(products, { occasion, category, minPrice, maxPrice, sort }): Product[]` with `sort` in `'featured' | 'price-asc' | 'price-desc' | 'newest'`.

- [ ] **Step 1: Write the failing filter/sort test**

`tests/shop.test.mjs` builds a small in-memory product list and asserts: an occasion filter returns only that occasion; a category filter returns only that category; a price range excludes outside values; each sort order is correct; empty filters return everything unchanged.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/shop.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `filterAndSort`, then the page**

Implement the function (pure). Then `shop.html` renders a filter bar (occasion, category, price range, sort) and a product grid; `shop.js` reads filters from the URL query (e.g. `?occasion=Birthday`), keeps the URL in step as filters change, and wires "Add to cart".

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/shop.test.mjs`
Expected: PASS.

- [ ] **Step 5: Verify the Shop page in the browser**

Run: `npm run serve`, open `http://localhost:8080/shop.html`, then `shop.html?occasion=Birthday`.
Expected: all 14 products by default; the occasion link pre-filters; adding a bouquet updates the drawer count without a reload.

- [ ] **Step 6: Commit**

```bash
git add shop.html assets/js/pages/shop.js assets/css/pages.css tests/shop.test.mjs
git commit -m "feat: build shop page with filters and sorting"
```

---

### Task 10: Occasions page

**Files:**
- Create: `occasions.html`, `assets/js/pages/occasions.js`, `tests/occasions.test.mjs`
- Modify: `assets/css/pages.css`

**Interfaces:**
- Consumes: `PRODUCTS`, `OCCASIONS` (Task 2).
- Produces: `byOccasion(products, occasion): Product[]`.

- [ ] **Step 1: Write the failing grouping test**

`tests/occasions.test.mjs` asserts `byOccasion` returns only that occasion's products and preserves input order.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/occasions.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the page**

One section per occasion with a short paragraph and a curated subset of cards; Festive (Bihu) is featured first; each section links to `shop.html?occasion=<name>`.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/occasions.test.mjs`
Expected: PASS.

- [ ] **Step 5: Verify the Occasions page in the browser**

Run: `npm run serve`, open `http://localhost:8080/occasions.html`.
Expected: a section per occasion; Bihu leads; section links open the correct filtered shop.

- [ ] **Step 6: Commit**

```bash
git add occasions.html assets/js/pages/occasions.js assets/css/pages.css tests/occasions.test.mjs
git commit -m "feat: build occasions page"
```

---

### Task 11: About page

**Files:**
- Create: `about.html`
- Modify: `assets/css/pages.css`

- [ ] **Step 1: Write the page**

The fictional shop story (family shop in Dibrugarh, fresh flowers, hand-tied), three photos (hotlinked free stock: shopfront/counter, hands wrapping a bouquet, foliage detail), and an explicit line that orders are confirmed personally by phone/WhatsApp.

- [ ] **Step 2: Verify in the browser**

Run: `npm run serve`, open `http://localhost:8080/about.html`.
Expected: story, images with alt text, and the confirmation note render cleanly at all three widths.

- [ ] **Step 3: Commit**

```bash
git add about.html assets/css/pages.css
git commit -m "feat: build about page"
```

---

### Task 12: Order / checkout page

**Files:**
- Create: `order.html`, `assets/js/pages/order.js`, `tests/order-page.test.mjs`
- Modify: `assets/css/pages.css`

**Interfaces:**
- Consumes: `createCart` (Task 5), `computeTotals` (Task 4), `applyCoupon` (Task 3), `validateOrderForm`, `buildOrderPayload`, `makeReference`, `submitOrder` (Task 6), `formatINR` (Task 1), `config` (Task 1).
- Produces: `summaryRows(totals): { label, value }[]`; `whatsAppLink(config, reference): string`.

- [ ] **Step 1: Write the failing summary/link tests**

`tests/order-page.test.mjs` asserts `summaryRows` yields Subtotal, Discount, Delivery, Total with `formatINR` values, and shows `Free` for zero delivery; `whatsAppLink(config, 'KOP-260114-AB12')` starts with `https://wa.me/919954193440?text=` and includes the URL-encoded reference.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/order-page.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `order.html` and `order.js`**

Layout: order form on one side, live summary on the other. The form carries the exact field set from the spec: full name, phone (WhatsApp), alternate phone (optional), delivery address + landmark, pincode, preferred delivery date, preferred time slot, recipient name (if different), occasion (optional), card message (optional), payment method, and order notes. Coupon field applies via `applyCoupon` and shows `couponError` inline (no silent zero). Payment radio: Cash on delivery / UPI on delivery. On submit: `validateOrderForm` → render field errors; if valid, build the payload and call `submitOrder(payload, config.formspree)`. On success, show the reference and a *Message us on WhatsApp* link from `whatsAppLink`, and clear the cart. On failure, show an error and **keep the cart** (Review Focus 4).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/order-page.test.mjs`
Expected: PASS.

- [ ] **Step 5: Verify checkout in the browser**

Run: `npm run serve`, open `http://localhost:8080/order.html`, add a bouquet, apply `WELCOME10`, fill valid details, submit.
Expected: the summary total matches `computeTotals`; the success state shows a `KOP-…` reference and a working WhatsApp link; the cart is now empty.

- [ ] **Step 6: Confirm the live Formspree email**

Repeat the submission once against the real endpoint and confirm one order email arrives at `nt30527@gmail.com`. This is the single live integration check for the whole plan.

- [ ] **Step 7: Commit**

```bash
git add order.html assets/js/pages/order.js assets/css/pages.css tests/order-page.test.mjs
git commit -m "feat: build order and checkout page"
```

---

### Task 13: Polish, accessibility, README, and demo dry-run

**Files:**
- Create: `README.md`, `assets/img/favicon.svg`
- Modify: CSS/HTML across pages as needed

- [ ] **Step 1: Accessibility and responsive pass**

Check every page for labelled inputs, visible focus, `aria-live` on cart and summary updates, alt text on all images, and `prefers-reduced-motion`. Confirm the mobile nav works and nothing overflows at 360px.

- [ ] **Step 2: Performance and branding pass**

Ensure images use `loading="lazy"` and a fixed aspect ratio, add the favicon/wordmark, and confirm no render-blocking fonts.

- [ ] **Step 3: Write `README.md`**

Document: how to run locally (`npm run serve`), how to run tests (`npm test`), where to host (any static host), and how to re-brand a pitch (edit `assets/js/site.config.js` and `data.js`). Note the optional discreet footer line and the Formspree endpoint.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: all tests PASS.

- [ ] **Step 5: Dry-run the pitch**

Run: `npm run serve`. On a fresh browser profile, walk the spec's demo script end to end (empty cart → two bouquets → `WELCOME10` → checkout → confirmation → WhatsApp link) and fix anything that stumbles.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: accessibility, responsive, docs, and demo dry-run fixes"
```
