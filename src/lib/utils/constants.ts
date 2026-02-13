export const SITE_CONFIG = {
  name: 'Kaizen Infotech Solutions',
  tagline: 'Custom Software and Digital Solutions That Drive Business Efficiency',
  url: 'https://kaizeninfotech.com',
  email: 'info@kaizeninfotech.com',
  phone: '+91 98200 00000',
  address: 'Mumbai, Maharashtra, India',
};

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Work', href: '/work' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
] as const;
