import { NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const response = await fetch(
      `https://api.telegram.org/bot${config.telegram.botApi}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: `@${config.telegram.botUsername}`,
          text: text,
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json(
        { error: data.description },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error sending command:', error);
    return NextResponse.json(
      { error: 'Failed to send command' },
      { status: 500 }
    );
  }
}