import { useEffect, useState } from 'react';
import { Channel } from '@/types/channel';
import { subscribeToChanges, unsubscribe } from '@/lib/realtime';

export function useRealtimeChannels(initialChannels: Channel[] = []) {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    try {
      channel = subscribeToChanges(
        { table: 'channels' },
        async (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;

          switch (eventType) {
            case 'INSERT':
              setChannels((prev) => prev ? [newRecord, ...prev] : [newRecord]);
              break;
            case 'UPDATE':
              setChannels((prev) =>
                prev?.map((item) =>
                  item.id === newRecord.id ? newRecord : item
                ) || []
              );
              break;
            case 'DELETE':
              setChannels((prev) =>
                prev?.filter((item) => item.id !== oldRecord.id) || []
              );
              break;
          }
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to subscribe to channels'));
      console.error('Channel subscription error:', err);
    }

    return () => {
      if (channel) {
        unsubscribe(channel);
      }
    };
  }, []);


  return channels;
}