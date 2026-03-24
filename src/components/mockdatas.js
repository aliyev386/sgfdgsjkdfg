export const MOCK_SLIDES = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1800&q=85",
    // DB-dən gəlir, tərcümə olunmur:
    heading: "Timeless Furniture for Modern Living",
    subheading: "Handcrafted pieces that blend artisan tradition with contemporary design.",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1800&q=85",
    heading: "Crafted With Purpose & Care",
    subheading: "14 years of refined craftsmanship — pieces built to last a lifetime.",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1800&q=85",
    heading: "New Arrivals — Spring 2025",
    subheading: "Discover our latest collection of sustainably sourced oak furniture.",
  },
];
export const BADGE_COLORS = {
  best_seller: "#D4714A",
  new_in:      "#7A9E7E",
  sale:        "#C9A84C",
};
export const MOCK_CAMPAIGNS = [
  {
    id: 1,
    title: "Spring Sale",          // DB-dən gəlir
    description: "Up to 30% off on all living room furniture.",
    discount_label: "−30%",
    end_date: "2025-05-31",
    color: "#D4714A",
    image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80",
    slug: "spring-sale-2025",
  },
  {
    id: 2,
    title: "New In: Bedroom",
    description: "Fresh bedroom collection — free delivery on all beds this week.",
    discount_label: "New",
    end_date: "2025-04-30",
    color: "#7A9E7E",
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80",
    slug: "new-bedroom-2025",
  },
  {
    id: 3,
    title: "Office Clearance",
    description: "Final stock on our bestselling executive desks — limited pieces.",
    discount_label: "−20%",
    end_date: "2025-04-15",
    color: "#C9A84C",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
    slug: "office-clearance",
  },
];

export const MOCK_FEATURED_PRODUCTS = [
  { id: 1, name: "Velour Lounge Sofa",  category: "sofas",   price: 2490, old_price: 2990, badge: "best_seller", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80",  stars: 5, slug: "velour-lounge-sofa" },
  { id: 2, name: "Nordic Oak Chair",    category: "chairs",  price: 680,  old_price: null,  badge: "new_in",     image: "https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80", stars: 4, slug: "nordic-oak-chair" },
  { id: 3, name: "Florence Daybed",     category: "sofas",   price: 1890, old_price: 2200,  badge: null,         image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&q=80", stars: 5, slug: "florence-daybed" },
  { id: 4, name: "Aria Coffee Table",   category: "tables",  price: 940,  old_price: null,  badge: "new_in",     image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&q=80", stars: 4, slug: "aria-coffee-table" },
  { id: 5, name: "Ember Armchair",      category: "chairs",  price: 1200, old_price: null,  badge: null,         image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=500&q=80", stars: 5, slug: "ember-armchair" },
  { id: 6, name: "Heirloom Dining Set", category: "tables",  price: 3400, old_price: 3900,  badge: "sale",       image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&q=80", stars: 4, slug: "heirloom-dining-set" },
  { id: 7, name: "Oslo Shelf Unit",     category: "all",     price: 680,  old_price: 820,   badge: "sale",       image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&q=80", stars: 4, slug: "oslo-shelf-unit" },
  { id: 8, name: "Linen 3-Seater",      category: "sofas",   price: 1890, old_price: null,  badge: "new_in",     image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80", stars: 5, slug: "linen-3-seater" },
];

export const MOCK_CATEGORIES = [
  { id: 1, name: "Living Room", slug: "living-room", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=80",  product_count: 48 },
  { id: 2, name: "Bedroom",     slug: "bedroom",     image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=700&q=80", product_count: 36 },
  { id: 3, name: "Home Office", slug: "home-office", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80", product_count: 22 },
  { id: 4, name: "Dining Room", slug: "dining-room", image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=700&q=80", product_count: 31 },
  { id: 5, name: "Outdoor",     slug: "outdoor",     image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80",  product_count: 19 },
  { id: 6, name: "Kids Room",   slug: "kids-room",   image: "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=700&q=80", product_count: 27 },
];

export const MOCK_COLLECTIONS = [
  { id: 1, name: "Nordic Calm",        slug: "nordic-calm",        product_count: 18, image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=700&q=80", accent: "#7A9E7E" },
  { id: 2, name: "Warm Minimalism",    slug: "warm-minimalism",    product_count: 24, image: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=700&q=80", accent: "#C9A84C" },
  { id: 3, name: "Urban Industrial",   slug: "urban-industrial",   product_count: 15, image: "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=700&q=80", accent: "#D4714A" },
];