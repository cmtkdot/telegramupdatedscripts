import { config } from '../lib/config';

async function setupWebhook() {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${config.telegram.botApi}/setWebhook`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: process.env.WEBHOOK_URL,
          secret_token: config.telegram.webhookSecret,
          allowed_updates: ['message', 'edited_message', 'channel_post']
        }),
      }
    );

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.description);
    }

    console.log('Webhook set successfully:', data.result);
  } catch (error) {
    console.error('Failed to set webhook:', error);
    process.exit(1);
  }
}

setupWebhook();