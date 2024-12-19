import { config } from './config';

export async function sendTelegramMessage(chatId: number, text: string) {
  const response = await fetch(
    `https://api.telegram.org/bot${config.telegram.botApi}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      }),
    }
  );

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.description);
  }

  return data.result;
}

export async function getTelegramFile(fileId: string) {
  const response = await fetch(
    `https://api.telegram.org/bot${config.telegram.botApi}/getFile`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_id: fileId
      }),
    }
  );

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.description);
  }

  return `https://api.telegram.org/file/bot${config.telegram.botApi}/${data.result.file_path}`;
}

export async function setTelegramWebhook(url: string) {
  const response = await fetch(
    `https://api.telegram.org/bot${config.telegram.botApi}/setWebhook`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        secret_token: config.telegram.webhookSecret,
        allowed_updates: ['message', 'edited_message']
      }),
    }
  );

  const data = await response.json();
  if (!data.ok) {
    throw new Error(data.description);
  }

  return data.result;
}