/**
 * Catalogue — the single source of truth for products and their imagery.
 * Images are hotlinked free stock (Unsplash) chosen from a search whose subject
 * matches the product; nothing is self-hosted.
 *
 * The few editorial images (home hero, About page) are written directly into
 * their page HTML instead, so the hero paints without waiting on JavaScript.
 */

/** Build a hotlinked stock URL at a given width. */
const img = (id, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`

export const OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Love & Romance',
  'Congratulations',
  'Thank You',
  'Get Well',
  'Sympathy',
  'Festive (Bihu)',
]

export const CATEGORIES = ['Flowers', 'Plants']

/**
 * The Home page shows a curated seven occasions (spec), not the full list —
 * Love & Romance is left to the Shop and the Occasions page. Order is the
 * spec's reading order.
 */
export const HOME_OCCASIONS = [
  'Birthday',
  'Anniversary',
  'Congratulations',
  'Thank You',
  'Get Well',
  'Sympathy',
  'Festive (Bihu)',
]

export const PRODUCTS = [
  {
    id: 'xewali-dawn',
    name: 'Xewali Dawn',
    composition: '8 white & pink roses, eucalyptus',
    occasion: 'Birthday',
    category: 'Flowers',
    price: 649,
    image: img('photo-1523693916903-027d144a2b7d'),
    featured: true,
    added: 1,
  },
  {
    id: 'blush-bunch',
    name: 'Blush Bunch',
    composition: '10 soft-pink roses, gypsophila',
    occasion: 'Love & Romance',
    category: 'Flowers',
    price: 799,
    image: img('photo-1582794543139-8ac9cb0f7b11'),
    featured: false,
    added: 2,
  },
  {
    id: 'rongali-marigold-strings',
    name: 'Rongali Marigold Strings',
    composition: '2 marigold garlands',
    occasion: 'Festive (Bihu)',
    category: 'Flowers',
    price: 299,
    image: img('photo-1763184176470-2115508594d3'),
    featured: false,
    added: 3,
  },
  {
    id: 'kopou-orchid-arrangement',
    name: 'Kopou Orchid Arrangement',
    composition: 'foxtail orchids, greens, in a vase',
    occasion: 'Festive (Bihu)',
    category: 'Flowers',
    price: 1299,
    image: img('photo-1566553253535-64c91138b407'),
    featured: true,
    added: 4,
  },
  {
    id: 'lily-serenade',
    name: 'Lily Serenade',
    composition: 'white lilies, chrysanthemum, jute wrap',
    occasion: 'Sympathy',
    category: 'Flowers',
    price: 949,
    image: img('photo-1580596090683-f4711170117b'),
    featured: false,
    added: 5,
  },
  {
    id: 'sunflower-smile',
    name: 'Sunflower Smile',
    composition: '5 sunflowers, solidago',
    occasion: 'Congratulations',
    category: 'Flowers',
    price: 599,
    image: img('photo-1455659817273-f96807779a8a'),
    featured: true,
    added: 6,
  },
  {
    id: 'carnation-medley',
    name: 'Carnation Medley',
    composition: '12 mixed carnations',
    occasion: 'Birthday',
    category: 'Flowers',
    price: 549,
    image: img('photo-1583228858294-6745cb25969e'),
    featured: false,
    added: 7,
  },
  {
    id: 'rose-chocolate-box',
    name: 'Rose & Chocolate Box',
    composition: '12 roses with a box of chocolates',
    occasion: 'Anniversary',
    category: 'Flowers',
    price: 1299,
    image: img('photo-1598293181642-e2f722a90c91'),
    featured: false,
    added: 8,
  },
  {
    id: 'thank-you-posy',
    name: 'Thank You Posy',
    composition: 'pastel gerbera mix',
    occasion: 'Thank You',
    category: 'Flowers',
    price: 499,
    image: img('photo-1577090727079-a854293d7cd6'),
    featured: false,
    added: 9,
  },
  {
    id: 'get-well-greens',
    name: 'Get Well Greens',
    composition: 'seasonal blooms with a card',
    occasion: 'Get Well',
    category: 'Flowers',
    price: 549,
    image: img('photo-1469317835793-6d02c2392778'),
    featured: false,
    added: 10,
  },
  {
    id: 'bohag-basket',
    name: 'Bohag Basket',
    composition: 'assorted seasonal basket',
    occasion: 'Festive (Bihu)',
    category: 'Flowers',
    price: 1499,
    image: img('photo-1604323990536-e5452c0507c1'),
    featured: false,
    added: 11,
  },
  {
    id: 'peace-lily',
    name: 'Peace Lily',
    composition: 'potted peace lily, care card',
    occasion: 'Sympathy',
    category: 'Plants',
    price: 349,
    image: img('photo-1520412099551-62b6bafeb5bb'),
    featured: false,
    added: 12,
  },
  {
    id: 'jade-money-plant-pair',
    name: 'Jade & Money Plant Pair',
    composition: 'two potted plants',
    occasion: 'Congratulations',
    category: 'Plants',
    price: 599,
    image: img('photo-1579621970795-87facc2f976d'),
    featured: false,
    added: 13,
  },
  {
    id: 'fruit-flower-basket',
    name: 'Fruit & Flower Basket',
    composition: 'seasonal fruit with flowers',
    occasion: 'Congratulations',
    category: 'Flowers',
    price: 1899,
    image: img('photo-1533264361594-f15b05d6d400'),
    featured: false,
    added: 14,
  },
]

const BY_ID = new Map(PRODUCTS.map((p) => [p.id, p]))

/** Look up a product by id; undefined when unknown. */
export function productById(id) {
  return BY_ID.get(id)
}

/** Products marked featured, in catalogue order. */
export function featuredProducts() {
  return PRODUCTS.filter((p) => p.featured)
}
