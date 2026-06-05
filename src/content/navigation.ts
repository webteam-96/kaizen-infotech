// {NAVIGATION_DATA} — Navigation configuration for Kaizen Infotech Solutions
import type { NavLink } from '@/types';
import type { FooterLinkGroup, SocialLink } from '@/types/content';

// Main navigation links (header)
export const mainNavLinks: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Work', href: '/work' },
  { label: 'Blog', href: '/blog' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
];

// Footer link groups organized by column
export const footerLinkGroups: FooterLinkGroup[] = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Work', href: '/work' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Custom Software Development', href: '/services/custom-software-development' },
      { label: 'Mobile App Development', href: '/services/mobile-app-development' },
      { label: 'Event Management Systems', href: '/services/event-registration-management' },
      { label: 'Enterprise Web Portals', href: '/services/enterprise-web-portals' },
      { label: 'Digital Marketing', href: '/services/digital-marketing-services' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Case Studies', href: '/work' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

// Social media links
export const socialLinks: SocialLink[] = [
  {
    platform: 'LinkedIn',
    href: 'https://linkedin.com/company/kaizen-infotech',
    icon: 'Linkedin',
  },
  {
    platform: 'Instagram',
    href: 'https://instagram.com/kaizeninfotech',
    icon: 'Instagram',
  },
  {
    platform: 'Facebook',
    href: 'https://facebook.com/kaizeninfotech',
    icon: 'Facebook',
  },
  {
    platform: 'Twitter',
    href: 'https://twitter.com/kaizeninfotech',
    icon: 'Twitter',
  },
];
