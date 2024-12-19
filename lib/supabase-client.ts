import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import type { Database } from './supabase-types';

export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      eventsPerSecond: 2,
      channels: {
        retryAfterError: true,
        retryAttempts: 3
      }
    }
  }
);