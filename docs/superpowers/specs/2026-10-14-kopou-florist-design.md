# Kopou — Florist Storefront Demo: Design

Date: 2026-10-14
Status: draft for review

## Intent & why

A polished, believable storefront for a fictional Dibrugarh florist, built to be
**shown to real florist businesses** as a pitch: "this is what your shop could
look like online, and here is how ordering would work for you."

It is a sales demo, not a product. The win condition is a shop owner watching it
and thinking *"that's my shop, and I could actually run this."* Every choice
should serve that reaction — realistic catalogue, realistic prices, a complete
order journey, and a local identity that a Dibrugarh florist recognises.

The owner's real constraint drives the whole ordering model: they have no
website backend and no payment gateway, and they already take orders by phone.
So the demo demonstrates an order flow that ends in **an email to the owner and a
WhatsApp confirmation** — nothing more. It never pretends to be more automated
than the shop can actually operate.

## Audience

- **Primary:** local florist shop owners in Dibrugarh / Assam, evaluating whether
  to sell online.
- **Secondary:** their customers — the fictional shopper persona the demo walks
  through (birthday, anniversary, sympathy, Bihu).

## Goals

- Feel like a finished, local, professional florist shop — not a template.
- Demonstrate the complete journey: browse → cart → coupon → order form →
  email to owner → WhatsApp confirmation.
- Run with **no backend, no database, no payment integration**.
- Be cheap and trivial to host, and quick to re-brand per pitch.

## Non-goals

- No real payments, refunds, or payment gateway.
- No server, database, user accounts, or order history.
- No inventory/stock tracking or live availability.
- No admin panel or order dashboard for the owner.
- No multi-language UI in this version (English only).
- Not a production system for a specific shop; it is a demonstrator.

## Anti-goals

- **Must not look generic.** No default Bootstrap/Tailwind look, no Inter, no
  purple-gradient-on-white, no cookie-cutter hero. See *Brand & visual system*.
- **Must not overpromise.** No "order confirmed", no "in stock", no live tracking.
  Confirmation is explicitly manual.
- **Must not require the owner to be technical.** The pitch must make clear the
  shop runs it by doing what it already does: answering WhatsApp.

## Constraints

- Front-end only; static files; deployable to any static host.
- Order delivery by **Formspree** (email to owner). Endpoint configured — see
  *Ordering model*.
- Payment **cash or UPI on delivery**; the site states this plainly.
- Prices in **₹ Indian Rupees**.
- Delivery across **Dibrugarh city**.
- Product imagery is **free stock, hotlinked** from free sources
  (Unsplash/Pexels) — nothing is self-hosted and there are no grey placeholders.
- Demo identity is a placeholder: name, phone, address, prices are invented but
  plausible and easily swapped.

## Experience

Five linked pages, plus a cart drawer and a checkout step. Nav: Home · Shop ·
Occasions · About · Order.

### Home
- Hero: wordmark, one warm headline, "Order a bouquet" and "Browse the shop".
  A single orchestrated load animation (staggered reveal), not scattered effects.
- Three featured bouquets (pulled from the catalogue).
- Occasions strip: Birthday, Anniversary, Congratulations, Thank You, Get Well,
  Sympathy, Festive (Bihu).
- "How ordering works" in three honest steps: *Choose your flowers → Send your
  order → Pay on delivery (cash or UPI)*, with a line that the shop confirms
  availability on WhatsApp.
- A short "about the shop" band with a local photo.
- Delivery note: Dibrugarh city-wide, same-day if ordered before cut-off.
- Footer: contact (phone, walk-in address, hours), delivery area, payment note.

### Shop
- Full catalogue grid with filters: occasion, category, price range, and sort
  (price, newest). Filter state reflected in the URL where cheap to do.
- Product cards: photo, name, short composition line, price, "Add to cart".
- Quick view or detail treatment for a product (composition, what's included,
  care note, "Add to cart").

### Occasions
- One section per occasion with a curated subset and a short paragraph of copy.
- Bihu/festive gets prominence (local relevance).
- Each section links into the filtered Shop.

### About
- The fictional story: a family shop in Dibrugarh, flowers sourced fresh, hand-tied.
- Photos: shopfront/counter, hands wrapping a bouquet, market/foliage detail.
- Explicit note that orders are confirmed personally by phone/WhatsApp.

### Order (checkout)
- Order form (see *Order form*) with a live order summary: line items, subtotal,
  coupon discount, delivery fee, total.
- Payment method choice: Cash on delivery / UPI on delivery.
- Submit → success state with a clear "the shop will confirm on WhatsApp"
  message, an order reference number, and an optional *Message us on WhatsApp*
  link prefilled with the order reference.

### Cart (drawer)
- Opens from the header on any page; slide-in panel listing items, quantities,
  remove, subtotal, and a "Checkout" button. Persists across pages.

## Ordering model

- **Cart** lives in `localStorage`; survives page navigation and reloads.
- **Coupons** are validated client-side against a small rule table. One code per
  order; no stacking; discount applies to subtotal, before delivery fee.
- **Checkout** serialises cart + customer details + totals and POSTs to the
  Formspree form **https://formspree.io/f/mdeazbjq**, which emails the order to
  **nt30527@gmail.com**.
- On success the demo shows a confirmation state and a WhatsApp deep link
  (`https://wa.me/<owner-number>?text=...`) so the owner-recognisable flow is
  visible.
- **Owner side:** Formspree emails the order; owner confirms availability and
  delivery details over WhatsApp. This is stated on the site and in the pitch.

### Order form fields

Customer: full name, phone (WhatsApp), alternate phone (optional), delivery
address + landmark, pincode, preferred delivery date, preferred time slot,
recipient name (if different), occasion (optional), message for the card
(optional), payment method (cash/UPI on delivery), order notes.

System fields (hidden / generated): order reference, line items, subtotal,
coupon code, discount, delivery fee, total, and a Formspree `_subject`.

## Catalogue (starter set)

Occasion tags in brackets. Prices are plausible mid-market Dibrugarh pricing and
are demonstrative only. Every product has a price and can be added to the cart —
there are no price-on-request items.

| # | Name | Composition | Occasion | ₹ |
|---|------|-------------|----------|---|
| 1 | Xewali Dawn | 8 white & pink roses, eucalyptus | Birthday | 649 |
| 2 | Blush Bunch | 10 soft-pink roses, gypsophila | Love & Romance | 799 |
| 3 | Rongali Marigold Strings | 2 marigold garlands | Festive (Bihu) | 299 |
| 4 | Kopou Orchid Arrangement | foxtail orchids, greens, vase | Festive (Bihu) / Signature | 1,299 |
| 5 | Lily Serenade | white lilies, chrysanthemum, jute wrap | Sympathy | 949 |
| 6 | Sunflower Smile | 5 sunflowers, solidago | Congratulations | 599 |
| 7 | Carnation Medley | 12 mixed carnations | Birthday | 549 |
| 8 | Rose & Chocolate Box | 12 roses + chocolates | Anniversary | 1,299 |
| 9 | Thank You Posy | pastel gerbera mix | Thank You | 499 |
| 10 | Get Well Greens | seasonal blooms + card | Get Well | 549 |
| 11 | Bohag Basket | assorted seasonal basket | Festive (Bihu) | 1,499 |
| 12 | Peace Lily | potted plant | Plants | 349 |
| 13 | Jade & Money Plant Pair | potted pair | Plants | 599 |
| 14 | Fruit & Flower Basket | fruit + flowers | Congratulations | 1,899 |

### Catalogue taxonomy

Two dimensions, so filters and cross-links stay consistent:

- **Occasion** (one per product): Birthday, Anniversary, Love & Romance,
  Congratulations, Thank You, Get Well, Sympathy, Festive (Bihu).
- **Category** (one per product): Flowers, Plants.

The Home occasions strip shows a curated seven of the occasions. The Shop filters
by occasion *and* category plus price. The Occasions page has one section per
occasion, with Festive (Bihu) featured.

## Discounts & coupons

Shown on the site as "demo offers" so the pitch lands.

- `WELCOME10` — 10% off, minimum ₹499.
- `BIHU15` — 15% off, minimum ₹999.
- `SAVE100` — ₹100 off, minimum ₹899.
- `FREEDEL` — waives the delivery fee.

Rules: one code per order; no stacking; discount on subtotal only; invalid codes
show a clear inline message.

## Delivery & fees

- Dibrugarh city-wide.
- Free delivery on orders whose **pre-discount subtotal** is ≥ ₹499; otherwise
  ₹49. A coupon never pushes an order out of free delivery.
- Same-day if ordered before an afternoon cut-off (e.g. 4:00 PM); otherwise next day.
- Exact slot confirmed by the owner on WhatsApp.

## Brand & visual system

**Direction:** "Gamusa" — the red-and-white Assamese handwoven cloth, and the
marigold of every Bihu. The identity is drawn from the shop's own material
world (the *gamusa*, marigold, indigo, the woven thread) rather than from a
design-trend palette. The earlier "Atelier" direction (ivory + dusty rose +
Fraunces) was scrapped in review: it sits on the current default AI look —
warm cream ground, high-contrast serif display, soft warm accent — and is
indistinguishable from any generated page.

**Palette (CSS variables):**
- Cotton (page): `#F5EFE2`
- Cotton deep (cards / alt bands): `#EBE2D0`
- Indigo (ink and structure): `#152839`
- Gamusa red (the single attention colour): `#C2262C`
- Gamusa red deep (pressed / hover): `#9E1C22`
- Marigold (seasonal accent, used sparingly): `#E9A22B`
- Leaf (foliage, minor): `#3F5C43`

Dominant cotton + indigo, with gamusa red as one sharp accent. Not an even
distribution.

**Type:**
- Display, prices, wordmark: **Eczar** — a sturdy, high-contrast serif with
  South Asian design provenance.
- Body / UI: **Hind Siliguri** — a humanist face that also renders Assamese, so
  the wordmark *কোপৌ* is native rather than transliterated.
- Both from a web font source; system fallbacks defined.

**Wordmark:** **কোপৌ** set in Hind Siliguri, with "KOPOU" in Eczar beneath or
beside it, and the kopou phool (foxtail orchid) as a favicon glyph.

**Structural device:** a **woven thread rule** — a fine repeating red hairline
(`repeating-linear-gradient`) — marks block and section boundaries, consistently
and nowhere decoratively. It is the one place boldness is spent; everything
around it stays quiet. No card shadows; the weave is the only separator.

**Photography:** free stock, **hotlinked** (Unsplash/Pexels URLs held in the
data file), each chosen from a search whose subject matches the product. A few
local-context shots (counter, hands tying a bouquet, foliage). One image per
product, consistent crop ratio. Where no exact match for a named composition
exists, use the closest credible free-stock image.

**Motion:** CSS-first, one orchestrated load only — the woven band *weaves in*
once (a short horizontal reveal), then the headline and CTAs settle. Nothing
else animates on its own. Cart drawer slides; the weave marks hover states.
`prefers-reduced-motion` disables the reveal.

**Copy:** plain, warm, local, honest about the manual confirmation. Assamese
script appears only where it carries meaning: the wordmark, and the step
numerals ১ / ২ / ৩ in the genuine ordering sequence.

## Technical approach

- **Plain HTML / CSS / vanilla JS. No framework, no build step.** Rationale:
  hosts anywhere, opens fast, and is easy to hand to a shop or another developer.
- Pages: `index.html`, `shop.html`, `occasions.html`, `about.html`, `order.html`.
- Shared header/footer/cart drawer rendered once from `js/components.js` to avoid
  duplicated markup across pages.
- `js/data.js` — catalogue + categories, including hotlinked image URLs (single
  source of truth).
- `js/cart.js` — cart state in `localStorage` (`kopou.cart.v1`).
- `js/coupons.js` — coupon rules (`kopou.coupon.v1`).
- `js/checkout.js` — validates the form and POSTs to Formspree.
- `js/site.config.js` — one file holding shop name, city, phone, WhatsApp number,
  the Formspree endpoint (`https://formspree.io/f/mdeazbjq`), and palette tokens,
  so a pitch can be re-branded quickly.
- CSS: variables + a small set of components; mobile-first, responsive.
- Accessibility: semantic landmarks, labelled inputs, visible focus, `aria-live`
  on cart updates, alt text on all images.
- Performance: responsive/lazy-loaded images, minimal JS, no render-blocking fonts.
- Served over HTTP (a local static server, or any static host).

## Copy & tone

Warm, plain, human, lightly local. Avoid hype and jargon. Where the shop's
limitations are real, say so kindly rather than hiding them ("we'll confirm your
order on WhatsApp"). A little Assamese flavour (e.g. *kopou*, *xewali*, Bihu) is
welcome; heavy transliteration is not.

## Shop details (demo placeholders)

Used throughout the demo until a real shop is supplied. The name, address and
hours are invented; the WhatsApp number, orders email and Formspree endpoint are
real and in use.

- **Name:** Kopou
- **City / delivery:** Dibrugarh, Assam — city-wide delivery
- **WhatsApp / phone:** +91 99541 93440
- **Address:** Chowkidinghee, Dibrugarh, Assam 786001
- **Hours:** 8:00 AM – 8:00 PM, daily
- **Orders:** via Formspree `https://formspree.io/f/mdeazbjq` → nt30527@gmail.com
- **Payment:** cash or UPI on delivery
- **Delivery cut-off:** 4:00 PM for same-day; otherwise next day

For a real deployment, replace the invented name/address/hours with the shop's
actual details, plus real product photos and final prices. Everything else in
this document stays.

## Decisions settled in review

- **Taxonomy:** one primary occasion + one category per product (see
  *Catalogue taxonomy*).
- **No price-on-request items.** Every product has a price and an "Add to cart".
- **Free-delivery threshold** measured on the pre-discount subtotal.
- **Images hotlinked** from free stock, never self-hosted; nearest credible match
  used when no exact composition exists.
- **Demo notice:** optional. The site reads as a genuine shop; a single discreet
  footer line (e.g. "sample storefront") may be included at the builder's
  discretion.
- **Shop details filled in:** WhatsApp/phone `+91 99541 93440`, invented address
  and hours, real Formspree endpoint and orders inbox (see *Shop details*).

## What's left to the builder

- Exact section-by-section layout and spacing.
- The motion timing/detail behind the hero reveal.
- Filter/sort UX specifics and how much lives in the URL.
- Final copy for each page and each occasion.
- Choice of free-stock images (search terms, not fixed assets).
- Iconography set (or none).
- Responsive breakpoints.
- Whether to include the optional demo footer line.

## Demo script (for the pitch)

1. Land on Home — the look and the "order in three steps" honesty.
2. Add two bouquets to the cart; open the drawer.
3. Apply `WELCOME10`; watch the total change.
4. Check out with sample details; submit; land on the confirmation screen.
5. Show that the order just arrived in the **nt30527@gmail.com** inbox (via
   Formspree), and tap *Message us on WhatsApp* to show how the owner would
   confirm.

This end-to-end walk is the whole pitch: a real-looking shop the owner could run
with a phone and an email inbox.
