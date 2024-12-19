import { useEffect, useState } from 'react';
import { MediaItem } from '@/types/media';
import { subscribeToChanges, unsubscribe } from '@/lib/realtime';

export function useRealtimeMedia(initialMedia: MediaItem[] = []) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia);

  useEffect(() => {
    const channel = subscribeToChanges(
      { table: 'media' },
      (payload) => {
        const { eventType, new: newRecord, old: oldRecord } = payload;

        switch (eventType) {
          case 'INSERT':
            setMedia((prev) => [newRecord, ...prev]);
            break;
          case 'UPDATE':
            setMedia((prev) =>
              prev.map((item) =>
                item.id === newRecord.id ? newRecord : item
              )
            );
            break;
          case 'DELETE':
            setMedia((prev) =>
              prev.filter((item) => item.id !== oldRecord.id)
            );
            break;
        }
      }
    );

    return () => {
      unsubscribe(channel);
    };
  }, []);

  return media;
}