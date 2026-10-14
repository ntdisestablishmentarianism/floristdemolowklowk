import { mountLayout } from '../components.js'
import { config } from '../site.config.js'
import { computeTotals } from '../pricing.js'
import { formatINR } from '../format.js'
import {
  makeReference,
  validateOrderForm,
  buildOrderPayload,
  submitOrder,
} from '../order.js'
import { escapeHtml } from '../card.js'

export const COUPON_KEY = 'kopou.coupon.v1'

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

/** Rows for the order summary. Pure, so the money maths is tested in Node. */
export function summaryRows(totals) {
  return [
    { label: 'Subtotal', value: formatINR(totals.subtotal) },
    {
      label: 'Discount',
      value: totals.discount > 0 ? `−${formatINR(totals.discount)}` : formatINR(0),
    },
    { label: 'Delivery', value: totals.deliveryFee === 0 ? 'Free' : formatINR(totals.deliveryFee) },
    { label: 'Total', value: formatINR(totals.total) },
  ]
}

/** A WhatsApp deep link prefilled with the order reference. */
export function whatsAppLink(config, reference) {
  const text = `Hello ${config.name}, I've just sent an order through the website — reference ${reference}. Could you confirm it?`
  return `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(text)}`
}

function readCoupon() {
  try {
    return localStorage.getItem(COUPON_KEY) || ''
  } catch {
    return ''
  }
}

function writeCoupon(value) {
  try {
    if (value) localStorage.setItem(COUPON_KEY, value)
    else localStorage.removeItem(COUPON_KEY)
  } catch {
    /* storage blocked; the coupon simply will not persist */
  }
}

export function bootstrap() {
  const layout = mountLayout(config, { activePath: '/order.html' })
  const cart = layout.cart
  if (!cart) return

  const form = document.querySelector('[data-order-form]')
  const linesEl = document.querySelector('[data-summary-lines]')
  const rowsEl = document.querySelector('[data-summary-rows]')
  const emptyEl = document.querySelector('[data-empty]')
  const couponInput = form.querySelector('[name="coupon"]')
  const couponMsg = form.querySelector('[data-coupon-msg]')
  const formError = form.querySelector('[data-form-error]')
  const submitBtn = form.querySelector('[data-submit]')
  const doneEl = document.querySelector('[data-done]')
  const checkoutEl = document.querySelector('[data-checkout]')

  let couponCode = readCoupon()
  couponInput.value = couponCode

  const totalsNow = () => computeTotals({ items: cart.items(), couponCode })

  function render() {
    const lines = cart.detailed()
    const totals = totalsNow()

    linesEl.innerHTML = lines
      .map(
        (l) => `<div class="sumline">
          <span class="sumline__name">${escapeHtml(l.product.name)} <span class="sumline__qty">× ${l.qty}</span></span>
          <span class="sumline__price">${formatINR(l.lineTotal)}</span>
        </div>`,
      )
      .join('')

    rowsEl.innerHTML = summaryRows(totals)
      .map(
        (r) =>
          `<div class="checkout__row${r.label === 'Total' ? ' checkout__row--total' : ''}"><span>${r.label}</span><span>${r.value}</span></div>`,
      )
      .join('')

    if (totals.couponError) {
      couponMsg.textContent = totals.couponError
      couponMsg.classList.add('field__error')
    } else if (totals.couponCode) {
      couponMsg.textContent = `${totals.couponCode} applied.`
      couponMsg.classList.remove('field__error')
    } else {
      couponMsg.textContent = ''
      couponMsg.classList.remove('field__error')
    }

    const empty = lines.length === 0
    emptyEl.hidden = !empty
    submitBtn.disabled = empty

    // If an order was just placed and the customer adds something new, bring the
    // checkout back rather than stranding them on the confirmation screen.
    if (!empty && !doneEl.hidden) hideDone()
  }

  cart.subscribe(render)
  render()

  form.querySelector('[data-apply-coupon]').addEventListener('click', () => {
    couponCode = couponInput.value.trim()
    const totals = totalsNow()
    writeCoupon(totals.couponCode || '')
    render()
  })

  function clearErrors() {
    formError.textContent = ''
    form.querySelectorAll('.field--invalid').forEach((el) => el.classList.remove('field--invalid'))
    form.querySelectorAll('[data-error-for]').forEach((el) => (el.textContent = ''))
    form.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
      el.removeAttribute('aria-invalid')
      el.removeAttribute('aria-describedby')
    })
  }

  function showFieldErrors(errors) {
    for (const [name, message] of Object.entries(errors)) {
      const input = form.querySelector(`[name="${name}"]`)
      const wrap = input?.closest('.field')
      if (wrap) wrap.classList.add('field--invalid')
      const slot = form.querySelector(`[data-error-for="${name}"]`)
      if (slot) {
        slot.textContent = message
        if (!slot.id) slot.id = `error-${name}`
        if (input) {
          input.setAttribute('aria-invalid', 'true')
          input.setAttribute('aria-describedby', slot.id)
        }
      }
    }
    form.querySelector('.field--invalid input, .field--invalid select')?.focus()
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    clearErrors()

    const values = Object.fromEntries(new FormData(form).entries())
    delete values.coupon

    hideDone()

    const lines = cart.detailed()
    if (!lines.length) {
      formError.textContent = 'Your basket is empty — add a bouquet first.'
      return
    }

    // Honour a coupon the customer typed but did not press Apply for, and refuse
    // to send rather than quietly charging full price for a code they believe is on.
    couponCode = couponInput.value.trim()
    const totals = totalsNow()
    if (totals.couponError) {
      couponMsg.textContent = totals.couponError
      couponMsg.classList.add('field__error')
      couponInput.focus()
      formError.textContent = 'That coupon code is not valid — fix it or clear it to continue.'
      return
    }
    writeCoupon(totals.couponCode || '')

    const { ok, errors } = validateOrderForm(values)
    if (!ok) {
      showFieldErrors(errors)
      formError.textContent = 'Please check the highlighted fields.'
      return
    }

    const reference = makeReference()
    const payload = buildOrderPayload({
      reference,
      lines: lines.map((l) => ({ name: l.product.name, qty: l.qty, lineTotal: l.lineTotal })),
      customer: values,
      totals,
    })

    submitBtn.disabled = true
    submitBtn.textContent = 'Sending…'

    const result = await submitOrder(payload, config.formspree)

    if (result.ok) {
      writeCoupon('')
      cart.clear()
      if (checkoutEl) checkoutEl.hidden = true
      doneEl.querySelector('[data-done-reference]').textContent = reference
      const wa = doneEl.querySelector('[data-done-wa]')
      wa.href = whatsAppLink(config, reference)
      doneEl.hidden = false
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    } else {
      formError.textContent = result.error
      submitBtn.disabled = false
      submitBtn.textContent = 'Send the order'
    }
  })

  function hideDone() {
    if (doneEl.hidden) return
    doneEl.hidden = true
    if (checkoutEl) checkoutEl.hidden = false
    submitBtn.disabled = false
    submitBtn.textContent = 'Send the order'
  }

  const dateInput = form.querySelector('[name="date"]')
  if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10)
}

if (typeof document !== 'undefined' && document.querySelector('[data-order-form]')) bootstrap()
