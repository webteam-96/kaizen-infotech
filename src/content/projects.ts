// {PROJECTS_DATA} — Portfolio projects for Kaizen Infotech Solutions
// Rich case-study content sourced from the Kaizen Infotech Solutions company brochure.
import type { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'proj-001',
    slug: 'rotary-zones',
    title: 'Rotary Zones 4, 5, 6 and 7',
    client: 'Rotary International — India',
    category: 'Global Community',
    year: '2023',
    tagline:
      'Digital products and services that enhance visibility, efficiency, and credibility for thousands of Rotary clubs.',
    location: 'India · Sri Lanka · Nepal',
    description:
      'A comprehensive digital ecosystem supporting over 4,500 Rotary Clubs and 1.8 lakh Rotarians across India, Sri Lanka, and Nepal. The platform streamlines club and district management, member engagement, and digital communication at scale.',
    overview:
      'Rotary Zones 4, 5, 6 & 7 encompass over 4,500 clubs and 1.8 lakh Rotarians across India, Sri Lanka, and Nepal. Managing such a massive network of clubs, community initiatives, and events demanded standardized communication, accurate membership and contribution records, and full transparency in governance. Kaizen built the central digital hub that now connects every Rotarian on one integrated ecosystem.',
    challenge:
      'Managing operations across thousands of clubs and districts required a single, unified system. Rotary needed standardized communication across diverse geographies, accurate records for membership, events, and contributions, public visibility for community service projects, and consistent, transparent reporting and governance — all previously handled by multiple manual systems.',
    solution:
      'We delivered a central web portal and mobile app: a searchable digital directory, club and Rotarian finder, zone-level newsletters, digital awards management, official-visit and governance tracking (OCV/GOV), automated attendance, and detailed reports and analytics. A standout module gives every club its own dynamic, SEO-optimized website — over 1,000 club sites — fully synced with the central database, alongside automated e-governance, secure membership-dues collection, and end-to-end event registration.',
    result:
      'Rotary Zones 4-7 now operate on a single integrated digital ecosystem connecting over 1.8 lakh Rotarians seamlessly. Automation slashed manual work across thousands of clubs, SEO-optimized websites elevated each club\'s public image, and real-time analytics enabled data-driven leadership — making it recognized as the world\'s largest provider of Rotary club websites.',
    image: '/images/projects/rotary-zones.png',
    gallery: [],
    metrics: [
      { value: '4,500+', label: 'Clubs Connected' },
      { value: '1.8 Lakh', label: 'Rotarians Engaged' },
      { value: '1,000+', label: 'Club Websites' },
      { value: '4', label: 'Zones Unified' },
    ],
    features: [
      {
        icon: 'Search',
        title: 'Digital Directory',
        description:
          'A searchable, centralized database of every Rotarian, club, and district — locate members, view profiles, and contact clubs in seconds.',
      },
      {
        icon: 'Globe',
        title: 'Integrated Club Websites',
        description:
          'Each club gets a dynamic, professionally branded, SEO-optimized website auto-synced with the central app — news, events, and projects publish themselves.',
      },
      {
        icon: 'ClipboardCheck',
        title: 'Governance Tracking',
        description:
          'Official visits, officer roles, and governance structures (OCV/GOV) are monitored digitally across all clubs and districts.',
      },
      {
        icon: 'Award',
        title: 'Awards Management',
        description:
          'Zonal and district award nominations, winners, and recognition activities are tracked and streamlined end to end.',
      },
      {
        icon: 'CreditCard',
        title: 'Membership Dues Collection',
        description:
          'Secure online dues payments with real-time tracking, instant receipts, automated reminders, and full financial transparency.',
      },
      {
        icon: 'BarChart3',
        title: 'Reports & Analytics',
        description:
          'Automated monthly and annual reports give leadership insight into club performance, engagement, and project impact.',
      },
    ],
    benefits: [
      'Automation and centralized systems cut manual work across thousands of clubs.',
      'SEO-optimized websites and digital tools showcase each club\'s achievements and social impact.',
      'Complete, transparent records of every community project and initiative.',
      'Real-time reports and analytics enable data-driven leadership decisions.',
      'Streamlined communication and online resources boost member engagement.',
      'A unified online presence strengthens Rotary\'s brand reputation worldwide.',
    ],
    impact: [
      'Over 1.8 lakh Rotarians now operate on a single, integrated digital ecosystem.',
      'One data entry publishes automatically to the app, club websites, newsletters, and reports.',
      'Recognized as the world\'s largest provider of Rotary club websites.',
      'Thousands of community projects are showcased to the world as a living digital narrative.',
    ],
    technologies: ['ASP.NET', 'SQL Server', 'Android', 'iOS', 'REST APIs', 'SEO'],
    testimonial: {
      id: 'testimonial-rotary',
      quote:
        'With integrated club websites, automated eGovernance, dues collection, and event management, the RI Zones 4, 5, 6 & 7 App powered by Kaizen Infotech Solutions has redefined how Rotarians connect, collaborate, and showcase their impact to the world.',
      clientName: 'Rotary International',
      clientRole: 'Zones 4, 5, 6 & 7 Leadership',
      clientCompany: 'Rotary International — India',
    },
    featured: true,
  },
  {
    id: 'proj-002',
    slug: 'mbpt-eseva',
    title: 'MbPT eSeva',
    client: 'Mumbai Port Trust',
    category: 'Government',
    year: '2022',
    tagline:
      'Digital citizen and employee services for efficient, transparent port operations.',
    location: 'Mumbai, India',
    description:
      'An integrated platform for citizen grievance redressal, pension management for 28,000 employees, real-time vessel tracking, and pilot management — improving transparency and operational efficiency across Mumbai Port.',
    overview:
      'Mumbai Port Trust required a single digital platform to manage citizen grievances, employee pensions, vessel tracking, and pilot operations efficiently while enhancing transparency. Kaizen replaced disconnected manual systems with one unified e-Seva platform serving both citizens and staff.',
    challenge:
      'Mumbai Port Trust operated with manual grievance handling, complex pension administration for tens of thousands of employees, no real-time visibility into vessel movement, and disconnected internal service systems that slowed every transaction.',
    solution:
      'We built a unified digital platform: an online grievance redressal system, pension management for 28,000 employees with instant notifications, live vessel-movement tracking, digital pilot management with assignment diaries, and instant in-app payment release for brokers and port staff — all accessible on mobile.',
    result:
      'The platform delivered faster grievance resolution, real-time pension access for employees, fully automated pilot operations and payments with fewer errors, and a measurable lift in transparency and accountability across Mumbai Port operations.',
    image: '/images/projects/mbpt-eseva.png',
    gallery: [],
    metrics: [
      { value: '28,000', label: 'Employees Served' },
      { value: 'Live', label: 'Vessel Tracking' },
      { value: '1', label: 'Unified Platform' },
      { value: '24/7', label: 'Mobile Access' },
    ],
    features: [
      {
        icon: 'MessageSquareWarning',
        title: 'Grievance Redressal',
        description:
          'Citizen complaints are handled through one streamlined system with transparent, trackable resolution.',
      },
      {
        icon: 'Users',
        title: 'Employee Pension Support',
        description:
          'Pensions for 28,000 employees are managed digitally with instant notifications and self-service access.',
      },
      {
        icon: 'Ship',
        title: 'Real-Time Vessel Tracking',
        description:
          'Live monitoring of vessel movements and port operations for accurate, up-to-the-minute insight.',
      },
      {
        icon: 'Compass',
        title: 'Pilot Management',
        description:
          'Assign pilots, maintain pilot diaries, and track assignments in line with port rules.',
      },
      {
        icon: 'Wallet',
        title: 'Payment Management',
        description:
          'Brokers and port staff release payments — including advances — instantly through the app.',
      },
      {
        icon: 'Smartphone',
        title: 'Mobile Accessibility',
        description:
          'Employees track pensions, receive notifications, and download reports from any device.',
      },
    ],
    benefits: [
      'Faster grievance resolution and noticeably improved employee services.',
      'Real-time operational insight for port management.',
      'Streamlined financial transactions and pilot assignments.',
      'Greater transparency and accountability for every stakeholder.',
    ],
    impact: [
      'Significant reduction in manual paperwork and processing delays.',
      'Employees access pensions and notifications in real time.',
      'Pilot operations and payments are fully automated, reducing errors.',
      'Improved efficiency and transparency across Mumbai Port operations.',
    ],
    technologies: ['ASP.NET', 'SQL Server', 'REST APIs', 'Real-time Tracking', 'Android', 'iOS'],
    featured: true,
  },
  {
    id: 'proj-003',
    slug: 'mrpl-connect',
    title: 'MRPL Connect & Seva',
    client: 'Mangalore Refinery & Petrochemicals Limited',
    category: 'Enterprise',
    year: '2023',
    tagline:
      'Seamless employee services and secure access management for a national refinery.',
    location: 'Mangalore, India',
    description:
      'A secure enterprise platform enabling QR-code fuel reimbursements with OTP verification, automated insurance claims, centralized communication, and role-based access for MRPL employees.',
    overview:
      'MRPL needed a centralized system to manage employee communications, payments, and insurance services efficiently. Traditional HR processes caused delays in claims, reimbursements, and approvals. Kaizen implemented MRPL Connect & Seva — a robust platform that streamlines employee services with secure, role-based access controls.',
    challenge:
      'The organization struggled with manual reimbursement workflows, fragmented internal communication, limited role-based access control, and HR bottlenecks that delayed claims, reimbursements, and approvals.',
    solution:
      'We developed a secure enterprise platform: fuel reimbursement via QR code with mobile OTP authorization for instant, secure payments, automated insurance-claim management that auto-generates approval letters and escalates delays to HR and hospitals, centralized multi-department communication, role-based module access, and a detailed employee directory.',
    result:
      'The platform eliminated reimbursement and approval delays, secured sensitive employee data behind role-based access, and let employees act independently without HR bottlenecks — delivering faster processing, real-time notifications, and higher employee satisfaction.',
    image: '/images/projects/mrpl-connect.png',
    gallery: [],
    metrics: [
      { value: 'QR + OTP', label: 'Secure Payments' },
      { value: 'Zero', label: 'Claim Delays' },
      { value: 'Role-Based', label: 'Access Control' },
      { value: 'Auto', label: 'Insurance Claims' },
    ],
    features: [
      {
        icon: 'QrCode',
        title: 'QR-Code Fuel Reimbursement',
        description:
          'Entitled employees scan a QR code at fuel stations; mobile OTP verification authorizes instant, secure payment.',
      },
      {
        icon: 'ShieldCheck',
        title: 'Secure Access Control',
        description:
          'Pre-defined, role-tailored module access keeps sensitive employee data protected and compliant.',
      },
      {
        icon: 'FileCheck2',
        title: 'Automated Insurance Claims',
        description:
          'Employees file medical claims directly; the system auto-generates approvals and notifies HR and hospitals on delay.',
      },
      {
        icon: 'Radio',
        title: 'Centralized Communication',
        description:
          'Manage communications efficiently across multiple departments from one place.',
      },
      {
        icon: 'Contact',
        title: 'Employee Directory',
        description:
          'Detailed employee profiles make people and roles easy to find across the organization.',
      },
      {
        icon: 'BellRing',
        title: 'Real-Time Notifications',
        description:
          'Live tracking and alerts keep every financial and HR process moving without manual chasing.',
      },
    ],
    benefits: [
      'Instant, secure petrol reimbursements via QR code and OTP verification.',
      'No delays in claiming medical insurance or other allowances.',
      'Role-based access keeps sensitive employee data secure.',
      'Real-time tracking and notifications for all financial and HR processes.',
      'Reduced administrative workload and fewer errors.',
      'Employees act independently — no HR bottlenecks for reimbursements.',
    ],
    impact: [
      'Faster processing of petrol reimbursements, insurance, and allowances.',
      'Centralized tracking ensures operational efficiency and compliance.',
      'Streamlined approvals and real-time notifications improve satisfaction.',
      'OTP verification enhances security and transparency for fuel payments.',
    ],
    technologies: ['ASP.NET', 'QR Systems', 'OTP Auth', 'SQL Server', 'REST APIs'],
    testimonial: {
      id: 'testimonial-mrpl',
      quote:
        'MRPL Connect and Seva have eliminated delays in approvals and reimbursements, providing employees with a secure, real-time, and hassle-free experience while enhancing administrative efficiency.',
      clientName: 'MRPL',
      clientRole: 'Human Resources Leadership',
      clientCompany: 'Mangalore Refinery & Petrochemicals Limited',
    },
    featured: false,
  },
  {
    id: 'proj-004',
    slug: 'aaykar-kutumb',
    title: 'Aaykar Kutumb',
    client: 'Income Tax Department',
    category: 'Government',
    year: '2022',
    tagline:
      'Digitizing administrative workflows for 50,000+ officers across India.',
    location: 'Pan-India',
    description:
      'A centralized, secure, and searchable digital platform serving as a single source of truth for administrative information and officer data across the Income Tax Department — connecting over 50,000 officers nationwide.',
    overview:
      'The Income Tax Department is one of India\'s largest and most complex government organizations, with over 50,000 officers deployed nationwide. Before digitization, officers relied on printed manuals, circulars, and physical communication — creating information silos, delays, and redundant printing costs. Kaizen built Aaykar Kutumb to serve as a single, smart source of truth for all officer data and administrative information.',
    challenge:
      'With 50,000+ officers nationwide, the department suffered from fragmented information and knowledge silos, slow internal communication, redundant printing and re-distribution costs, and administrative inefficiencies across regional offices.',
    solution:
      'We delivered a centralized digital platform: a comprehensive, searchable officer directory integrating guidelines, policies, circulars, and FAQs; unified employee data management for profiles, postings, and hierarchy; an intelligent search engine that surfaces members, rules, and circulars in seconds; real-time push updates to all officers simultaneously; multi-device access; granular role-based access control; and usage analytics for administrators.',
    result:
      'All 50,000+ officers are now digitally connected through one platform. Information that once took hours to find surfaces in seconds, circulars reach everyone simultaneously, printing and logistics costs fell sharply, and centralized data management keeps officer information accurate and consistent nationwide.',
    image: '/images/projects/aaykar-kutumb.png',
    gallery: [],
    metrics: [
      { value: '50,000+', label: 'Officers Connected' },
      { value: 'Seconds', label: 'To Find Anything' },
      { value: 'Nationwide', label: 'Reach' },
      { value: '1', label: 'Source of Truth' },
    ],
    features: [
      {
        icon: 'BookOpen',
        title: 'Comprehensive Digital Directory',
        description:
          'A structured, searchable library where officer information, guidelines, policies, circulars, and FAQs stay current and secure.',
      },
      {
        icon: 'Database',
        title: 'Employee Data Management',
        description:
          'A unified database for officer profiles, contacts, postings, and hierarchy simplifies HR and admin operations.',
      },
      {
        icon: 'SearchCheck',
        title: 'Smart Search Engine',
        description:
          'An intelligent search lets officers find members, rules, policies, or circulars within seconds.',
      },
      {
        icon: 'RefreshCw',
        title: 'Real-Time Updates',
        description:
          'New circulars and updates push to every officer instantly — no dependency on manual communication.',
      },
      {
        icon: 'Lock',
        title: 'Role-Based Access Control',
        description:
          'Granular permissions ensure only authorized personnel view or modify sensitive content.',
      },
      {
        icon: 'LineChart',
        title: 'Analytics & Insights',
        description:
          'Dashboards track usage and search trends to surface training needs and content gaps proactively.',
      },
    ],
    benefits: [
      'Officers locate data, circulars, and colleagues in seconds.',
      'All 50,000+ officers are digitally connected on one platform.',
      'Every update or policy change is shared in real time, nationwide.',
      'Centralized data management keeps officer information accurate.',
      'Role-based access protects sensitive government data and ensures compliance.',
      'Digitization eliminates printing and distribution costs.',
    ],
    impact: [
      'Officers connect with peers and access data instantly.',
      'Circulars and updates reach all 50,000+ officers simultaneously.',
      'Real-time accuracy improves administrative consistency.',
      'Major savings from reduced printing and logistics.',
    ],
    technologies: ['ASP.NET', 'SQL Server', 'Search Systems', 'Role-Based Access'],
    testimonial: {
      id: 'testimonial-aaykar',
      quote:
        'Aaykar Kutumb has revolutionized internal communication within the Income Tax Department, connecting 50,000 officers on one unified digital platform for smarter, faster, and more transparent governance.',
      clientName: 'Income Tax Department',
      clientRole: 'Administration',
      clientCompany: 'Government of India',
    },
    featured: false,
  },
  {
    id: 'proj-005',
    slug: 'jito-world',
    title: 'JITO World',
    client: 'Jain International Trade Organization',
    category: 'Global Community',
    year: '2023',
    tagline:
      'Connecting 5 lakh members globally for trade, networking, and community engagement.',
    location: 'Global',
    description:
      'A worldwide digital ecosystem uniting over 5 lakh JITO members — entrepreneurs, professionals, and community leaders — across regions, chapters, and specialized wings, streamlining communication, events, and organizational workflows.',
    overview:
      'The Jain International Trade Organization (JITO) unites over 5 lakh members worldwide. Managing a global network of regions, chapters, and specialized wings — Parent, Ladies, and Youth — posed major challenges in communication, engagement, and administration. Kaizen built a robust digital ecosystem to centralize membership, streamline operations, and maintain consistent connectivity across every chapter and region.',
    challenge:
      'Coordinating over 5 lakh members across multiple regions, chapters, and specialized wings created challenges in communication, engagement, and administration, with limited visibility into participation and growth.',
    solution:
      'We built a unified web and mobile platform: a global and regional member directory, chapter and community management, automated newsletters and announcements, event management with registration and reminders, automated greetings for birthdays and milestones, secure digital payments and dues, hierarchical role-based admin control, third-party integrations, and analytics across chapters and regions.',
    result:
      'Over 5 lakh members across regions, chapters, and wings were onboarded successfully. Parent chapters and specialized wings now operate efficiently under a single system, members and administrators communicate in real time with accurate data, and leadership leverages analytics to plan events and expand chapters globally.',
    image: '/images/projects/jito-world.png',
    gallery: [],
    metrics: [
      { value: '5 Lakh+', label: 'Members Connected' },
      { value: 'Global', label: 'Multi-Region Reach' },
      { value: '3', label: 'Specialized Wings' },
      { value: 'Real-Time', label: 'Communication' },
    ],
    features: [
      {
        icon: 'Network',
        title: 'Global & Regional Directory',
        description:
          'A centralized, searchable database with complete profiles across regions, chapters, and specialized wings.',
      },
      {
        icon: 'Building2',
        title: 'Chapter & Community Management',
        description:
          'Manage each chapter\'s core community, track participation, and keep every wing functioning cohesively.',
      },
      {
        icon: 'Mail',
        title: 'Automated Communication',
        description:
          'Send newsletters, announcements, and event invites to all members, regions, or specific chapters — consistent and targeted.',
      },
      {
        icon: 'CalendarDays',
        title: 'Event Management',
        description:
          'Plan chapter-specific or global events, track registrations and attendance, and broadcast upcoming activities.',
      },
      {
        icon: 'Gift',
        title: 'Greetings & Celebrations',
        description:
          'Automatically track and send birthday, anniversary, and milestone greetings to strengthen community bonds.',
      },
      {
        icon: 'PieChart',
        title: 'Analytics & Insights',
        description:
          'Track engagement, event participation, membership growth, and donation trends for data-driven decisions.',
      },
    ],
    benefits: [
      'Unites all members across geographies, chapters, and specialized wings.',
      'Parent chapters, ladies wings, and youth wings managed in one unified system.',
      'Centralized newsletters, announcements, and updates for every chapter.',
      'Automated greetings strengthen personal community connections.',
      'Secure digital payments for subscriptions, donations, and event fees.',
      'Analytics provide actionable intelligence for leadership and chapter admins.',
    ],
    impact: [
      'Over 5 lakh members across regions, chapters, and wings onboarded successfully.',
      'Members, regional heads, and administrators communicate in real time.',
      'Event management, payments, and reporting are automated.',
      'Chapters keep a professional online presence while preserving local identity.',
    ],
    technologies: ['ASP.NET', 'Android', 'iOS', 'SQL Server', 'REST APIs', 'Payment Gateways'],
    testimonial: {
      id: 'testimonial-jito',
      quote:
        'With Kaizen Infotech Solutions, JITO World\'s platform connects over 5 lakh members globally — managing chapters, wings, and communities while enabling seamless communication, engagement, and operational excellence.',
      clientName: 'JITO',
      clientRole: 'Global Leadership',
      clientCompany: 'Jain International Trade Organization',
    },
    featured: false,
  },
  {
    id: 'proj-006',
    slug: 'orion-gametes',
    title: 'Orion Gametes',
    client: 'Orion Gametes (UK)',
    category: 'Healthcare',
    year: '2024',
    tagline:
      'A secure, UK-compliant fertility and donor management platform.',
    location: 'United Kingdom',
    description:
      'A secure, user-friendly donor management marketplace that simplifies the path to parenthood — with advanced matching filters, fully verified donor data, and UK regulatory compliance for a UK-based fertility clinic.',
    overview:
      'Orion Gametes set out to simplify the path to parenthood with an efficient, reliable, and secure donor management system. The donor selection process was complex and demanded verified, trustworthy data and user-friendly profile management for both donors and clients. Kaizen built a secure marketplace that streamlines matching while meeting UK regulatory standards.',
    challenge:
      'The clinic faced a complex donor-selection process, needed fully verified and trustworthy donor data, and required intuitive profile management for both donors and clients — all under strict UK compliance.',
    solution:
      'We developed a secure marketplace: advanced search filters by age, blood group, ethnicity, medical history, and genetic traits; sorting, ranking, and shortlisting for compatibility; complete verification of donor identity, medical history, and lab tests with ongoing compliance checks; intuitive profile management; email and WhatsApp notifications; cloud access from anywhere; and the ability to select and purchase specific donor categories.',
    result:
      'The platform simplified and accelerated donor selection, improved accessibility for clients across devices, and increased trust and transparency through verified data — making fertility planning smoother and less stressful while keeping every process UK-compliant.',
    image: '/images/projects/orion-gametes.png',
    gallery: [],
    metrics: [
      { value: 'UK', label: 'Regulatory Compliance' },
      { value: 'Verified', label: 'Donor Data' },
      { value: 'Advanced', label: 'Match Filters' },
      { value: 'Cloud', label: 'Anywhere Access' },
    ],
    features: [
      {
        icon: 'SlidersHorizontal',
        title: 'Streamlined Donor Selection',
        description:
          'Advanced filters by age, blood group, ethnicity, medical history, and genetic traits, with sorting, ranking, and shortlisting.',
      },
      {
        icon: 'BadgeCheck',
        title: 'Verified Donor Data',
        description:
          'Complete verification of identity, medical history, and lab tests, with ongoing compliance checks and secure records.',
      },
      {
        icon: 'UserCog',
        title: 'User-Friendly Profiles',
        description:
          'A simple, intuitive interface for clients and donors to create and manage detailed, secure profiles.',
      },
      {
        icon: 'ShieldCheck',
        title: 'UK Compliance',
        description:
          'All donor data and processes are designed to meet UK regulatory standards end to end.',
      },
      {
        icon: 'MonitorSmartphone',
        title: 'Enhanced Accessibility',
        description:
          'Fully optimized for desktop, tablet, and mobile, with email and WhatsApp notifications and reminders.',
      },
      {
        icon: 'ShoppingCart',
        title: 'Donor Category Purchase',
        description:
          'Clients select and purchase specific donor categories based on preferences and eligibility — fast and accurate matching.',
      },
    ],
    benefits: [
      'Time-efficient donor selection — narrow down choices without unnecessary delays.',
      'Verified donor data reduces risk and builds trust for clients and clinics.',
      'Easy-to-use profiles and centralized data cut administrative workload.',
      'Access donor information anytime, anywhere, with timely updates.',
      'Personalized matches and secure data enhance client confidence.',
    ],
    impact: [
      'A smoother, less stressful donor selection and fertility-planning journey.',
      'Greater trust and transparency through fully verified records.',
      'Accurate matching that saves time for clinics and prospective parents.',
      'Secure, compliant handling of sensitive medical data.',
    ],
    technologies: ['ASP.NET', 'JavaScript', 'SQL Server', 'WhatsApp API', 'Secure Cloud Hosting'],
    featured: false,
  },
  {
    id: 'proj-007',
    slug: 'yatri-mitra',
    title: 'Yatri Mitra',
    client: 'Yatri Mitra',
    category: 'Mobility',
    year: '2023',
    tagline:
      'Mumbai\'s first meter-based auto-rickshaw booking app — fair fares, fair earnings.',
    location: 'Mumbai Metropolitan Region',
    description:
      'A commission-free, meter-based ride platform built on real-time map engines — pairing government-regulated meter fares with GPS-driven calculations for transparent pricing, with direct payments to drivers and no surge.',
    overview:
      'Urban auto-rickshaw commuting in the Mumbai Metropolitan Region suffered from opaque pricing, hidden charges, and surge-driven disputes. Drivers faced inconsistent earnings from inefficient ride allocation and delayed payouts, while passengers dealt with unreliable ETAs and safety concerns. Kaizen built Yatri Mitra on real-time, map-based engines to make pricing transparent and earnings fair.',
    challenge:
      'The mobility sector faced fare-transparency issues and surge pricing that bred disputes, high-commission aggregator models that eroded driver earnings, unreliable ETAs, safety concerns, and limited integration with local transport unions.',
    solution:
      'We integrated government-regulated meter fares with GPS-driven distance-and-time calculations — fair pricing, no surge. Dynamic ride matching with predictive algorithms optimized allocation and ETAs; driver dashboards with demand heat maps maximized earnings; safety features included emergency SOS, verified profiles, and two-way ratings; and seamless union integration plus referral systems accelerated onboarding.',
    result:
      'Yatri Mitra onboarded thousands of drivers within weeks through union partnerships. Live tracking and downloadable receipts drove exceptional passenger ratings, reduced idle time boosted driver earnings by 25%, and the trust-driven ecosystem expanded across multiple cities.',
    image: '/images/projects/yatri-mitra.png',
    gallery: [],
    metrics: [
      { value: '0%', label: 'Commission' },
      { value: '+25%', label: 'Driver Earnings' },
      { value: 'Meter', label: 'Based Fares' },
      { value: '1,000s', label: 'Drivers Onboarded' },
    ],
    features: [
      {
        icon: 'Gauge',
        title: 'Government-Regulated Meter Fares',
        description:
          'Meter fares paired with GPS distance-and-time calculations — transparent pricing with no surge.',
      },
      {
        icon: 'Route',
        title: 'Dynamic Ride Matching',
        description:
          'Predictive algorithms on live maps optimize driver allocation and deliver accurate ETAs.',
      },
      {
        icon: 'Flame',
        title: 'Driver Demand Heat Maps',
        description:
          'Driver dashboards surface demand zones so drivers position better and maximize earnings.',
      },
      {
        icon: 'ShieldAlert',
        title: 'Safety First',
        description:
          'Emergency SOS, verified profiles, and two-way ratings build mutual accountability and trust.',
      },
      {
        icon: 'Handshake',
        title: 'Union Integration',
        description:
          'Seamless integration with local transport unions and welfare programs, plus referral-driven onboarding.',
      },
      {
        icon: 'ReceiptText',
        title: 'Live Tracking & Receipts',
        description:
          'Real-time trip tracking and downloadable receipts give passengers confidence on every ride.',
      },
    ],
    benefits: [
      'Transparent, government-regulated pricing with zero surge.',
      'Direct payments to drivers without aggregator commissions.',
      'Reduced idle time lifts driver earnings by around 25%.',
      'Safer rides through SOS, verified profiles, and two-way ratings.',
      'Faster onboarding via union partnerships and referrals.',
    ],
    impact: [
      'Partnered with local transport unions to onboard thousands of drivers in weeks.',
      'Live tracking and downloadable receipts drove exceptional passenger satisfaction.',
      'Driver earnings boosted by 25% through reduced idle time.',
      'The trust-driven ecosystem expanded across multiple cities.',
    ],
    technologies: ['Android', 'iOS', 'GPS', 'WebSockets', 'Payment Gateways', 'Maps APIs'],
    testimonial: {
      id: 'testimonial-yatri',
      quote:
        'This platform transformed urban mobility — drivers earn fairly, and passengers ride with confidence.',
      clientName: 'Transport Union Representative',
      clientRole: 'Partner',
      clientCompany: 'Mumbai Metropolitan Region',
    },
    featured: false,
  },
  {
    id: 'proj-008',
    slug: 'arovia',
    title: 'Arovia',
    client: 'Arovia Clinics',
    category: 'Healthcare',
    year: '2024',
    tagline:
      'Clinic management software that digitizes workflows and elevates patient care.',
    location: 'India',
    description:
      'A clinic management platform that simplifies operations and improves patient care — online appointments, digital patient records, a global prescription repository, encrypted billing, and WhatsApp reminders across every device.',
    overview:
      'Manual clinic operations lead to errors, scheduling conflicts, and lost productivity. Arovia was built to simplify clinic operations, improve patient care, and fully digitize clinical workflows — secure, scalable, and optimized for real-time use across devices.',
    challenge:
      'The clinic needed to digitize healthcare workflows, reduce administrative overhead from manual record-keeping, eliminate scheduling conflicts, and improve the patient care experience across multiple locations.',
    solution:
      'We developed a clinic management system: online appointment scheduling with automated reminders; centralized digital patient records, prescriptions, and lab reports; integration with a global prescription repository for standardized, safe prescribing; encrypted multi-mode billing and payments; role-based access for doctors, staff, and administrators; WhatsApp reminders and notifications; and full multi-device accessibility.',
    result:
      'Real-time access to patient data sped up clinical decisions, the global prescription integration improved treatment accuracy and safety, automated billing strengthened cash flow, and WhatsApp reminders improved appointment adherence — reducing paperwork and lifting both staff productivity and patient satisfaction.',
    image: '/images/projects/arovia.png',
    gallery: [],
    metrics: [
      { value: 'Multi-Device', label: 'Anywhere Access' },
      { value: 'WhatsApp', label: 'Patient Reminders' },
      { value: 'Global Rx', label: 'Repository' },
      { value: 'Encrypted', label: 'Billing' },
    ],
    features: [
      {
        icon: 'CalendarClock',
        title: 'Online Appointments & Calendar',
        description:
          'Patients and staff schedule and manage appointments digitally with automated reminders.',
      },
      {
        icon: 'FileHeart',
        title: 'Digital Patient Records',
        description:
          'Centralized storage of medical history, prescriptions, lab reports, and treatment records.',
      },
      {
        icon: 'Pill',
        title: 'Global Prescription Integration',
        description:
          'Connected to a global prescription repository for standardized, safe, and accurate prescribing.',
      },
      {
        icon: 'CreditCard',
        title: 'Secure Billing & Payments',
        description:
          'Encrypted transactions with multi-mode payment options ensure data integrity and healthy cash flow.',
      },
      {
        icon: 'Lock',
        title: 'Role-Based Access Control',
        description:
          'Doctors, staff, and administrators see only the information relevant to their role.',
      },
      {
        icon: 'MessageCircle',
        title: 'WhatsApp Integration',
        description:
          'Automated reminders, notifications, and direct patient communication boost appointment adherence.',
      },
    ],
    benefits: [
      'Real-time patient data enables faster, better-informed clinical decisions.',
      'Global prescription integration improves treatment accuracy and patient safety.',
      'Automated billing and secure payments improve cash flow and accountability.',
      'Role-based dashboards free staff to focus on care, not admin.',
      'WhatsApp reminders improve appointment adherence and satisfaction.',
    ],
    impact: [
      'Reduced paperwork and eliminated scheduling conflicts.',
      'Streamlined billing and stronger financial accountability.',
      'Higher staff productivity and improved patient engagement.',
      'A measurably better patient experience across all locations.',
    ],
    technologies: ['ASP.NET', 'WhatsApp API', 'Payment Gateways', 'SQL Server', 'Cloud Hosting'],
    featured: false,
  },
  {
    id: 'proj-009',
    slug: 'zfunds',
    title: 'Z Funds',
    client: 'Z Funds',
    category: 'Social Impact',
    year: '2023',
    tagline:
      'Connecting aid with those who need it most — empowering social impact through technology.',
    location: 'Pan-India',
    description:
      'A centralized digital platform that bridges social organizations, donors, and people in need — from fund requests to real-time approvals — ensuring transparency, efficiency, and measurable social impact across India.',
    overview:
      'Millions of underprivileged individuals in India need timely financial assistance for medical treatment, education, and other critical needs, yet connecting them with NGOs and funders has been fragmented and slow. Z Funds is a centralized platform that bridges this gap — linking social organizations, donors, and beneficiaries with transparency and accountability at every stage.',
    challenge:
      'Beneficiaries lacked centralized access to support schemes, and connecting NGOs with people who needed financial aid for education and medical needs was fragmented, slow, and paperwork-heavy.',
    solution:
      'We built a centralized portal: a fund-request portal where individuals submit needs with KYC and supporting documents in a single submission visible to all registered NGOs; a searchable NGO and funder directory filterable by assistance type, location, and eligibility; real-time application tracking with automated notifications and direct NGO-applicant communication; secure document management; and a reporting and analytics dashboard — all accessible across devices.',
    result:
      'Critical financial aid now reaches beneficiaries faster, automated communication and digital KYC cut administrative work, and applicants from any region of India can connect with registered NGOs — backed by transparent, secure handling of sensitive personal and financial data.',
    image: '/images/projects/zfunds.webp',
    gallery: [],
    metrics: [
      { value: 'Nationwide', label: 'NGO Network' },
      { value: 'Digital', label: 'KYC & Documents' },
      { value: 'Real-Time', label: 'Request Tracking' },
      { value: 'Centralized', label: 'Fund Requests' },
    ],
    features: [
      {
        icon: 'FilePlus2',
        title: 'Centralized Fund Request Portal',
        description:
          'Individuals submit needs with KYC and supporting documents — one submission, visible to all registered NGOs across India.',
      },
      {
        icon: 'Building2',
        title: 'NGO & Funder Directory',
        description:
          'A comprehensive database of NGOs and funders, filterable by assistance type, location, or eligibility.',
      },
      {
        icon: 'BellRing',
        title: 'Application Tracking',
        description:
          'Real-time tracking with automated notifications keeps applicants informed at every stage of approval.',
      },
      {
        icon: 'FolderLock',
        title: 'Secure Document Management',
        description:
          'KYC, medical reports, and certificates are stored securely with restricted, role-based access.',
      },
      {
        icon: 'BarChart3',
        title: 'Reporting & Analytics',
        description:
          'NGOs and administrators monitor pending requests, approvals, and funding trends across India.',
      },
      {
        icon: 'MonitorSmartphone',
        title: 'Multi-Platform Access',
        description:
          'Accessible via desktop, tablet, and mobile so NGOs and applicants stay connected anywhere.',
      },
    ],
    benefits: [
      'Centralized requests reach the right NGO without delays.',
      'Requests are visible to all registered funders across India.',
      'Automated notifications keep applicants and NGOs updated at every stage.',
      'Every fund request and approval is tracked, reducing errors and misuse.',
      'Digital KYC eliminates physical paperwork.',
      'Analytics help NGOs prioritize high-impact initiatives.',
    ],
    impact: [
      'Critical financial aid reaches beneficiaries promptly.',
      'Automated communication, approvals, and documentation reduce admin work.',
      'Applicants from any region of India connect with registered NGOs.',
      'Transparent, secure handling builds trust and credibility.',
    ],
    technologies: ['ASP.NET', 'SQL Server', 'Search Systems', 'Secure Storage'],
    featured: false,
  },
  {
    id: 'proj-010',
    slug: 'agni-foundation',
    title: 'Agni Foundation',
    client: 'Agni Foundation',
    category: 'Global Community',
    year: '2024',
    tagline:
      'A digital platform fostering collaboration and impactful social initiatives.',
    location: 'Global',
    description:
      'A web and mobile platform fostering collaboration and driving impactful initiatives for social and community development — supporting global connectivity, member reports, event engagement, and admin workflows.',
    overview:
      'Agni Foundation drives impactful initiatives for social and community development. The foundation needed a digital platform to connect members globally, streamline administrative operations, and improve visibility into participation and organizational growth. Kaizen delivered an integrated web and mobile experience built for collaboration at scale.',
    challenge:
      'The foundation needed to connect members globally, streamline administrative operations, and gain clear visibility into participation and organizational growth across geographies.',
    solution:
      'We delivered a mobile app and website: a global member directory, community updates and announcements, role-based reports and analytics, an events calendar with engagement tools, and admin dashboards with automated workflows.',
    result:
      'The platform improved member connectivity across the globe, delivered clearer visibility into participation and growth, and streamlined administrative processes — freeing the foundation to focus on impactful community initiatives.',
    image: '/images/projects/agni-foundation.webp',
    gallery: [],
    metrics: [
      { value: 'Global', label: 'Member Reach' },
      { value: 'Web + App', label: 'Cross-Platform' },
      { value: 'Role-Based', label: 'Reports' },
      { value: 'Automated', label: 'Admin Workflows' },
    ],
    features: [
      {
        icon: 'Globe',
        title: 'Global Member Directory',
        description:
          'Connect members across geographies with a centralized, searchable directory.',
      },
      {
        icon: 'Megaphone',
        title: 'Community Updates',
        description:
          'Broadcast announcements and updates to keep the whole community informed.',
      },
      {
        icon: 'CalendarDays',
        title: 'Events & Engagement',
        description:
          'An events calendar with engagement tools to grow participation across regions.',
      },
      {
        icon: 'LineChart',
        title: 'Role-Based Reports',
        description:
          'Reports and analytics give leaders clear visibility into participation and growth.',
      },
      {
        icon: 'LayoutDashboard',
        title: 'Admin Dashboards',
        description:
          'Centralized dashboards with automated workflows streamline administration.',
      },
      {
        icon: 'Smartphone',
        title: 'Web & Mobile',
        description:
          'A consistent experience across website and mobile app for members and admins alike.',
      },
    ],
    benefits: [
      'Members stay connected across the globe.',
      'Clear visibility into participation and growth metrics.',
      'Administrative processes are streamlined and automated.',
      'Community updates and events drive stronger engagement.',
    ],
    impact: [
      'Improved member connectivity across geographies.',
      'Better visibility into participation and organizational growth.',
      'Significantly streamlined administrative workflows.',
    ],
    technologies: ['ASP.NET', 'Android', 'iOS', 'SQL Server', 'REST APIs'],
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
