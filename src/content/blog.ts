import type { BlogPost, TeamMember } from '@/types';

// ---------------------------------------------------------------------------
// Authors
// ---------------------------------------------------------------------------

const kaizenTeam: TeamMember = {
  id: 'author-kaizen-team',
  name: 'Kaizen Infotech Team',
  role: 'Kaizen Infotech Solutions',
  bio: 'Insights from the engineering, design, and strategy team at Kaizen Infotech Solutions.',
  image: '',
  social: {
    linkedin: 'https://linkedin.com',
  },
};

// ---------------------------------------------------------------------------
// Blog Posts
// ---------------------------------------------------------------------------

export const blogPosts: BlogPost[] = [
  {
    id: 'post-001',
    slug: 'india-largest-rotary-club-website-network',
    title: "How We Built India's Largest Rotary Club Website Network",
    excerpt:
      'What it takes to design and deliver a digital ecosystem serving 4,500 clubs and 1.8 lakh members — lessons from one of our most complex and rewarding projects.',
    content: `Kaizen Infotech was engaged to build a comprehensive digital platform for Rotary Zones 4, 5, 6, and 7 in India — an ecosystem serving 4,500 clubs and over 1.8 lakh Rotarians. The scale and diversity of the organisation meant every architectural and design decision carried real weight.

The project required centralized club and district management, member directories, event management, and over 1,000 individual club and district websites — all under a unified, scalable platform. We built for high adoption across diverse geographies and varying levels of digital literacy among club administrators.

The result: Rotary Zones 4–7 became recognised as the world's largest provider of Rotary club websites, with widespread adoption across India and measurably improved operational efficiency.

_Full article coming soon._`,
    author: kaizenTeam,
    category: 'Enterprise Software',
    publishedAt: 'Coming soon',
    readingTime: '8 min read',
    image: '/images/blog/rotary-network.jpg',
    tags: ['Enterprise Software', 'Case Study', 'Rotary'],
  },
  {
    id: 'post-002',
    slug: 'digitising-government-port-pension-system',
    title: "5 Lessons from Digitising a Government Port's Pension System",
    excerpt:
      'Digitising pension records for 28,000 employees and building real-time vessel tracking for one of India\'s oldest ports — a case study in patience, process, and performance.',
    content: `When Mumbai Port Trust approached Kaizen Infotech to digitise their pension management system, the scope was significant: 28,000 employees, decades of paper records, and the need for a reliable, auditable digital system that government administrators could trust and use.

Alongside pension digitisation, the project included building real-time vessel tracking for one of India's oldest and busiest ports. The combination of legacy data migration, government compliance requirements, and high-availability operational systems made this one of our most demanding — and instructive — engagements.

Across the project we learned five key lessons about working with government institutions on digital transformation: the importance of process mapping before any code is written, the value of incremental rollouts, the need for extensive user training, the non-negotiable nature of audit trails, and the patience required to earn trust from long-established organisations.

_Full article coming soon._`,
    author: kaizenTeam,
    category: 'Government Tech',
    publishedAt: 'Coming soon',
    readingTime: '7 min read',
    image: '/images/blog/port-pension-system.jpg',
    tags: ['Government Tech', 'Case Study', 'Digital Transformation'],
  },
  {
    id: 'post-003',
    slug: 'event-registration-systems-under-pressure',
    title: "Building Event Registration Systems That Don't Crash Under Pressure",
    excerpt:
      'What happens when 10,000 delegates register simultaneously — and how we architect event management platforms that hold up when it matters most.',
    content: `Event technology has a unique and unforgiving quality: the highest load hits at the exact moment when failure is most costly. When a conference opens registration, thousands of attendees may attempt to register within minutes. A slow or crashed system reflects directly on the organiser.

Kaizen Infotech has built event management and registration platforms for large-scale events across India. Through that experience we have developed an approach to architecture that prioritises reliability under peak load — not just average load.

Key principles include designing for burst traffic from the start, using asynchronous queuing for registration processing, implementing confirmation workflows that degrade gracefully, and investing in pre-event load testing with realistic concurrency scenarios. We have also learned that the UX during high-traffic periods matters as much as the technical infrastructure — clear feedback to users prevents repeated submission attempts that compound load.

_Full article coming soon._`,
    author: kaizenTeam,
    category: 'Event Technology',
    publishedAt: 'Coming soon',
    readingTime: '6 min read',
    image: '/images/blog/event-registration.jpg',
    tags: ['Event Technology', 'Architecture', 'Scalability'],
  },
  {
    id: 'post-004',
    slug: 'why-indian-enterprises-choose-aspnet-2026',
    title: 'Why Indian Enterprises Still Choose ASP.NET in 2026',
    excerpt:
      'Despite the rise of Node.js and cloud-native frameworks, ASP.NET remains the backbone of enterprise software for a very good reason. Here is the honest case for it.',
    content: `In technology discussions, ASP.NET is sometimes treated as a legacy choice — something organisations use because they have always used it, not because it remains the right tool. At Kaizen Infotech, we use ASP.NET extensively for enterprise clients, and we want to make an honest, current case for why.

ASP.NET's maturity means stability, predictable performance, and a well-understood security model. For enterprises dealing with government compliance requirements, integration with legacy systems, or large teams of developers who need consistency, these qualities are not incidental — they are decisive.

Node.js and cloud-native frameworks offer real advantages for certain workloads, particularly high-concurrency APIs and event-driven architectures. But for line-of-business applications — complex data models, multi-tenant access control, deep reporting requirements — ASP.NET continues to provide a robust and productive foundation that competes comfortably with any alternative.

The choice is not about trend-following. It is about matching the tool to the problem.

_Full article coming soon._`,
    author: kaizenTeam,
    category: 'Enterprise Software',
    publishedAt: 'Coming soon',
    readingTime: '5 min read',
    image: '/images/blog/aspnet-enterprise.jpg',
    tags: ['Enterprise Software', 'ASP.NET', 'Engineering'],
  },
];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const blogCategories = [
  'All',
  'Government Tech',
  'Enterprise Software',
  'Mobile Development',
  'Event Technology',
  'Digital Marketing',
] as const;

export type BlogCategory = (typeof blogCategories)[number];
