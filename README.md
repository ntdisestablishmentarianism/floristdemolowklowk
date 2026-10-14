# Kopou — florist storefront demo

A front-end-only storefront for a fictional Dibrugarh florist, built to be shown to
real shop owners as a pitch: *this is what your shop could look like online, and this
is how ordering would work for you.*

There is no backend, no database, and no build step. Everything is plain HTML, CSS and
ES modules, and every price, coupon and order rule is a small pure function covered by
tests.

## Run it

```sh
npm run serve      # http://localhost:8080
npm test           # node --test
```

`npm run serve` starts a tiny zero-dependency static server (`scripts/serve.mjs`). You
can just as well open `index.html` from any static host — there is nothing to compile.

## Pages

| Page | File | What it does |
| --- | --- | --- |
| Home | `index.html` | Hero, featured shelf, occasions, how ordering works |
| Shop | `shop.html` | All 14 arrangements, filter by occasion/type/price, sort |
| Occasions | `occasions.html` | Curated picks per occasion, Bihu first |
| About | `about.html` | The shop, the way it really works |
| Order | `order.html` | Delivery details, coupon, order summary, submit |

## How ordering works

The owner has no payment gateway and already takes orders by phone, so the demo never
pretends otherwise:

1. The customer fills in the delivery details and sends the order.
2. The order is posted to **Formspree**, which emails it to the shop.
3. The shop confirms personally on **WhatsApp**.
4. The customer pays **cash or UPI on delivery**.

Nothing is charged online. The order page says so, in as many words.

## Coupons

One code per order, applied to the subtotal before delivery. Invalid codes always show
a message — never a silent ₹0 discount. Defined in `assets/js/coupons.js`:

| Code | Effect | Minimum |
| --- | --- | --- |
| `WELCOME10` | 10% off | ₹499 |
| `BIHU15` | 15% off | ₹999 |
| `SAVE100` | ₹100 off | ₹899 |
| `FREEDEL` | Free delivery | — |

Delivery is free on orders from ₹499 regardless of coupon (free delivery is measured
on the pre-discount subtotal, so a coupon can never push an order out of it).

## Re-branding for a real shop

Two files hold almost everything you would change:

- `assets/js/site.config.js` — shop name, city, phone, WhatsApp number, address, hours,
  and the Formspree endpoint.
- `assets/css/tokens.css` — the whole palette (`--cotton`, `--indigo`, `--gamusa`,
  `--marigold`, `--leaf`), the type, and the woven-thread rule that marks section
  boundaries.

The catalogue (products, prices, occasions, image URLs) lives in `assets/js/data.js`.
All imagery is **hotlinked free stock** (Unsplash); nothing is self-hosted.

## Layout of the code

```
assets/
  css/    tokens.css · base.css · components.css · pages.css
  img/    favicon.svg
  js/     site.config.js · format.js · data.js · coupons.js · pricing.js
          cart.js · card.js · order.js · components.js
          pages/  home.js · shop.js · occasions.js · order.js
tests/    node --test suites for every pure module
scripts/  serve.mjs
```

The rule the code follows: **all money and order logic is pure and testable** (no DOM),
and the page modules only render and wire events. That is why `pricing.test.mjs`,
`coupons.test.mjs`, `cart.test.mjs` and `order.test.mjs` can run in Node with no browser.

## Honesty notes

- This is a **sample storefront for a demonstration**. The address, phone number, hours
  and opening details are placeholders; swap them in `site.config.js` before showing it
  to anyone.
- The order form sends to a real Formspree endpoint. Submitting it from the live demo
  will email the shop. That is the intended flow, not a bug.
- Product photography is stock, chosen from searches that match each arrangement. Replace
  the URLs in `data.js` with the shop's own photographs when pitching for real.
