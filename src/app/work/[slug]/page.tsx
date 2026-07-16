import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { projects } from '@/content/projects';
import ProjectDetailClient from './ProjectDetailClient';
import { JsonLd } from '@/components/seo/JsonLd';
import { caseStudySchema, breadcrumbSchema } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/config';

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: 'Project Not Found' };

  return pageMetadata({
    title: project.title,
    description: project.description,
    path: `/work/${project.slug}`,
    image: project.image ? { url: project.image, alt: project.title } : undefined,
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projectIndex = projects.findIndex((p) => p.slug === slug);
  const project = projects[projectIndex];

  if (!project) notFound();

  const prevProject = projectIndex > 0 ? projects[projectIndex - 1] : null;
  const nextProject =
    projectIndex < projects.length - 1 ? projects[projectIndex + 1] : null;

  return (
    <>
      <JsonLd
        data={[
          caseStudySchema(project),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Work', path: '/work' },
            { name: project.title, path: `/work/${project.slug}` },
          ]),
        ]}
      />
      <ProjectDetailClient
        project={project}
        prevProject={prevProject}
        nextProject={nextProject}
      />
    </>
  );
}
