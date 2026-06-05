export const SITE_CONFIG = {
  name: 'Kaizen Infotech Solutions',
  tagline: 'Custom Software & Digital Solutions That Drive Business Efficiency',
  url: 'https://kaizeninfotech.com',
  email: 'info@kaizeninfotech.com',
  contactEmail: 'connect@kaizeninfotech.com',
  phone: '+91 99201 30855',
  whatsapp: '+91 99201 30855',
  address:
    'Centrum Business Square, A 406, Road No. 16, Nehru Nagar, Wagle Industrial Estate, Thane West, Thane, Maharashtra 400604',
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
