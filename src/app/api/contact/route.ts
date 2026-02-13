import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();

  // TODO: Integrate with email service (SendGrid, Resend, etc.)
  console.log('Contact form submission:', body);

  return NextResponse.json({ success: true, message: 'Message sent successfully' });
}
