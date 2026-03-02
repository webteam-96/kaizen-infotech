// {PROJECTS_DATA} — Portfolio projects for Kaizen Infotech Solutions
import type { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'proj-001',
    slug: 'rotary-zones',
    title: 'Rotary Zones 4, 5, 6 and 7',
    client: 'Rotary International - India',
    category: 'Global Community',
    year: '2023',
    description:
      'A comprehensive ecosystem supporting 4500 Rotary Clubs and over 180000 Rotarians across India. The platform streamlines club and district management, member engagement, and digital communication at scale.',
    challenge:
      'Managing operations across multiple zones and districts required a unified system. The organization faced challenges with high adoption across diverse geographies, lack of centralized club and district management tools, and the need for scalable systems with future enhancements.',
    solution:
      'We developed a centralized web and mobile platform with club and district management tools, member directories and engagement modules, event and communication management capabilities, and over 1000 club and district websites. The platform supports expansion-ready architecture for membership dues and event management.',
    result:
      'The platform achieved widespread adoption across India with improved operational efficiency and centralized governance and reporting. Rotary Zones 4-7 became recognized as the world\'s largest provider of Rotary club websites.',
    image: '/images/projects/rotary-zones.png',
    gallery: [],
    technologies: ['ASP.NET', 'SQL Server', 'Android', 'iOS', 'APIs'],
    featured: true,
  },
  {
    id: 'proj-002',
    slug: 'mbpt-eseva',
    title: 'MbPT eSeva',
    client: 'Mumbai Port Trust',
    category: 'Government',
    year: '2022',
    description:
      'An integrated platform for grievance redressal, pension management for 28000 employees, and real-time vessel tracking, improving transparency and operational efficiency.',
    challenge:
      'Mumbai Port Trust operated with manual grievance handling, complex pension administration, no real-time visibility into vessel movement, and disconnected internal service systems.',
    solution:
      'We built a unified digital platform combining an online grievance redressal system, pension management for 28000 employees, real-time vessel movement tracking, integrated service modules, and centralized dashboards with reporting.',
    result:
      'The platform delivered faster grievance resolution, improved transparency and accountability, streamlined employee service management, and enhanced port operational efficiency.',
    image: '/images/projects/mbpt-eseva.png',
    gallery: [],
    technologies: ['ASP.NET', 'SQL Server', 'APIs', 'Real-time Tracking'],
    featured: true,
  },
  {
    id: 'proj-003',
    slug: 'mrpl-connect',
    title: 'MRPL Connect',
    client: 'MRPL',
    category: 'Enterprise',
    year: '2023',
    description:
      'A secure internal platform enabling QR code payments, centralized communication, role-based access, and employee directory management.',
    challenge:
      'The organization struggled with manual reimbursement workflows, fragmented internal communication, limited role-based access control, and no centralized employee information system.',
    solution:
      'We developed a secure enterprise platform with QR code payments for insurance, mediclaim, and fuel allowances, centralized employee communication, role-based module access, and a detailed employee directory.',
    result:
      'The platform eliminated reimbursement delays, improved internal coordination, secured access to employee data, and delivered better operational efficiency across the organization.',
    image: '/images/projects/mrpl-connect.png',
    gallery: [],
    technologies: ['ASP.NET', 'QR Systems', 'SQL Server', 'APIs'],
    featured: false,
  },
  {
    id: 'proj-004',
    slug: 'aaykar-kutumb',
    title: 'Aaykar Kutumb',
    client: 'Income Tax Department',
    category: 'Government',
    year: '2022',
    description:
      'A searchable and scalable digital handbook managing contact data for thousands of IT department staff, replacing manual and fragmented systems.',
    challenge:
      'The department relied on physical and fragmented handbooks, had difficulty locating officer information quickly, and faced limited scalability with existing paper-based systems.',
    solution:
      'We delivered a fully digitized administrative handbook with advanced officer search functionality, contact management for 2000+ staff members, and an expansion-ready architecture for future growth.',
    result:
      'The platform enabled faster access to information, improved administrative efficiency, and reduced dependency on physical documents across the Income Tax Department.',
    image: '/images/projects/aaykar-kutumb.png',
    gallery: [],
    technologies: ['ASP.NET', 'SQL Server', 'Search Systems'],
    featured: false,
  },
  {
    id: 'proj-005',
    slug: 'jito-world',
    title: 'JITO World',
    client: 'JITO',
    category: 'Global Community',
    year: '2023',
    description:
      'A worldwide digital platform connecting over 5 lakh members, streamlining communication, events, and organizational workflows.',
    challenge:
      'The organization faced challenges managing communication at a global scale, had low visibility into engagement metrics, and relied on manual coordination of events across regions.',
    solution:
      'We built a unified web and mobile platform with global member connectivity, event and news management, centralized information sharing, and automated workflows to improve member participation.',
    result:
      'The platform improved member engagement, streamlined operations across geographies, and strengthened global connectivity for the business community.',
    image: '/images/projects/jito-world.png',
    gallery: [],
    technologies: ['ASP.NET', 'Android', 'iOS', 'SQL Server', 'APIs'],
    featured: false,
  },
  {
    id: 'proj-006',
    slug: 'orion-gametes',
    title: 'Orion Gametes',
    client: 'Orion Gametes (UK)',
    category: 'Healthcare',
    year: '2024',
    description:
      'A secure and user-friendly marketplace enabling donor discovery with verified data, filters, and profile management for a UK-based fertility clinic.',
    challenge:
      'The clinic faced a complex donor selection process, needed verified and trustworthy donor data, and required user-friendly profile management for both donors and clients.',
    solution:
      'We developed a secure marketplace platform with search, sort, and filter capabilities for donor profiles, verified donor information, user profile management, and a secure browsing experience.',
    result:
      'The platform simplified the donor selection process, improved accessibility for clients, and increased trust and transparency in the donor matching process.',
    image: '/images/projects/orion-gametes.png',
    gallery: [],
    technologies: ['ASP.NET', 'JavaScript', 'SQL Server', 'Secure Hosting'],
    featured: false,
  },
  {
    id: 'proj-007',
    slug: 'yatri-mitra',
    title: 'Yatri Mitra',
    client: 'Yatri Mitra',
    category: 'Mobility',
    year: '2023',
    description:
      'A fair and commission-free ride platform offering meter-based pricing with direct payments to drivers, built as an alternative to aggregator models.',
    challenge:
      'The mobility sector faced fare transparency issues with existing aggregator platforms, high commission models that reduced driver earnings, and low trust in dynamic pricing among commuters.',
    solution:
      'We built a commission-free ride platform with meter-based fare calculation, direct payments to drivers without surcharges, and a driver and commuter friendly interface design.',
    result:
      'The platform improved trust and transparency in ride pricing, delivered better earnings for drivers, and provided fair pricing for commuters across the city.',
    image: '/images/projects/yatri-mitra.png',
    gallery: [],
    technologies: ['Android', 'iOS', 'GPS', 'Payment Gateways', 'APIs'],
    featured: false,
  },
  {
    id: 'proj-008',
    slug: 'arovia',
    title: 'Arovia',
    client: 'Arovia Clinics',
    category: 'Healthcare',
    year: '2024',
    description:
      'A healthcare solution enabling online appointments, digital patient records, secure billing, and WhatsApp reminders across devices.',
    challenge:
      'The clinic needed to digitize healthcare workflows, reduce administrative overhead from manual record-keeping, and improve the overall patient care experience across multiple locations.',
    solution:
      'We developed a clinic management system with online appointment scheduling, digital patient records and prescriptions, secure billing with encrypted payments, role-based access for doctors and staff, WhatsApp appointment reminders, and multi-device accessibility.',
    result:
      'The platform improved the patient experience significantly, reduced administrative workload for clinic staff, and delivered better overall clinic efficiency across all locations.',
    image: '/images/projects/arovia.png',
    gallery: [],
    technologies: ['ASP.NET', 'WhatsApp API', 'Payment Gateways', 'SQL Server'],
    featured: false,
  },
  {
    id: 'proj-009',
    slug: 'zfunds',
    title: 'Zfunds',
    client: 'Zfunds Foundation',
    category: 'Social Impact',
    year: '2023',
    description:
      'A centralized portal connecting NGOs and social organizations with people seeking education and medical support.',
    challenge:
      'Beneficiaries lacked centralized access to support schemes, and there was difficulty connecting NGOs with people who needed financial support for education and medical needs.',
    solution:
      'We built a centralized portal with NGO and organization listings, access to schemes, grants, loans, and donations, and easy navigation with powerful search functionality.',
    result:
      'The platform improved access to social support for beneficiaries and provided better visibility for NGOs and their programs.',
    image: '/images/projects/zfunds.png',
    gallery: [],
    technologies: ['ASP.NET', 'SQL Server', 'Search Systems'],
    featured: false,
  },
  {
    id: 'proj-010',
    slug: 'agni-foundation',
    title: 'Agni Foundation',
    client: 'Agni Foundation',
    category: 'Global Community',
    year: '2024',
    description:
      'A web and mobile platform supporting global connectivity, member reports, event engagement, and admin workflows.',
    challenge:
      'The foundation needed a digital platform to connect members globally, streamline administrative operations, and improve visibility into participation and organizational growth.',
    solution:
      'We delivered a mobile app and website with a global member directory, community updates and announcements, role-based reports and analytics, events calendar and engagement tools, and admin dashboards with automated workflows.',
    result:
      'The platform improved member connectivity across the globe, delivered better visibility into participation and growth metrics, and streamlined administrative processes significantly.',
    image: '/images/projects/agni-foundation.png',
    gallery: [],
    technologies: ['ASP.NET', 'Android', 'iOS', 'SQL Server', 'APIs'],
    featured: false,
  },
];

export const projectCategories = [
  'All',
  'Government',
  'Enterprise',
  'Healthcare',
  'Mobility',
  'Social Impact',
  'Global Community',
] as const;

export type ProjectCategory = (typeof projectCategories)[number];
