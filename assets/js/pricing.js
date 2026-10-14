/**
 * Totals engine. Pure: takes cart lines and an optional coupon code, returns
 * the money breakdown. Free delivery is measured on the pre-discount subtotal,
 * so a coupon can never push an order out of free delivery.
 */
import { applyCoupon } from './coupons.js'

export const DELIVERY_FEE = 49
export const FREE_DELIVERY_MIN = 499

/**
 * @param {{ items?: {price:number, qty:number}[], couponCode?: string }} input
 * @returns {{subtotal:number, discount:number, deliveryFee:number, total:number,
 *            freeDeliveryApplied:boolean, couponCode:string, couponError:string}}
 */
export function computeTotals({ items = [], couponCode = '' } = {}) {
  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0)
  const freeDeliveryApplied = subtotal >= FREE_DELIVERY_MIN

  let discount = 0
  let couponFreeDelivery = false
  let appliedCode = ''
  let couponError = ''

  if (couponCode) {
    const result = applyCoupon(couponCode, subtotal)
    if (result.ok) {
      discount = result.discount
      couponFreeDelivery = result.freeDelivery
      appliedCode = result.code
    } else {
      couponError = result.error
    }
  }

  const deliveryFee =
    subtotal === 0 ? 0 : freeDeliveryApplied || couponFreeDelivery ? 0 : DELIVERY_FEE
  const total = subtotal - discount + deliveryFee

  return {
    subtotal,
    discount,
    deliveryFee,
    total,
    freeDeliveryApplied,
    couponCode: appliedCode,
    couponError,
  }
}
