// Configuration constants for the application
export const config = {
  telegram: {
    botUsername: 'xdelo_mediabot', // Your bot username
    botApi: '7717223683:AAFsA-TrrkF09eeGubXHPO1uaiJ5ugGVLVw', // Your bot token
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || 'your-webhook-secret',
  },
  supabase: {
    url: 'https://jgfivmrejdxcoeopcctk.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpnZml2bXJlamR4Y29lb3BjY3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ0Mjk4ODUsImV4cCI6MjA1MDAwNTg4NX0.qCeAqzzsabuBdus9sGlP2huazzpzMWx6oueoPsdHRfk',
  },
  telegram_bot_url: 'https://t.me/xdelo_mediabot',
} as const;