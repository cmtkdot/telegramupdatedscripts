import { supabase } from './supabase-client';

export async function initializeDatabase() {
  try {
    // Check if bot_activities table exists
    const { data: tableExists, error: checkError } = await supabase
      .from('bot_activities')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.log('Bot activities table does not exist, creating...');
      
      // Read and execute initialization SQL
      const { error: initError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS bot_activities (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            event_type TEXT NOT NULL,
            chat_id BIGINT NOT NULL,
            user_id TEXT,
            message_id BIGINT,
            details JSONB DEFAULT '{}'::jsonb,
            created_at TIMESTAMPTZ DEFAULT now()
          );

          CREATE INDEX IF NOT EXISTS idx_bot_activities_created_at 
          ON bot_activities(created_at DESC);
        `
      });

      if (initError) {
        throw initError;
      }

      console.log('Database initialized successfully');
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}