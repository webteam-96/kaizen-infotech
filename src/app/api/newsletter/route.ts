import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // TODO: Integrate with newsletter service (Mailchimp, ConvertKit, etc.)
  console.log('Newsletter signup:', body);

  return NextResponse.json({ success: true, message: 'Subscribed successfully' });
}
