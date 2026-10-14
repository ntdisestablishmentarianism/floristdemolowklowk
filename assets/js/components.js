/**
 * Shared site chrome: header, footer, and the cart drawer. Markup is built as
 * strings (testable in Node) — `mountLayout` is the only browser-only piece.
 */
import { formatINR } from './format.js'
import { createCart } from './cart.js'
import { computeTotals } from './pricing.js'

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/shop.html', label: 'Shop' },
  { href: '/occasions.html', label: 'Occasions' },
  { href: '/about.html', label: 'About' },
  { href: '/order.html', label: 'Order' },
]

function isActive(href, activePath) {
  if (href === '/') return activePath === '/' || activePath === '/index.html' || activePath === ''
  return href === activePath
}

export function headerHTML(config, activePath = '/') {
  const links = NAV.map(({ href, label }) => {
    const active = isActive(href, activePath)
    return `<a class="nav__link" href="${href}"${active ? ' aria-current="page"' : ''}>${label}</a>`
  }).join('\n        ')

  return `
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="wordmark" href="/" aria-label="${config.name} — home">
        <span class="wordmark__as" lang="as">কোপৌ</span>
        <span class="wordmark__lat">${config.name}</span>
      </a>
      <nav class="nav" aria-label="Primary">
        ${links}
      </nav>
      <button class="cart-button" type="button" data-cart-open aria-haspopup="dialog" aria-controls="cart-drawer">
        Basket <span class="cart-button__count" data-cart-count>0</span>
      </button>
    </div>
    <div class="weave-rule" aria-hidden="true"></div>
  </header>`
}

const WHATSAPP_GLYPH =
  '<svg class="whatsapp-fab__glyph" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">' +
  '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>' +
  '</svg>'

/**
 * The floating "Chat on WhatsApp" button. Opens a blank chat to the shop's
 * number (no prefilled text), so the customer says whatever they want.
 */
export function whatsAppButtonHTML(config) {
  return `<a class="whatsapp-fab" href="https://wa.me/${config.whatsapp}" target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
  ${WHATSAPP_GLYPH}
  <span class="whatsapp-fab__label" aria-hidden="true">Chat on WhatsApp</span>
</a>`
}

export function footerHTML(config) {  return `
  <div class="weave-rule" aria-hidden="true"></div>
  <footer class="site-footer" id="contact">
    <div class="container site-footer__inner">
      <div class="site-footer__brand">
        <span class="footer-wordmark" lang="as">কোপৌ</span>
        <p>Fresh flowers, hand-tied in ${config.city}.</p>
      </div>
      <div class="site-footer__col">
        <h2 class="site-footer__head">Visit or call</h2>
        <p>${config.address}</p>
        <p>${config.hours}</p>
      </div>
      <div class="site-footer__col">
        <h2 class="site-footer__head">Order</h2>
        <p><a href="tel:+${config.whatsapp}">${config.phone}</a></p>
        <p><a href="https://wa.me/${config.whatsapp}" rel="noopener">Message us on WhatsApp</a></p>
        <p>Pay cash or UPI on delivery.</p>
      </div>
    </div>
    <div class="container site-footer__fine">
      <p>Sample storefront for a demonstration. Orders are confirmed personally by
      phone or WhatsApp once we check the day's flowers.</p>
    </div>
  </footer>`
}

export function cartDrawerHTML(lines, totals) {
  const body = lines.length
    ? `<ul class="drawer__lines">
        ${lines
          .map(
            (l) => `<li class="drawer__line" data-id="${l.product.id}">
          <img class="drawer__thumb" src="${l.product.image}" alt="" width="64" height="64" loading="lazy" />
          <div class="drawer__line-body">
            <p class="drawer__line-name">${l.product.name}</p>
            <div class="drawer__qty">
              <button type="button" data-qty-down aria-label="One fewer ${l.product.name}">–</button>
              <span aria-live="polite">${l.qty}</span>
              <button type="button" data-qty-up aria-label="One more ${l.product.name}">+</button>
            </div>
          </div>
          <div class="drawer__line-right">
            <p class="drawer__line-total">${formatINR(l.lineTotal)}</p>
            <button type="button" class="drawer__remove" data-remove>Remove</button>
          </div>
        </li>`,
          )
          .join('')}
      </ul>`
    : `<p class="drawer__empty">Your basket is empty. Add a bouquet from the shop and it will appear here.</p>`

  const money = (label, value, extra = '') =>
    `<div class="drawer__row${extra}"><span>${label}</span><span>${value}</span></div>`

  return `
  <aside class="drawer" id="cart-drawer" role="dialog" aria-modal="true" aria-label="Your basket" data-cart-drawer hidden>
    <div class="drawer__head">
      <h2 class="drawer__title">Your basket</h2>
      <button type="button" class="drawer__close" data-cart-close aria-label="Close basket">×</button>
    </div>
    ${body}
    <div class="drawer__foot" aria-live="polite">
      ${money('Subtotal', formatINR(totals.subtotal))}
      ${
        totals.discount > 0
          ? money('Discount', `−${formatINR(totals.discount)}`, ' drawer__row--discount')
          : ''
      }
      ${money('Delivery', totals.deliveryFee === 0 ? 'Free' : formatINR(totals.deliveryFee))}
      <div class="drawer__row drawer__row--total"><span>Total</span><span>${formatINR(totals.total)}</span></div>
      <a class="btn btn--primary drawer__checkout" href="/order.html">Go to checkout</a>
      <p class="drawer__note">Pay cash or UPI when it arrives.</p>
    </div>
  </aside>`
}

const TOAST_MS = 2600

/**
 * Inject header, footer and cart drawer into the page and wire them to a cart.
 * Returns the cart instance plus helpers, so pages share one source of truth.
 */
export function mountLayout(config, { activePath = '/' } = {}) {
  if (typeof document === 'undefined') return { cart: null }

  document.body.insertAdjacentHTML('afterbegin', headerHTML(config, activePath))
  document.body.insertAdjacentHTML(
    'beforeend',
    '<div data-drawer-host></div><div class="drawer-scrim" data-cart-scrim hidden></div>' + footerHTML(config),
  )
  document.body.insertAdjacentHTML('beforeend', '<div class="toast" data-toast role="status" hidden></div>')
  document.body.insertAdjacentHTML('beforeend', whatsAppButtonHTML(config))

  const host = document.querySelector('[data-drawer-host]')
  const scrim = document.querySelector('[data-cart-scrim]')
  const toastEl = document.querySelector('[data-toast]')
  const cart = createCart()
  let isOpen = false
  let toastTimer

  function renderDrawer() {
    // Rebuilding the drawer's HTML destroys whatever control had focus, so a
    // keyboard user would lose their place on every quantity change. Remember
    // which control was active and put focus back on its equivalent.
    const active = document.activeElement
    let restore = null
    if (active && host.contains(active)) {
      const attr = ['data-qty-up', 'data-qty-down', 'data-remove', 'data-cart-close'].find((a) =>
        active.hasAttribute(a),
      )
      if (attr) restore = { attr, id: active.closest('[data-id]')?.dataset.id ?? null }
    }

    const lines = cart.detailed()
    const totals = computeTotals({ items: cart.items() })
    host.innerHTML = cartDrawerHTML(lines, totals)
    const badge = document.querySelector('[data-cart-count]')
    if (badge) badge.textContent = String(cart.count())
    const aside = host.querySelector('[data-cart-drawer]')
    if (aside && isOpen) aside.hidden = false

    if (restore) {
      const scope = restore.id ? host.querySelector(`[data-id="${restore.id}"]`) : host
      const next = scope?.querySelector(`[${restore.attr}]`)
      if (next) next.focus()
      else host.querySelector('[data-cart-close]')?.focus()
    }
  }

  function openDrawer() {
    isOpen = true
    const aside = host.querySelector('[data-cart-drawer]')
    if (aside) aside.hidden = false
    scrim.hidden = false
    document.body.classList.add('drawer-open')
    host.querySelector('[data-cart-close]')?.focus()
  }

  function closeDrawer() {
    isOpen = false
    const aside = host.querySelector('[data-cart-drawer]')
    if (aside) aside.hidden = true
    scrim.hidden = true
    document.body.classList.remove('drawer-open')
    document.querySelector('[data-cart-open]')?.focus()
  }

  function toast(message) {
    if (!toastEl) return
    toastEl.textContent = message
    toastEl.hidden = false
    toastEl.classList.add('toast--show')
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('toast--show')
      toastEl.hidden = true
    }, TOAST_MS)
  }

  cart.subscribe(renderDrawer)
  renderDrawer()

  document.addEventListener('click', (event) => {
    if (event.target.matches('[data-cart-scrim]')) return closeDrawer()
    const target = event.target.closest('button, a')
    if (!target) return
    if (target.matches('[data-cart-open]')) return openDrawer()
    if (target.matches('[data-cart-close]')) return closeDrawer()
    if (target.matches('[data-add]')) {
      cart.add(target.dataset.add, 1)
      toast(`${target.dataset.name || 'Item'} added to your basket`)
      return
    }
    const line = target.closest('[data-id]')
    if (!line) return
    const id = line.dataset.id
    if (target.matches('[data-qty-up]')) return cart.add(id, 1)
    if (target.matches('[data-qty-down]')) return cart.setQty(id, (cart.items().find((i) => i.id === id)?.qty ?? 1) - 1)
    if (target.matches('[data-remove]')) return cart.remove(id)
  })

  document.addEventListener('keydown', (event) => {
    if (!isOpen) return
    if (event.key === 'Escape') return closeDrawer()
    if (event.key !== 'Tab') return

    // Keep Tab focus inside the open dialog.
    const aside = host.querySelector('[data-cart-drawer]')
    if (!aside) return
    const focusables = [...aside.querySelectorAll('button, a[href], input, select, textarea')].filter(
      (el) => !el.hasAttribute('disabled'),
    )
    if (!focusables.length) return
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  })

  return { cart, openDrawer, closeDrawer, toast, refreshDrawer: renderDrawer }
}
