import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase-client';

const CHANNEL_TIMEOUT = 1000 * 60; // 1 minute timeout

interface SubscriptionOptions {
  table: string;
  schema?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
}

let channelCounter = 0;

export function subscribeToChanges(
  options: SubscriptionOptions,
  callback: (payload: any) => void
): RealtimeChannel | null {
  const {
    table,
    schema = 'public',
    event = '*',
  } = options;

  if (!supabase.channel) {
    console.error('Realtime not available');
    return null;
  }

  // Create unique channel name
  const channelName = `${schema}:${table}:${++channelCounter}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event,
        schema,
        table,
      },
      async (payload) => {
        console.log(`Realtime update (${table}):`, payload);
        try {
          await callback(payload);
        } catch (error) {
          console.error(`Error in realtime callback (${table}):`, error);
        }
      }
    )
    .subscribe((status) => {
      console.log(`Subscription status (${table}):`, status);
      
      if (status === 'SUBSCRIBED') {
        // Set timeout to prevent stale channels
        setTimeout(() => {
          channel.unsubscribe();
        }, CHANNEL_TIMEOUT);
      }
    });

  return channel;
}

export function unsubscribe(channel: RealtimeChannel | null) {
  if (channel) {
    channel.unsubscribe();
  }
}