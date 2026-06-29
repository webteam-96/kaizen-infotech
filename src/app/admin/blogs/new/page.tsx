'use client';

import { useState } from 'react';
import { BlogForm } from '@/components/admin/BlogForm';
import { emptyBlog } from '@/lib/blog/adminStore';

export default function NewBlogPage() {
  // Create the blank draft once (stable id) for this editing session.
  const [initial] = useState(() => emptyBlog());
  return <BlogForm initial={initial} mode="new" />;
}
