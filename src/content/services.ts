// {SERVICES_DATA} — Service offerings for Kaizen Infotech Solutions
import type { Service } from '@/types';

export const services: Service[] = [
  {
    id: 'svc-001',
    slug: 'custom-software-development',
    title: 'Custom Software Development',
    description:
      'Tailor-made software solutions designed around your business processes to improve efficiency, visibility, and control.',
    longDescription:
      'Our custom software development practice takes a business-first approach to engineering. We begin with deep discovery sessions to understand your domain, map out user workflows, and define success metrics. Our teams then design scalable and secure system architectures that evolve alongside your business. Whether you need enterprise web applications with admin dashboards, business process automation systems, custom ERP and internal management platforms, dashboards and MIS reporting systems, or API development with third-party integrations — we deliver production-grade software backed by clean coding practices, strong testing, and performance optimization.',
    icon: 'Code',
    features: [
      'Enterprise web applications with admin dashboards',
      'Business process automation systems',
      'Custom ERP and internal management platforms',
      'Dashboards and MIS reporting systems',
      'API development and third-party integrations',
    ],
    technologies: ['ASP.NET', 'JavaScript', 'SQL Server', 'MySQL', 'APIs'],
    relatedProjects: ['proj-001', 'proj-002', 'proj-004'],
  },
  {
    id: 'svc-002',
    slug: 'mobile-app-development',
    title: 'Mobile App Development',
    description:
      'High-performance Android and iOS applications that improve accessibility, user engagement, and real-time communication.',
    longDescription:
      'We deliver end-to-end mobile app development services for Android and iOS platforms. Our mobile applications help organizations improve accessibility, engagement, and real-time communication. Each app is built with strong performance, security, and seamless backend integration. Our services include Android app development, iOS app development, member and customer engagement apps, enterprise mobility and field force apps, and push notification systems with in-app communication.',
    icon: 'Smartphone',
    features: [
      'Android app development',
      'iOS app development',
      'Member and customer engagement apps',
      'Enterprise mobility and field force apps',
      'Push notifications and in-app communication',
    ],
    technologies: ['Android', 'iOS', 'APIs', 'Push Notifications'],
    relatedProjects: ['proj-001', 'proj-005', 'proj-010'],
  },
  {
    id: 'svc-003',
    slug: 'event-registration-management',
    title: 'Event Registration and Management Systems',
    description:
      'Complete digital solutions for event registrations, secure payments, QR-based event check-in, attendance tracking, and real-time reporting.',
    longDescription:
      'We provide complete digital solutions for managing events of all sizes, from registrations to on-ground execution. Our event management systems include online event registrations and secure payment processing, QR-based event check-in for faster entry, attendance tracking and real-time reporting dashboards, and automated email and WhatsApp communication. Each system is designed to handle scale, ensure data security, and provide organizers with full visibility into event operations.',
    icon: 'Calendar',
    features: [
      'Online event registrations and secure payments',
      'QR-based event check-in for faster entry',
      'Attendance tracking and real-time reporting',
      'Automated email and WhatsApp communication',
      'Scalable architecture for events of all sizes',
    ],
    technologies: ['ASP.NET', 'QR Systems', 'Payment Gateways', 'WhatsApp API'],
    relatedProjects: ['proj-001', 'proj-003'],
  },
  {
    id: 'svc-004',
    slug: 'enterprise-web-portals',
    title: 'Enterprise Web Portals and Websites',
    description:
      'Secure and scalable websites and portals that act as powerful digital touchpoints for organizations, members, and stakeholders.',
    longDescription:
      'We develop secure, scalable, and professional websites and portals that serve as powerful digital touchpoints for organizations. Our web solutions include responsive corporate and institutional websites, member portals with role-based access control, content management and publishing platforms, integration with existing enterprise systems, and SEO-optimized architecture for better discoverability. Each portal is designed with security, performance, and long-term maintainability in mind.',
    icon: 'Globe',
    features: [
      'Responsive corporate and institutional websites',
      'Member portals with role-based access',
      'Content management and publishing platforms',
      'Integration with existing enterprise systems',
      'SEO-optimized architecture',
    ],
    technologies: ['HTML', 'CSS', 'JavaScript', 'ASP.NET', 'SQL Server'],
    relatedProjects: ['proj-001', 'proj-005'],
  },
  {
    id: 'svc-005',
    slug: 'digital-marketing-services',
    title: 'Digital Marketing Services',
    description:
      'SEO, social media marketing, content, and performance campaigns to improve online visibility, brand credibility, and lead generation.',
    longDescription:
      'We provide result-oriented digital marketing services designed to improve online visibility, build brand credibility, and generate qualified leads. Our strategies are performance-driven and aligned with clear business objectives. Our services include search engine optimization, social media marketing and management, Google Ads and Meta Ads campaigns, content marketing and branding, and website optimization with conversion tracking. We focus on lead quality and ROI with transparent reporting.',
    icon: 'TrendingUp',
    features: [
      'Search engine optimization (SEO)',
      'Social media marketing and management',
      'Google Ads and Meta Ads campaigns',
      'Content marketing and branding',
      'Website optimization and conversion tracking',
    ],
    technologies: ['Google Ads', 'Meta Ads', 'SEO Tools', 'Analytics'],
    relatedProjects: [],
  },
];
