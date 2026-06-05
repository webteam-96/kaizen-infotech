// {SERVICES_DATA} — Service offerings for Kaizen Infotech Solutions
import type { Service } from '@/types';

export const services: Service[] = [
  {
    id: 'svc-001',
    slug: 'custom-software-development',
    title: 'Custom Software Development',
    description:
      'Tailor-made enterprise software designed around your unique business processes to improve efficiency, visibility, and operational control.',
    longDescription:
      'Our custom software development practice is built on a business-first philosophy. We never apply off-the-shelf thinking to your unique challenges. Every engagement begins with in-depth discovery sessions where we learn your domain, map user workflows, identify bottlenecks, and define success metrics together. From there, our architects design scalable, secure systems that will grow alongside your organisation. Our engineers build with clean coding standards, comprehensive testing protocols, and performance benchmarks baked in from day one - not as an afterthought.',
    icon: 'Code',
    features: [
      'Enterprise web applications with admin dashboards',
      'Business process automation systems',
      'Custom ERP and internal management platforms',
      'Dashboards and MIS reporting systems',
      'API development and third-party integrations',
      'Workflow automation and notification systems',
    ],
    technologies: ['ASP.NET', 'JavaScript', 'SQL Server', 'MySQL', 'REST APIs', 'Payment Gateways'],
    relatedProjects: ['proj-001', 'proj-002', 'proj-004'],
    faqs: [
      {
        question: 'How long does custom software development take?',
        answer:
          'Project timelines depend on scope and complexity. A focused automation module may take 6–8 weeks, while a comprehensive enterprise platform typically requires 4–8 months. We provide detailed timelines during discovery.',
      },
      {
        question: 'Do you sign NDAs?',
        answer:
          'Yes. We sign Non-Disclosure Agreements before any project discussions and handle client data with strict confidentiality protocols.',
      },
    ],
  },
  {
    id: 'svc-002',
    slug: 'mobile-app-development',
    title: 'Mobile App Development',
    description:
      'High-performance Android and iOS applications that improve accessibility, user engagement, and real-time communication for enterprises and organisations.',
    longDescription:
      'We build end-to-end mobile applications for Android and iOS that help organisations stay connected with their members, customers, and field teams. From initial UX wireframes through to Play Store and App Store deployment, we manage the full development lifecycle. Every app is engineered for performance, security, and seamless integration with your existing backend systems. We focus on smooth, intuitive user experiences that drive genuine adoption - not just downloads.',
    icon: 'Smartphone',
    features: [
      'Native Android and iOS app development',
      'Member and customer engagement apps',
      'Enterprise mobility and field force management apps',
      'Push notification and in-app communication systems',
      'Offline capability and sync for low-connectivity environments',
      'App Store and Play Store deployment and management',
    ],
    technologies: ['Android (Java/Kotlin)', 'iOS (Swift)', 'REST APIs', 'Push Notifications', 'GPS'],
    relatedProjects: ['proj-001', 'proj-005', 'proj-010'],
    faqs: [
      {
        question: 'Do you build both Android and iOS?',
        answer:
          'Yes. We develop for both platforms, either simultaneously or in a phased approach depending on your budget and user base.',
      },
      {
        question: 'Can you integrate the app with our existing software?',
        answer:
          'Yes. API integration with existing enterprise systems is a core part of our mobile development process.',
      },
    ],
  },
  {
    id: 'svc-003',
    slug: 'event-registration-management',
    title: 'Event Registration & Management Systems',
    description:
      'Complete digital solutions for managing events of any size - from online registrations and secure payments to QR-based check-in and real-time reporting.',
    longDescription:
      'We have built event management platforms for some of India\'s largest community organisations, handling thousands of registrations and on-ground check-ins simultaneously. Our systems are designed to handle scale, stress, and the unpredictable nature of large events. Every solution is custom-built to match your event\'s unique requirements - single conference or multi-day annual convention, ticketed or free, with complex delegate categories or simple open registration.',
    icon: 'Calendar',
    features: [
      'Online event registration portals with dynamic forms',
      'Secure online payment processing with multiple gateways',
      'QR code generation and mobile-based check-in systems',
      'Real-time attendance tracking and live dashboards',
      'Automated confirmation, reminder, and communication via email and WhatsApp',
      'Post-event reporting and data export',
      'Multi-event and multi-category management',
    ],
    technologies: ['ASP.NET', 'QR Code Systems', 'Payment Gateways', 'WhatsApp API', 'SQL Server'],
    relatedProjects: ['proj-001', 'proj-003'],
    faqs: [
      {
        question: 'Can your system handle thousands of simultaneous registrations?',
        answer:
          'Yes. Our event platforms are load-tested and architected for high-concurrency scenarios. We have managed large-scale events with thousands of simultaneous users.',
      },
      {
        question: 'Do you support WhatsApp confirmations?',
        answer:
          'Yes. We integrate with the official WhatsApp Business API to send automated registration confirmations, event reminders, and post-event communications.',
      },
    ],
  },
  {
    id: 'svc-004',
    slug: 'enterprise-web-portals',
    title: 'Enterprise Web Portals & Websites',
    description:
      'Secure and scalable websites and portals that serve as powerful digital touchpoints for your organisation, members, and stakeholders.',
    longDescription:
      'A great enterprise portal is more than a website - it is the digital front door of your organisation. We build portals that are secure, fast, accessible, and genuinely easy to manage by your internal team without constant developer involvement. From government institutional websites serving lakhs of citizens to private member portals with complex access hierarchies, we deliver web platforms that are built to last and built to be maintained.',
    icon: 'Globe',
    features: [
      'Responsive corporate and institutional websites',
      'Member portals with role-based access control',
      'Content management systems for non-technical administrators',
      'Integration with existing enterprise backends and databases',
      'SEO-optimised architecture for organic search visibility',
      'Accessibility compliance (WCAG) for government and public-facing sites',
      'Security hardening - SSL, CSRF protection, input validation',
    ],
    technologies: ['ASP.NET', 'HTML5', 'CSS3', 'JavaScript', 'SQL Server', 'CMS Integration'],
    relatedProjects: ['proj-001', 'proj-005'],
    faqs: [
      {
        question: 'Will my team be able to update the website without developers?',
        answer:
          'Yes. We build intuitive CMS interfaces that allow your team to publish content, update pages, and manage media without any technical knowledge.',
      },
      {
        question: 'Is the portal mobile-responsive?',
        answer:
          'Absolutely. All portals we develop are fully responsive and tested across devices, screen sizes, and browsers.',
      },
    ],
  },
  {
    id: 'svc-005',
    slug: 'digital-marketing-services',
    title: 'Digital Marketing Services',
    description:
      'Result-oriented digital marketing services to improve online visibility, build brand credibility, and generate qualified leads aligned with your business goals.',
    longDescription:
      'Our digital marketing practice is performance-driven and strategy-led. We do not just run campaigns - we build integrated digital marketing systems that attract the right audience, nurture interest, and convert prospects into clients. All campaigns are tracked, measured, and continuously optimised. We provide transparent monthly reporting with clear attribution - so you always know exactly which channels are delivering results.',
    icon: 'TrendingUp',
    features: [
      'Search Engine Optimisation (SEO) - on-page, off-page, and technical',
      'Google Ads (Search, Display, YouTube) campaign management',
      'Meta Ads (Facebook and Instagram) performance campaigns',
      'Social media marketing and community management',
      'Content marketing and blog strategy',
      'Website conversion rate optimisation (CRO)',
      'Monthly performance reporting with ROI analysis',
    ],
    technologies: ['Google Ads', 'Meta Ads', 'SEO Tools', 'Analytics'],
    relatedProjects: [],
    faqs: [
      {
        question: 'How quickly will I see results from SEO?',
        answer:
          'Meaningful keyword ranking improvements typically appear within 3–6 months. Paid campaigns can generate leads within days of launch.',
      },
      {
        question: 'Do you offer performance-based pricing?',
        answer:
          'Our standard engagement is retainer-based with transparent monthly reporting. We can discuss performance milestones as part of the contract for qualified campaigns.',
      },
    ],
  },
];
