import { mountLayout } from '../components.js'
import { config } from '../site.config.js'
import { CATEGORIES, OCCASIONS, PRODUCTS } from '../data.js'
import { productCardHTML, escapeHtml } from '../card.js'

/**
 * Filter and sort the catalogue. Pure, so the Shop's behaviour is tested in
 * Node; the page wiring lives in `bootstrap`.
 */
export function filterAndSort(
  products,
  { occasion = '', category = '', minPrice, maxPrice, sort = '' } = {},
) {
  let list = products.filter((p) => {
    if (occasion && p.occasion !== occasion) return false
    if (category && p.category !== category) return false
    if (typeof minPrice === 'number' && p.price < minPrice) return false
    if (typeof maxPrice === 'number' && p.price > maxPrice) return false
    return true
  })

  switch (sort) {
    case 'price-asc':
      list = [...list].sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      list = [...list].sort((a, b) => b.price - a.price)
      break
    case 'newest':
      list = [...list].sort((a, b) => b.added - a.added)
      break
    case 'featured':
      list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured))
      break
    default:
      break
  }

  return list
}

/** Read the current filter state from a URLSearchParams-like object. */
export function readFilters(params) {
  const num = (v) => {
    if (v === null || v === '') return undefined
    const n = Number(v)
    return Number.isFinite(n) ? n : undefined
  }
  return {
    occasion: params.get('occasion') || '',
    category: params.get('category') || '',
    minPrice: num(params.get('minPrice')),
    maxPrice: num(params.get('maxPrice')),
    sort: params.get('sort') || '',
  }
}

export function resultsHTML(products) {
  if (!products.length) {
    return `<p class="shop__empty">Nothing matches those filters. Try widening the price range or clearing the occasion.</p>`
  }
  return products.map(productCardHTML).join('\n')
}

function option(value, label, selected) {
  return `<option value="${escapeHtml(value)}"${value === selected ? ' selected' : ''}>${escapeHtml(label)}</option>`
}

export function bootstrap() {
  mountLayout(config, { activePath: '/shop.html' })

  const form = document.querySelector('[data-filters]')
  const grid = document.querySelector('[data-results]')
  const countEl = document.querySelector('[data-result-count]')
  if (!form || !grid) return

  const params = new URLSearchParams(location.search)
  const state = readFilters(params)

  // Populate the selects from the catalogue's own taxonomy.
  const occSel = form.querySelector('[name="occasion"]')
  const catSel = form.querySelector('[name="category"]')
  if (occSel) {
    occSel.innerHTML =
      option('', 'All occasions', state.occasion) +
      OCCASIONS.map((o) => option(o, o, state.occasion)).join('')
  }
  if (catSel) {
    catSel.innerHTML =
      option('', 'All types', state.category) +
      CATEGORIES.map((c) => option(c, c, state.category)).join('')
  }
  form.querySelector('[name="minPrice"]').value = state.minPrice ?? ''
  form.querySelector('[name="maxPrice"]').value = state.maxPrice ?? ''
  form.querySelector('[name="sort"]').value = state.sort

  function apply({ push = true } = {}) {
    const next = {
      occasion: form.querySelector('[name="occasion"]').value,
      category: form.querySelector('[name="category"]').value,
      minPrice: form.querySelector('[name="minPrice"]').value,
      maxPrice: form.querySelector('[name="maxPrice"]').value,
      sort: form.querySelector('[name="sort"]').value,
    }
    const clean = new URLSearchParams()
    for (const [k, v] of Object.entries(next)) if (v !== '' && v != null) clean.set(k, v)
    if (push) history.replaceState(null, '', clean.toString() ? `?${clean}` : location.pathname)

    const results = filterAndSort(PRODUCTS, readFilters(clean))
    grid.innerHTML = resultsHTML(results)
    if (countEl) {
      countEl.textContent = `${results.length} ${results.length === 1 ? 'arrangement' : 'arrangements'}`
    }
  }

  form.addEventListener('change', () => apply())
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    apply()
  })
  form.querySelectorAll('[data-clear]').forEach((btn) =>
    btn.addEventListener('click', () => {
      form.reset()
      // form.reset() restores each option's defaultSelected state, which after a
      // URL pre-filter (?occasion=…) is the pre-filtered option — so Clear must
      // empty every control explicitly or it would appear to do nothing.
      for (const name of ['occasion', 'category', 'minPrice', 'maxPrice', 'sort']) {
        const el = form.querySelector(`[name="${name}"]`)
        if (el) el.value = ''
      }
      apply()
    }),
  )

  apply({ push: false })
}

if (typeof document !== 'undefined' && document.querySelector('[data-filters]')) bootstrap()
