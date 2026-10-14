import { mountLayout } from '../components.js'
import { config } from '../site.config.js'
import { OCCASIONS, PRODUCTS, featuredProducts } from '../data.js'
import { productCardHTML, escapeHtml } from '../card.js'

/** Pure renderers (tested in Node); the side effects live in `bootstrap`. */

export function featuredHTML(products) {
  return products.map(productCardHTML).join('\n')
}

export function occasionsHTML(occasions) {
  return occasions
    .map(
      (name) =>
        `<a class="chip" href="/shop.html?occasion=${encodeURIComponent(name)}">${escapeHtml(name)}</a>`,
    )
    .join('\n')
}

export function bootstrap() {
  mountLayout(config, { activePath: '/' })

  const featured = document.querySelector('[data-featured]')
  if (featured) featured.innerHTML = featuredHTML(featuredProducts())

  const occasions = document.querySelector('[data-occasions]')
  if (occasions) occasions.innerHTML = occasionsHTML(OCCASIONS)

  document.querySelectorAll('[data-product-count]').forEach((el) => {
    el.textContent = String(PRODUCTS.length)
  })
}

if (typeof document !== 'undefined') bootstrap()
