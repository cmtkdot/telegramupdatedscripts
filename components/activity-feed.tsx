'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { subscribeToChanges, unsubscribe } from '@/lib/realtime';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';
import { FileIcon, ImageIcon, MessageSquare, VideoIcon } from 'lucide-react';

interface Activity {
  id: string;
  type: 'media' | 'message' | 'channel';
  title: string;
  description: string;
  created_at: string;
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Initial fetch
    fetchRecentActivity();
    let channel: RealtimeChannel;

    // Subscribe to realtime updates
    try {
      channel = subscribeToChanges(
        { table: 'bot_activities' },
        (payload) => {
          handleRealtimeUpdate(payload);
        }
      );
    } catch (error) {
      console.error('Failed to subscribe to realtime updates:', error);
    }

    return () => {
      if (channel) {
        unsubscribe(channel);
      }
    };
  }, []);

  const handleRealtimeUpdate = (payload: any) => {
    const newActivity = createActivityFromPayload(payload);
    if (newActivity) {
      setActivities((prev) => [newActivity, ...prev].slice(0, 10));
    }
  };

  const fetchRecentActivity = useCallback(async () => {
    try {
      const { data: botActivities, error: botError } = await supabase
        .from('bot_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (botError) {
        console.error('Error fetching activities:', botError);
        throw botError;
      }

      if (!botActivities) {
        return;
      }

      const activities = botActivities.map((item) => ({
        id: item.id,
        type: 'message',
        title: `Chat ${item.chat_id}`,
        description: item.event_type === 'command' 
          ? `Command executed: ${item.details.command}`
          : `New ${item.event_type}`,
        created_at: item.created_at,
      }));

      setActivities(activities);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  }, []);

  const createActivityFromPayload = (payload: any): Activity | null => {
    const { new: record } = payload;
    if (!record) return null;

    return {
      id: record.id,
      type: 'message',
      title: `Chat ${record.chat_id}`,
      description: record.event_type === 'command'
        ? `Command executed: ${record.details.command}`
        : `New ${record.event_type}`,
      created_at: record.created_at,
    };
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-5 w-5" />;
      case 'video':
        return <VideoIcon className="h-5 w-5" />;
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
      default:
        return <FileIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-white/60 text-center py-8">No recent activity</p>
      ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start space-x-3 glass rounded-lg p-3 md:p-4"
          >
            <div className="text-white/60">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-white">{activity.title}</p>
              <p className="text-sm text-white/60">{activity.description}</p>
            </div>
            <p className="text-xs text-white/40 whitespace-nowrap">
              {formatDistanceToNow(new Date(activity.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
        ))
      )}
    </div>
  );
}