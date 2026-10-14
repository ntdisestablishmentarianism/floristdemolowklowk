import { mountLayout } from '../components.js'
import { config } from '../site.config.js'
import { PRODUCTS } from '../data.js'
import { productCardHTML, escapeHtml } from '../card.js'

/** Bihu first — it is the occasion this shop is known for. */
export const OCCASION_ORDER = [
  'Festive (Bihu)',
  'Birthday',
  'Anniversary',
  'Love & Romance',
  'Congratulations',
  'Thank You',
  'Get Well',
  'Sympathy',
]

const COPY = {
  'Festive (Bihu)': {
    title: 'Bihu',
    body: 'Bohag Bihu is why the shop smells of marigold all April. Strings for the door, kopou for the hair, and baskets for the whole household.',
  },
  Birthday: {
    title: 'Birthday',
    body: 'The everyday celebration — bright, generous, and tied to travel well across town.',
  },
  Anniversary: {
    title: 'Anniversary',
    body: 'Roses, or roses with chocolate. Tell us what to write and we will put the card in ourselves.',
  },
  'Love & Romance': {
    title: 'Love & Romance',
    body: 'Soft pinks, a lot of gypsophila, and nothing that shouts.',
  },
  Congratulations: {
    title: 'Congratulations',
    body: 'Sunflowers and mixed baskets, for the news that deserves flowers at the door.',
  },
  'Thank You': {
    title: 'Thank You',
    body: 'A small pastel posy says it without making a fuss.',
  },
  'Get Well': {
    title: 'Get Well',
    body: 'Gentle colour and no heavy scent, which is usually what a hospital room wants.',
  },
  Sympathy: {
    title: 'Sympathy',
    body: 'White lilies and quiet greens. We will handle this one carefully, and deliver it when you ask.',
  },
}

/** Products for one occasion, in catalogue order. */
export function byOccasion(products, occasion) {
  return products.filter((p) => p.occasion === occasion)
}

/** Render one occasion section, with a link into the filtered shop. */
export function occasionSectionHTML(occasion, products) {
  const copy = COPY[occasion] ?? { title: occasion, body: '' }
  const cards = products.map(productCardHTML).join('\n')
  return `
  <section class="occasion" aria-labelledby="occ-${escapeHtml(occasion)}">
    <div class="section__head">
      <h2 id="occ-${escapeHtml(occasion)}">${escapeHtml(copy.title)}</h2>
      <a class="section__more" href="/shop.html?occasion=${encodeURIComponent(occasion)}">
        Shop ${escapeHtml(copy.title)}
      </a>
    </div>
    <p class="occasion__copy">${escapeHtml(copy.body)}</p>
    <div class="grid grid--3">${cards}</div>
  </section>`
}

export function sectionsHTML(products) {
  return OCCASION_ORDER.map((occasion) => {
    const items = byOccasion(products, occasion).slice(0, 3)
    return items.length ? occasionSectionHTML(occasion, items) : ''
  })
    .filter(Boolean)
    .join('\n')
}

export function bootstrap() {
  mountLayout(config, { activePath: '/occasions.html' })
  const host = document.querySelector('[data-occasions]')
  if (host) host.innerHTML = sectionsHTML(PRODUCTS)
}

if (typeof document !== 'undefined' && document.querySelector('[data-occasions]')) bootstrap()
