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
      { label: 'Custom Software', href: '/services/custom-software-development' },
      { label: 'Mobile Apps', href: '/services/mobile-app-development' },
      { label: 'Cloud & DevOps', href: '/services/cloud-devops-solutions' },
      { label: 'AI & ML', href: '/services/ai-machine-learning' },
      { label: 'UI/UX Design', href: '/services/ui-ux-design-strategy' },
      { label: 'Consulting', href: '/services/digital-transformation-consulting' },
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
    platform: 'Twitter',
    href: 'https://twitter.com/kaizeninfotech',
    icon: 'Twitter',
  },
  {
    platform: 'GitHub',
    href: 'https://github.com/kaizen-infotech',
    icon: 'Github',
  },
  {
    platform: 'Instagram',
    href: 'https://instagram.com/kaizeninfotech',
    icon: 'Instagram',
  },
];
