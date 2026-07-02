import { NextResponse } from 'next/server';
import { getPublished } from '@/lib/blog/serverStore';

// PUBLIC read endpoint for the /blog list. Reads the canonical store (KV on
// serverless, file on a persistent server) on every request, so admin
// add/edit/hide/delete changes appear without a rebuild — on any host.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const blogs = await getPublished();
  return NextResponse.json({ blogs }, { headers: { 'Cache-Control': 'no-store' } });
}
