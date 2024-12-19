import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import { toast } from 'sonner';

export interface BotActivity {
  id: string;
  event_type: string;
  chat_id: number;
  user_id: string | null;
  message_id: number | null;
  details: any;
  created_at: string;
}

export function useBotActivity() {
  return useQuery({
    queryKey: ['bot-activity'],
    queryFn: async () => {
      let retries = 0;
      const maxRetries = 3;

      while (retries < maxRetries) {
        try {
          const { data, error } = await supabase
            .from('bot_activities')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

          if (error?.code === '42P01' && retries < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
            continue;
          }

          if (error) throw error;
          return data as BotActivity[];

        } catch (err) {
          console.error('Bot activity error:', err);
          throw err;
        }
      }

      throw new Error('Failed to load bot activity after retries');
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    retry: false, // We handle retries manually
  });
}