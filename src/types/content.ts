// Content-specific types and form data interfaces

export type {
  Service,
  Project,
  TeamMember,
  Testimonial,
  BlogPost,
  ProcessStep,
  Stat,
  NavLink,
  Milestone,
  Value,
  Career,
} from './index';

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  service?: string;
  budget?: string;
  message: string;
}

export interface NewsletterFormData {
  email: string;
}

export interface FooterLinkGroup {
  title: string;
  links: {
    label: string;
    href: string;
  }[];
}

export interface SocialLink {
  platform: string;
  href: string;
  icon: string;
}
