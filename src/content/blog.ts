import type { BlogPost, TeamMember } from '@/types';

// ---------------------------------------------------------------------------
// Authors
// ---------------------------------------------------------------------------

const authors: Record<string, TeamMember> = {
  priya: {
    id: 'author-001',
    name: 'Priya Sharma',
    role: 'Head of AI/ML',
    bio: 'Priya leads our artificial intelligence and machine learning practice. With a PhD in Computer Science from Stanford and 10 years of experience building production ML systems, she specializes in making complex AI concepts accessible to both technical and non-technical audiences. Previously at Google Brain and a founding engineer at two AI startups.',
    image: '/images/team/priya-sharma.jpg',
    social: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
      github: 'https://github.com',
    },
  },
  alex: {
    id: 'author-002',
    name: 'Alex Chen',
    role: 'Principal Engineer',
    bio: 'Alex is a Principal Engineer at Kaizen with deep expertise in distributed systems and backend architecture. He has been building scalable platforms for over 12 years, with stints at AWS, Stripe, and several YC-backed startups. He is passionate about developer experience, clean APIs, and microservice patterns that actually work at scale.',
    image: '/images/team/alex-chen.jpg',
    social: {
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
    },
  },
  maya: {
    id: 'author-003',
    name: 'Maya Rodriguez',
    role: 'Design Director',
    bio: 'Maya oversees all design efforts at Kaizen, from brand identity to product interfaces. With 8 years of experience spanning agencies and in-house product teams, she is a recognized voice in design systems thinking. She previously led design at Figma and contributed to the Material Design system at Google.',
    image: '/images/team/maya-rodriguez.jpg',
    social: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
  },
  james: {
    id: 'author-004',
    name: 'James Nakamura',
    role: 'CEO & Co-founder',
    bio: 'James co-founded Kaizen Infotech with a mission to bring the philosophy of continuous improvement to software development. With 15 years in the industry spanning roles at ThoughtWorks, Pivotal, and his own consulting practice, he writes about engineering culture, team dynamics, and building sustainable technology companies.',
    image: '/images/team/james-nakamura.jpg',
    social: {
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
  },
};

// ---------------------------------------------------------------------------
// Blog Posts
// ---------------------------------------------------------------------------

export const blogPosts: BlogPost[] = [
  {
    id: 'post-001',
    slug: 'future-of-ai-in-enterprise-software',
    title: 'The Future of AI in Enterprise Software',
    excerpt:
      'How artificial intelligence is reshaping enterprise applications, from intelligent automation to predictive analytics, and what it means for businesses preparing for the next decade.',
    content: `The enterprise software landscape is undergoing a fundamental transformation. After decades of incremental improvements — better UIs, faster databases, more integrations — artificial intelligence is introducing a qualitative shift in what software can do.

## From Tools to Partners

Traditional enterprise software is a tool. You input data, configure rules, and get output. AI-powered enterprise software is closer to a partner. It observes patterns, makes predictions, and increasingly takes autonomous action within defined guardrails.

Consider the evolution of a simple business intelligence dashboard. Five years ago, it showed you charts. Today, it tells you *why* a metric changed. Tomorrow, it will recommend what to do about it — and, with your approval, execute that recommendation.

## Three Waves of Enterprise AI

### Wave 1: Augmentation (Now)
AI assists human decision-making. Think copilots for code, smart search across documents, and anomaly detection in financial data. Most enterprises are here or approaching this stage.

### Wave 2: Automation (2025-2027)
AI handles entire workflows end-to-end. Invoice processing, customer support triage, demand forecasting, and compliance monitoring become largely autonomous. Humans shift from doing to supervising.

### Wave 3: Orchestration (2028+)
AI systems coordinate with each other across organizational boundaries. Supply chain AI negotiates with procurement AI. Customer success AI proactively engages based on product usage AI signals. The enterprise becomes a network of intelligent agents.

## What This Means for Engineering Teams

Building AI-powered enterprise software requires fundamentally different engineering practices:

**Data architecture comes first.** You cannot bolt AI onto a poorly structured data layer. The most successful enterprise AI projects we have seen start with a comprehensive data strategy — not a model.

**Explainability is non-negotiable.** Enterprise buyers need to understand why the AI made a decision. Black-box models may work for consumer recommendations, but not for financial risk assessments or healthcare diagnoses.

**Feedback loops are the product.** The AI gets better as users interact with it. Designing effective feedback mechanisms — corrections, confirmations, and overrides — is as important as the model architecture itself.

## Our Approach at Kaizen

We have been integrating AI into enterprise applications for over three years. Our approach is pragmatic: start with a specific, high-value use case, prove ROI within 90 days, then expand. We have learned that the companies seeing the most value from AI are not the ones with the most sophisticated models — they are the ones with the cleanest data and the clearest understanding of what problem they are solving.

The future of enterprise software is intelligent, adaptive, and deeply integrated into business operations. The companies that start building for this future now will have a significant competitive advantage in the decade ahead.`,
    author: authors.priya,
    category: 'AI/ML',
    publishedAt: 'January 15, 2025',
    readingTime: '8 min read',
    image: '/images/blog/ai-enterprise.jpg',
    tags: ['AI', 'Enterprise', 'Machine Learning', 'Strategy'],
  },
  {
    id: 'post-002',
    slug: 'building-scalable-microservices-nodejs',
    title: 'Building Scalable Microservices with Node.js',
    excerpt:
      'A practical guide to designing, deploying, and operating Node.js microservices that handle millions of requests without breaking a sweat.',
    content: `After building microservice architectures for dozens of clients, I have developed strong opinions about what works and what leads to distributed monolith pain. Here is what I wish someone had told me five years ago.

## The Monolith-First Disclaimer

Before we dive in: if you are a team of fewer than 10 engineers working on a product with fewer than 100,000 users, you probably do not need microservices. Start with a well-structured monolith. Seriously. The operational overhead of microservices is real, and premature decomposition creates more problems than it solves.

That said, when you do need microservices — when your team is growing, your deployment cadence varies across domains, and your scaling requirements differ by service — here is how to do it well with Node.js.

## Service Boundaries: The Art of Decomposition

The single most important decision is where to draw service boundaries. Get this wrong and everything downstream is painful.

**Decompose by business domain, not by technical layer.** A "User Service" and "Order Service" make sense. A "Database Service" and "API Gateway Service" do not — those are infrastructure concerns, not service boundaries.

**Each service owns its data.** No shared databases. If Service A needs data from Service B, it asks for it through an API or consumes events. This is the hill I will die on. Shared databases create coupling that defeats the entire purpose of microservices.

## Communication Patterns

### Synchronous (REST/gRPC)
Use for queries where the caller needs an immediate response. gRPC is significantly faster than REST for service-to-service communication — we have measured 3-5x improvements in latency for internal calls.

### Asynchronous (Events/Queues)
Use for commands and notifications. We standardize on Kafka for event streaming and Redis for simple job queues. The rule of thumb: if the caller does not need to wait for the result, make it async.

## Node.js-Specific Patterns

**Cluster mode with PM2 or built-in cluster module.** Node is single-threaded, so use all available cores. For CPU-intensive work, consider worker threads or offload to a dedicated service.

**Circuit breakers are mandatory.** Use opossum or a similar library to prevent cascade failures. When Service A depends on Service B and B goes down, A should degrade gracefully — not hang indefinitely.

**Structured logging from day one.** Use pino (it is fast) with correlation IDs passed through every request. When you are debugging a production issue across 15 services, you will thank yourself.

## Deployment and Observability

We deploy all services on Kubernetes with Helm charts. Each service gets:

- Health check endpoints (readiness and liveness)
- Prometheus metrics endpoint
- Distributed tracing via OpenTelemetry
- Centralized logging via Fluentd to Elasticsearch

The observability stack is not optional. Without it, you are flying blind in production.

## Lessons Learned the Hard Way

1. **Version your APIs from day one.** Breaking changes in internal APIs cause outages.
2. **Implement idempotency for all write operations.** Network is unreliable; retries will happen.
3. **Avoid distributed transactions.** Use saga patterns instead.
4. **Invest in local development tooling.** If engineers cannot run the full system locally, velocity drops.

Microservices done right give you independent deployability, technology flexibility, and team autonomy. Done wrong, they give you a distributed monolith with network latency. Choose wisely, and when in doubt, keep it simple.`,
    author: authors.alex,
    category: 'Engineering',
    publishedAt: 'December 8, 2024',
    readingTime: '10 min read',
    image: '/images/blog/microservices-nodejs.jpg',
    tags: ['Node.js', 'Microservices', 'Architecture', 'Backend'],
  },
  {
    id: 'post-003',
    slug: 'design-systems-that-scale',
    title: 'Design Systems That Scale: Lessons Learned',
    excerpt:
      'What we learned building design systems for companies ranging from 10-person startups to 500-person enterprises, and the principles that work at every scale.',
    content: `I have built four design systems from scratch and contributed to three others. Every single one taught me something the previous ones did not. Here are the patterns that consistently work, regardless of team size.

## The Foundation: Tokens, Not Components

Most teams start building a design system with components. That is backwards. Start with tokens — the atomic design decisions that everything else builds upon.

**Color tokens:** Not just the palette, but semantic tokens. "primary-action" is better than "blue-500" because it communicates intent, not implementation. When the brand evolves, you update the token mapping, not every component.

**Spacing tokens:** Use a consistent scale (4px base works well). Every margin, padding, and gap in the system should use a token. No magic numbers.

**Typography tokens:** Font family, size, weight, line-height, and letter-spacing as composable tokens. We typically define 6-8 type scales that cover every use case.

## Component Architecture

### Composition Over Configuration

The biggest mistake I see in design systems is over-configuring components. A Button with 47 props is not flexible — it is unmaintainable.

Instead, build small, composable primitives:

- A \`Button\` that handles click behavior, loading, and disabled states
- An \`Icon\` component that renders any icon
- Compose them: \`<Button leftIcon={<Icon name="arrow" />}>Next</Button>\`

### The Three-Layer Pattern

Every component in our systems follows this structure:

1. **Primitive layer:** Unstyled, accessible, handles behavior (keyboard, ARIA, focus management)
2. **Styled layer:** Applies design tokens, handles variants
3. **Composed layer:** Combines primitives into higher-level patterns (SearchInput = Input + Icon + ClearButton)

This separation lets teams customize the visual layer without breaking accessibility or behavior.

## Documentation That Works

A design system without documentation is a component library nobody uses. Here is what we include for every component:

- **Interactive playground** where designers and engineers can experiment
- **Usage guidelines** with do/don't examples from real product screens
- **Accessibility notes** specifying ARIA roles, keyboard behavior, and screen reader expectations
- **Code snippets** for every variant and state

We use Storybook for interactive documentation and sync it with Figma via design tokens.

## Adoption: The Hard Part

Building the system is 30% of the work. Getting teams to use it is 70%.

**Start with pain points.** Find the components teams rebuild most often (buttons, forms, modals) and build those first. Quick wins build trust.

**Make it easier to use than not to use.** If importing a system component requires more effort than writing custom CSS, teams will write custom CSS. Installation, imports, and configuration should be frictionless.

**Run office hours.** A weekly 30-minute slot where anyone can ask questions, request features, or report bugs. This builds community around the system.

**Measure adoption.** Track which components are used, how often, and where teams deviate. The deviations tell you where the system needs to evolve.

## The Kaizen Approach

Our design system philosophy mirrors our company philosophy: continuous improvement. We ship a 1.0 that is intentionally incomplete, then iterate based on real usage data. Every sprint includes at least one design system task — a new component, a refinement, or a documentation improvement.

The best design system is not the most comprehensive one. It is the one your team actually uses every day.`,
    author: authors.maya,
    category: 'Design',
    publishedAt: 'November 22, 2024',
    readingTime: '7 min read',
    image: '/images/blog/design-systems.jpg',
    tags: ['Design Systems', 'UI/UX', 'Components', 'Figma'],
  },
  {
    id: 'post-004',
    slug: 'why-continuous-improvement-matters',
    title: 'Why Continuous Improvement Matters in Software',
    excerpt:
      'The philosophy behind our name: how applying Kaizen principles to software development creates compounding advantages for teams and products.',
    content: `When I named this company Kaizen, it was not a branding exercise. It was a declaration of how we believe software should be built.

## What Kaizen Actually Means

Kaizen is a Japanese term meaning "change for the better." In manufacturing — where it originated at Toyota — it refers to a philosophy of continuous, incremental improvement. Not dramatic overhauls. Not big-bang rewrites. Steady, consistent, compounding progress.

In software, this philosophy manifests in several ways.

## Small Batches, Frequent Delivery

We deploy to production multiple times per day. Not because we are reckless, but because small changes are easier to review, test, deploy, and debug. When something breaks (and things always break), the blast radius of a 50-line change is dramatically smaller than a 5,000-line change.

This requires investment in CI/CD, automated testing, and feature flags. That investment pays for itself within months through reduced incident severity and faster time-to-market.

## Retrospectives That Drive Action

Every two weeks, our teams hold retrospectives. Not the performative kind where people say "communication could be better" and nothing changes. Real retrospectives with specific action items, owners, and follow-up.

The format we use:

1. **What went well?** Celebrate wins, no matter how small. Recognition reinforces good patterns.
2. **What could be improved?** Be specific. "Deployments were slow" is a start; "the staging environment took 45 minutes to build because of the Docker cache issue" is actionable.
3. **What will we do about it?** Each improvement item gets an owner and a deadline. We track completion rates — teams that follow through on retro actions improve measurably faster.

## The Compound Effect

Here is why continuous improvement is so powerful: the gains compound.

If your team gets 1% better every week — slightly faster deploys, slightly fewer bugs, slightly better code review practices — after a year you are 67% better. After two years, you are 180% better. These are not theoretical numbers; we have measured them across client engagements.

The teams that resist improvement — that say "we do not have time to improve our process" — are actually saying "we do not have time to go faster." The irony is thick.

## Improvement as Culture

The most important thing about continuous improvement is that it has to be cultural, not procedural. You cannot mandate kaizen through process documents. You build it by:

**Celebrating learning from failures.** When a production incident happens, the response should be curiosity, not blame. What can we learn? How do we prevent this class of failure?

**Empowering individuals to make changes.** If an engineer sees a way to improve a build script, they should be encouraged to do it — not asked to file a ticket and wait for approval.

**Leading by example.** Leaders who publicly acknowledge their own mistakes and share what they learned create psychological safety for everyone else to do the same.

## Why This Matters for Our Clients

When you hire Kaizen Infotech, you are not just getting engineers and designers. You are getting a team that reflexively asks "how can we do this better?" every single day. That mindset produces better code, better design, and better outcomes.

The name is the mission. Continuous improvement is not something we do — it is who we are.`,
    author: authors.james,
    category: 'Culture',
    publishedAt: 'October 30, 2024',
    readingTime: '6 min read',
    image: '/images/blog/continuous-improvement.jpg',
    tags: ['Culture', 'Kaizen', 'Process', 'Leadership'],
  },
];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const blogCategories = [
  'All',
  'AI/ML',
  'Engineering',
  'Design',
  'Culture',
] as const;

export type BlogCategory = (typeof blogCategories)[number];
