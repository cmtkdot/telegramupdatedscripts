'use client';

import { useBotActivity, BotActivity } from '@/hooks/use-bot-activity';
import { formatDistanceToNow } from 'date-fns';
import { Bot, MessageSquare, User, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';

export function BotActivityFeed() {
  const { data: activities, isLoading, error } = useBotActivity();

  const getEventIcon = (activity: BotActivity) => {
    switch (activity.event_type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'command':
        return <Bot className="h-4 w-4" />;
      case 'user_action':
        return <User className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getEventDescription = (activity: BotActivity) => {
    switch (activity.event_type) {
      case 'message':
        return `New message in chat ${activity.chat_id}`;
      case 'media':
        return `New ${activity.details.media_type || 'media'} received`;
      case 'command':
        return `Command "${activity.details.command}" executed`;
      case 'user_action':
        return activity.details.description || 'User action';
      default:
        return 'Unknown event';
    }
  };

  if (isLoading) {
    return (
      <Card className="glass border-white/10 p-4">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-[60px] w-full"
            />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass border-white/10 p-4">
        <div className="text-sm text-red-400 flex items-center gap-2 p-4">
          <AlertCircle className="h-4 w-4" />
          {error instanceof Error ? error.message : 'Failed to load bot activity'}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            className="ml-auto"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass border-white/10">
      <ScrollArea className="h-[300px] p-4">
        <div className="space-y-2">
          {activities?.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-2 rounded-lg glass hover:bg-white/5 transition-colors"
            >
              <div className="text-white/60">
                {getEventIcon(activity)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                  {getEventDescription(activity)}
                </p>
                <p className="text-xs text-white/40">
                  {formatDistanceToNow(new Date(activity.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
          {!activities?.length && (
            <div className="text-center text-white/40 py-8">
              No recent activity
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}