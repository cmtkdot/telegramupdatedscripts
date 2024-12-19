import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { config } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log('Received webhook:', JSON.stringify(data, null, 2));

    // Verify the request is from Telegram
    const telegramToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (telegramToken !== config.telegram.webhookSecret) {
      console.error('Invalid webhook token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract relevant information
    const message = data.message || data.edited_message;
    if (!message) {
      console.error('Invalid update - no message found');
      return NextResponse.json({ error: 'Invalid update' }, { status: 400 });
    }

    // Determine event type and details
    let eventType = 'message';
    let details: any = {
      text: message.text,
    };

    if (message.text?.startsWith('/')) {
      eventType = 'command';
      details = {
        command: message.text.split(' ')[0],
        args: message.text.split(' ').slice(1),
      };
    }

    // Log the activity
    console.log('Logging activity:', {
      event_type: eventType,
      chat_id: message.chat.id,
      user_id: message.from?.id?.toString(),
      message_id: message.message_id,
      details,
    });

    const { error: insertError } = await supabase
      .from('bot_activities')
      .insert({
        event_type: eventType,
        chat_id: message.chat.id,
        user_id: message.from?.id?.toString(),
        message_id: message.message_id,
        details,
      });

    if (insertError) {
      console.error('Error logging activity:', insertError);
      return NextResponse.json(
        { error: 'Failed to log activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}