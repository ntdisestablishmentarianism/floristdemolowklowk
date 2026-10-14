/**
 * Order reference, form validation, payload building, and Formspree submission.
 * Pure except for submitOrder, which takes its fetch implementation by injection
 * so the failure paths are testable without the network.
 */
import { formatINR } from './format.js'

const REF_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

/** Order references look like KOP-YYMMDD-XXXX. */
export function makeReference(date = new Date(), rand = Math.random) {
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  let tail = ''
  for (let i = 0; i < 4; i++) {
    tail += REF_ALPHABET[Math.floor(rand() * REF_ALPHABET.length)]
  }
  return `KOP-${yy}${mm}${dd}-${tail}`
}

export const PAYMENT_METHODS = ['Cash on delivery', 'UPI on delivery']

/**
 * @returns {{ok:boolean, errors: Record<string,string>}}
 */
export function validateOrderForm(values = {}) {
  const errors = {}
  if (!String(values.name ?? '').trim()) errors.name = 'Please tell us your name.'
  if (!String(values.phone ?? '').trim()) {
    errors.phone = 'We need a phone number to confirm your order.'
  } else if (!/^[0-9+\-\s()]{6,}$/.test(String(values.phone).trim())) {
    errors.phone = 'That phone number does not look right.'
  }
  if (!String(values.address ?? '').trim()) {
    errors.address = 'Please give a delivery address.'
  }
  if (!PAYMENT_METHODS.includes(values.payment)) {
    errors.payment = 'Choose how you would like to pay.'
  }
  return { ok: Object.keys(errors).length === 0, errors }
}

/**
 * Flatten an order into a Formspree-friendly string map.
 * @param {{reference:string, lines:{name:string,qty:number,lineTotal:number}[],
 *          customer:object, totals:object}} order
 */
export function buildOrderPayload({ reference, lines = [], customer = {}, totals = {} }) {
  const items = lines
    .map((l) => `${l.name} × ${l.qty} — ${formatINR(l.lineTotal)}`)
    .join('\n')

  const delivery =
    totals.deliveryFee === 0 ? 'Free' : formatINR(totals.deliveryFee)

  return {
    _subject: `Kopou order ${reference}`,
    reference,
    name: customer.name ?? '',
    phone: customer.phone ?? '',
    altPhone: customer.altPhone ?? '',
    address: customer.address ?? '',
    landmark: customer.landmark ?? '',
    pincode: customer.pincode ?? '',
    date: customer.date ?? '',
    slot: customer.slot ?? '',
    recipient: customer.recipient ?? '',
    occasion: customer.occasion ?? '',
    cardMessage: customer.cardMessage ?? '',
    payment: customer.payment ?? '',
    notes: customer.notes ?? '',
    items,
    subtotal: formatINR(totals.subtotal ?? 0),
    discount: formatINR(totals.discount ?? 0),
    coupon: totals.couponCode ?? '',
    delivery,
    total: formatINR(totals.total ?? 0),
  }
}

/**
 * POST the payload to Formspree. Never throws: a non-2xx response or a network
 * error is reported as {ok:false}, so the caller can keep the cart and retry.
 */
export async function submitOrder(payload, endpoint, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      return { ok: false, error: `We could not send your order (error ${res.status}).` }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'We could not reach the order service. Check your connection and try again.' }
  }
}
