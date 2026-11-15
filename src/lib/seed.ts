import type { Category, Faq, Product, Review, SiteSettings } from "@/lib/types";

/**
 * First-run content so the site never looks empty. Everything here is editable
 * (or deletable) in the admin portal. Products and reviews are flagged `sample`
 * so the dashboard can remind you to replace them before launch.
 */

export const defaultSettings: SiteSettings = {
  id: "site",
  whatsappNumber: "",
  instagramUrl: "https://www.instagram.com/studioglimmer.lk",
  tiktokUrl: "",
  facebookUrl: "",
  email: "",
  location: "Sri Lanka · Island-wide delivery",
  promoEnabled: true,
  promoText: "✦ Custom orders now open — personalise any piece with your name ✦",
  heroEyebrow: "Handmade to sparkle",
  heroScript: "Sparkle",
  heroTitle: "In Every Detail",
  heroSubtitle:
    "Custom rhinestone creations, hand-placed stone by stone — made to be gifted, treasured and noticed.",
  heroImage: null,
  aboutTitle: "The Art of Glimmer",
  aboutText:
    "Studio Glimmer began in 2020 with a single tumbler and a tray of crystals. Today every piece is still made by hand — each stone placed one at a time, so no two creations are ever exactly alike.\n\nWhether it's a gift for someone special, a keepsake for your big day, or a little sparkle just for you, we'd love to create it with you.",
  aboutImage: null,
  stats: [
    { value: "2020", label: "Sparkling since" },
    { value: "100%", label: "Hand-placed stones" },
    { value: "Island-wide", label: "Delivery" },
  ],
  policies: {
    shipping:
      "We deliver island-wide across Sri Lanka.\n\nReady-made items are dispatched within 2–3 working days. Custom pieces take 5–10 working days depending on the design — we'll confirm the timeline with you on WhatsApp before we begin.\n\nDelivery charges depend on your location and are confirmed when you place your order.",
    returns:
      "Because each piece is handmade (and custom pieces are made just for you), we can't accept returns for change of mind.\n\nIf your item arrives damaged, please message us on WhatsApp within 48 hours of delivery with photos and we'll make it right with a repair or replacement.",
    privacy:
      "We only collect the details you share with us (such as your name, phone number and delivery address) to process your order or custom request.\n\nWe never sell or share your information with third parties, except our delivery partner when shipping your order.",
    terms:
      "Orders are confirmed once we've agreed the details and payment with you on WhatsApp.\n\nCustom orders require an advance payment before work begins. Colours of stones may vary slightly from photos due to lighting and screen settings.",
  },
};

export const defaultCategories: Category[] = [
  { id: "cat-phone", slug: "phone-cases", name: "Phone Cases & Accessories", tagline: "Bling for the things you carry every day", sortOrder: 1 },
  { id: "cat-tumbler", slug: "tumblers", name: "Tumblers & Bottles", tagline: "Sip in sparkle", sortOrder: 2 },
  { id: "cat-apparel", slug: "apparel-bags", name: "Apparel & Bags", tagline: "Wear your shine", sortOrder: 3 },
  { id: "cat-gifts", slug: "gifts", name: "Gifts & Occasions", tagline: "Personalised keepsakes for every celebration", sortOrder: 4 },
  { id: "cat-canvas", slug: "canvas-boards", name: "Canvas Boards", tagline: "Sparkling art for your walls", sortOrder: 5 },
].map((c) => ({ ...c, image: null }));

type SeedProduct = Pick<Product, "name" | "categoryId" | "price" | "description"> & Partial<Product>;

const seedProducts: SeedProduct[] = [
  { name: "Rose Gold Crystal Phone Case", categoryId: "cat-phone", price: 3500, featured: true, isNew: true,
    description: "Fully covered in hand-placed rose-gold crystals. Available for most iPhone and Samsung models — tell us your model when ordering.",
    options: [{ name: "Phone model", values: ["iPhone 15 / 15 Pro", "iPhone 16 / 16 Pro", "Samsung S24", "Other (tell us)"] }] },
  { name: "Initial Bling AirPods Case", categoryId: "cat-phone", price: 2800, personalizable: true, personalizationLabel: "Initial(s)",
    description: "A sparkling AirPods case finished with your initial in contrasting crystals." },
  { name: "Glimmer Keychain", categoryId: "cat-phone", price: 1200, isNew: true, personalizable: true, personalizationLabel: "Name (max 8 letters)",
    description: "A little sparkle for your keys or bag — personalised with a name." },
  { name: "Signature Rhinestone Tumbler", categoryId: "cat-tumbler", price: 4800, featured: true, compareAtPrice: 5500,
    description: "Our best-seller. A 20oz stainless tumbler covered edge to edge in crystals, with a straw and lid.",
    options: [{ name: "Colour", values: ["Rose gold", "Champagne", "Silver", "Pink ombré"] }] },
  { name: "Personalised Name Bottle", categoryId: "cat-tumbler", price: 4200, personalizable: true, personalizationLabel: "Name to add", isNew: true,
    description: "Insulated water bottle with your name in sparkling script." },
  { name: "Sparkle Statement Tee", categoryId: "cat-apparel", price: 4500, featured: true,
    description: "Soft cotton tee with a hand-set rhinestone design.",
    options: [{ name: "Size", values: ["S", "M", "L", "XL"] }] },
  { name: "Crystal Evening Clutch", categoryId: "cat-apparel", price: 6500, featured: true,
    description: "A fully embellished clutch for weddings, parties and every night out." },
  { name: "Bride Squad Glass Set", categoryId: "cat-gifts", price: 8500, isNew: true, personalizable: true, personalizationLabel: "Names (one per glass)",
    description: "Set of four personalised crystal-trim glasses — perfect for bridal parties." },
  { name: "Birthday Name Plate", categoryId: "cat-gifts", price: 5500, personalizable: true, personalizationLabel: "Name & age",
    description: "A sparkling standing name plate — a keepsake for birthdays and celebrations." },
  { name: "Custom Crystal Canvas", categoryId: "cat-canvas", price: 7500, featured: true,
    description: "Your design, quote or name created in crystals on canvas board.",
    options: [{ name: "Size", values: ["8 × 10 in", "12 × 16 in", "16 × 20 in"] }] },
];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const defaultProducts: Product[] = seedProducts.map((p, i) => ({
  id: `p-${slugify(p.name)}`,
  slug: slugify(p.name),
  images: [],
  options: [],
  personalizable: false,
  featured: false,
  isNew: false,
  inStock: true,
  visible: true,
  compareAtPrice: null,
  sortOrder: i + 1,
  createdAt: new Date(Date.UTC(2026, 10, 1, 0, i)).toISOString(),
  sample: true,
  ...p,
}));

export const defaultFaqs: Faq[] = [
  { q: "How do I place an order?", a: "Add the pieces you love to your bag and tap \"Order on WhatsApp\". Your order details are sent to us automatically, and we'll confirm the price, delivery and payment with you." },
  { q: "Can I personalise a product?", a: "Yes! Many products have a personalisation box for names or initials. For anything fully custom, use our Custom Order form and share your idea." },
  { q: "How long does a custom order take?", a: "Most custom pieces take 5–10 working days, depending on the design. We'll confirm the timeline before we start." },
  { q: "How can I pay?", a: "We accept bank transfer. Custom orders need an advance payment before we begin. Details are shared on WhatsApp when your order is confirmed." },
  { q: "Do you deliver island-wide?", a: "Yes, we deliver anywhere in Sri Lanka. Delivery charges depend on your location." },
  { q: "Will the stones fall off?", a: "We use strong, long-lasting adhesive and set every stone by hand. Avoid soaking or dishwashers and your piece will keep sparkling for years." },
].map((f, i) => ({ id: `faq-${i + 1}`, question: f.q, answer: f.a, sortOrder: i + 1 }));

export const defaultReviews: Review[] = [
  { name: "Sample review", text: "Replace this with a real customer review from the admin portal → Reviews.", rating: 5, product: "Signature Rhinestone Tumbler" },
  { name: "Sample review", text: "Your happy customers' words will appear here. Add them from the admin portal.", rating: 5, product: "Rose Gold Crystal Phone Case" },
  { name: "Sample review", text: "Tip: screenshots of Instagram DMs make great reviews — just type them in.", rating: 5, product: "Bride Squad Glass Set" },
].map((r, i) => ({ ...r, id: `rev-${i + 1}`, visible: true, sortOrder: i + 1, createdAt: new Date(Date.UTC(2026, 10, 1)).toISOString(), sample: true }));
