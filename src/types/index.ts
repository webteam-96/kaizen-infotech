// Core TypeScript types for Kaizen Infotech Solutions

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  icon: string;
  features: string[];
  technologies: string[];
  relatedProjects: string[];
  faqs?: { question: string; answer: string }[];
}

export interface ProjectMetric {
  /** Display value, pre-formatted — e.g. "4,500+", "1.8 Lakh", "$10M". */
  value: string;
  label: string;
}

export interface ProjectFeature {
  /** lucide-react icon name, resolved at render time. */
  icon: string;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  client: string;
  category: string;
  year: string;
  description: string;
  challenge: string;
  solution: string;
  result: string;
  image: string;
  gallery: string[];
  technologies: string[];
  testimonial?: Testimonial;
  featured: boolean;
  // --- Rich case-study fields (optional, sourced from the company brochure) ---
  /** Short punchy line shown under the title in the hero. */
  tagline?: string;
  /** Where the solution is deployed — e.g. "India · Sri Lanka · Nepal". */
  location?: string;
  /** Longer narrative intro for the overview section. */
  overview?: string;
  /** Headline numbers shown in the animated metrics band. */
  metrics?: ProjectMetric[];
  /** Capability cards rendered with icons and micro-animations. */
  features?: ProjectFeature[];
  /** Plain-language benefits, shown as an animated checklist. */
  benefits?: string[];
  /** Measurable outcomes, shown as an animated checklist. */
  impact?: string[];
  /** Theme key driving the generated cover art (defaults to category). */
  coverArt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

export interface Testimonial {
  id: string;
  quote: string;
  clientName: string;
  clientRole: string;
  clientCompany: string;
  clientImage?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: TeamMember;
  category: string;
  publishedAt: string;
  readingTime: string;
  image: string;
  tags: string[];
}

// ---------------------------------------------------------------------------
// Admin-managed blogs (localStorage-backed, edited through the /admin panel)
// ---------------------------------------------------------------------------

/** published = live & public · hidden = kept but not public · draft = work-in-progress. */
export type BlogStatus = 'published' | 'hidden' | 'draft';

export interface BlogImage {
  /** data-URL (uploaded), absolute URL, or /public path. */
  url: string;
  alt?: string;
  caption?: string;
}

export interface ManagedBlog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Sanitised rich HTML produced by the admin editor (body, lists, tables, images). */
  bodyHtml: string;
  category: string;
  tags: string[];
  authorName: string;
  authorRole: string;
  authorBio: string;
  readingTime: string;
  /** Free-text display date, e.g. "29 Jun 2026" or "Coming soon". */
  publishedAt: string;
  /** Hero/cover image. When absent the generated <BlogCover> SVG is used. */
  mainImage?: BlogImage;
  gallery: BlogImage[];
  status: BlogStatus;
  seo?: { metaTitle?: string; metaDescription?: string };
  /** ISO timestamps, managed automatically. */
  createdAt: string;
  updatedAt: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export interface Stat {
  number: number;
  suffix: string;
  label: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Milestone {
  year: string;
  title: string;
  description: string;
}

export interface Value {
  title: string;
  description: string;
  icon: string;
}

export interface Career {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
}
