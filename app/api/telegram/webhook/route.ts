import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { config } from '@/lib/config';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Verify webhook secret
    const telegramToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (telegramToken !== config.telegram.webhookSecret) {
      console.error('Invalid webhook token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Handle media messages
    const message = data.message || data.edited_message;
    if (!message) {
      return NextResponse.json({ error: 'Invalid update' }, { status: 400 });
    }

    let mediaType = null;
    let fileId = null;
    let fileName = null;

    if (message.photo) {
      mediaType = 'photo';
      fileId = message.photo[message.photo.length - 1].file_id;
      fileName = `photo_${message.message_id}.jpg`;
    } else if (message.video) {
      mediaType = 'video';
      fileId = message.video.file_id;
      fileName = message.video.file_name || `video_${message.message_id}.mp4`;
    } else if (message.document) {
      mediaType = 'document';
      fileId = message.document.file_id;
      fileName = message.document.file_name || `document_${message.message_id}`;
    }

    // Store media information if present
    if (mediaType && fileId) {
      const { error: mediaError } = await supabase
        .from('media')
        .insert({
          chat_id: message.chat.id,
          file_name: fileName,
          file_url: `https://api.telegram.org/file/bot${config.telegram.botApi}/${fileId}`,
          media_type: mediaType,
          caption: message.caption,
          metadata: {
            message_id: message.message_id,
            file_id: fileId,
            mime_type: message.document?.mime_type
          }
        });

      if (mediaError) {
        console.error('Error storing media:', mediaError);
        return NextResponse.json(
          { error: 'Failed to store media' },
          { status: 500 }
        );
      }
    }

    // Log bot activity
    const { error: activityError } = await supabase
      .from('bot_activities')
      .insert({
        event_type: mediaType ? 'media' : 'message',
        chat_id: message.chat.id,
        user_id: message.from?.id?.toString(),
        message_id: message.message_id,
        details: {
          media_type: mediaType,
          text: message.text,
          caption: message.caption
        }
      });

    if (activityError) {
      console.error('Error logging activity:', activityError);
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