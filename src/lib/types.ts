export type ProductOption = {
  name: string; // e.g. "Colour"
  values: string[]; // e.g. ["Rose gold", "Silver"]
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  price: number; // LKR
  compareAtPrice?: number | null; // original price, shown struck-through
  description: string;
  images: string[];
  options: ProductOption[];
  personalizable: boolean; // shows a "name / text to add" field
  personalizationLabel?: string;
  featured: boolean;
  isNew: boolean;
  inStock: boolean;
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  sample?: boolean;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  image?: string | null;
  sortOrder: number;
};

export type GalleryItem = {
  id: string;
  image: string;
  caption: string;
  sortOrder: number;
  createdAt: string;
};

export type Review = {
  id: string;
  name: string;
  text: string;
  rating: number;
  product?: string;
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  sample?: boolean;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
};

export type RequestStatus = "new" | "in_progress" | "quoted" | "completed" | "archived";

export type CustomRequest = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  categoryId?: string;
  description: string;
  budget?: string;
  neededBy?: string;
  images: string[];
  status: RequestStatus;
  adminNotes?: string;
  createdAt: string;
};

export type PolicyKey = "shipping" | "returns" | "privacy" | "terms";

export type SiteSettings = {
  id: "site";
  whatsappNumber: string; // digits only, with country code, e.g. 94771234567
  instagramUrl: string;
  tiktokUrl: string;
  facebookUrl: string;
  email: string;
  location: string;
  promoEnabled: boolean;
  promoText: string;
  heroEyebrow: string;
  heroScript: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string | null;
  aboutTitle: string;
  aboutText: string;
  aboutImage?: string | null;
  stats: { value: string; label: string }[];
  policies: Record<PolicyKey, string>;
};

/** One day's visitor count for the public site. `id` is the date in Sri Lanka time, e.g. "2026-11-17". */
export type DayVisits = {
  id: string;
  /** Pages opened that day. */
  views: number;
  /** Anonymous codes, one per person seen that day — its length is the day's visitor count. */
  seen: string[];
  /** Views per page address. */
  pages: Record<string, number>;
};

export type Collections = {
  products: Product;
  categories: Category;
  gallery: GalleryItem;
  reviews: Review;
  faqs: Faq;
  requests: CustomRequest;
  settings: SiteSettings;
  visits: DayVisits;
};

export type CollectionName = keyof Collections;
