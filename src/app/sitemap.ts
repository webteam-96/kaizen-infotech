import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://kaizeninfotech.com';

  const routes = [
    '',
    '/about',
    '/services',
    '/work',
    '/blog',
    '/contact',
    '/careers',
  ];

  const serviceRoutes = [
    '/services/custom-software-development',
    '/services/mobile-app-development',
    '/services/cloud-devops-solutions',
    '/services/ai-machine-learning',
    '/services/ui-ux-design',
    '/services/digital-transformation',
  ];

  return [
    ...routes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: route === '' ? 1 : 0.8,
    })),
    ...serviceRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
