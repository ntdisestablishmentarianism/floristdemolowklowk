/**
 * The product card, shared by the Home, Shop and Occasions pages so a bouquet
 * looks the same everywhere. Price is formatted; text is HTML-escaped.
 */
import { formatINR } from './format.js'

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function productCardHTML(product) {
  const name = escapeHtml(product.name)
  const composition = escapeHtml(product.composition)
  return `
  <article class="card" data-product="${escapeHtml(product.id)}">
    <div class="card__media">
      <img src="${escapeHtml(product.image)}" alt="${name} — ${composition}" loading="lazy" width="600" height="750" />
    </div>
    <div class="card__body">
      <h3 class="card__name">${name}</h3>
      <p class="card__comp">${composition}</p>
      <p class="card__occasion">${escapeHtml(product.occasion)}</p>
      <div class="card__foot">
        <span class="card__price">${formatINR(product.price)}</span>
        <button class="btn btn--primary btn--small" type="button" data-add="${escapeHtml(product.id)}" data-name="${name}">
          Add to basket
        </button>
      </div>
    </div>
  </article>`
}
