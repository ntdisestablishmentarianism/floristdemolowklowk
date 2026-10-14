/**
 * Coupon rules. One code per order; no stacking; the discount applies to the
 * subtotal only, before delivery. Invalid codes always surface an error — never
 * a silent ₹0 discount.
 */

import { formatINR } from './format.js'

export const COUPONS = {
  WELCOME10: { code: 'WELCOME10', type: 'percent', value: 10, minSubtotal: 499 },
  BIHU15: { code: 'BIHU15', type: 'percent', value: 15, minSubtotal: 999 },
  SAVE100: { code: 'SAVE100', type: 'flat', value: 100, minSubtotal: 899 },
  FREEDEL: { code: 'FREEDEL', type: 'freeDelivery', value: 0, minSubtotal: 0 },
}

/**
 * @param {string} code raw code as typed by the customer
 * @param {number} subtotal pre-discount cart subtotal in ₹
 * @returns {{ok:true, code:string, discount:number, freeDelivery:boolean}
 *          | {ok:false, error:string}}
 */
export function applyCoupon(code, subtotal) {
  const key = String(code ?? '').trim().toUpperCase()
  if (!key) return { ok: false, error: 'Enter a coupon code.' }

  const coupon = COUPONS[key]
  if (!coupon) return { ok: false, error: `We don't recognise the code “${key}”.` }

  if (subtotal < coupon.minSubtotal) {
    return {
      ok: false,
      error: `${coupon.code} needs a minimum order of ${formatINR(coupon.minSubtotal)}.`,
    }
  }

  const discount =
    coupon.type === 'percent'
      ? Math.round((subtotal * coupon.value) / 100)
      : coupon.type === 'flat'
        ? coupon.value
        : 0

  return { ok: true, code: coupon.code, discount, freeDelivery: coupon.type === 'freeDelivery' }
}
