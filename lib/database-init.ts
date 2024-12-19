import { supabase } from './supabase-client';
import { toast } from 'sonner';

const REQUIRED_TABLES = ['bot_activities', 'channels', 'media', 'messages', 'media_tags'];

export async function initializeDatabase() {
  try {
    // Check for required tables
    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase
        .from(table)
        .select('count')
        .limit(0);

      if (error?.code === '42P01') {
        console.log(`Table ${table} missing, running initialization...`);
        await createTables();
        return;
      }
    }

    console.log('Database schema verified');
  } catch (error) {
    console.error('Database initialization error:', error);
    toast.error('Failed to initialize database');
  }
}

async function createTables() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      -- Enable extensions
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      -- Bot activities table
      CREATE TABLE IF NOT EXISTS bot_activities (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        event_type TEXT NOT NULL,
        chat_id BIGINT NOT NULL,
        user_id TEXT,
        message_id BIGINT,
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      -- Add indexes
      CREATE INDEX IF NOT EXISTS idx_bot_activities_created_at 
      ON bot_activities(created_at DESC);
      
      CREATE INDEX IF NOT EXISTS idx_bot_activities_chat_id 
      ON bot_activities(chat_id);

      -- Add cleanup trigger
      CREATE OR REPLACE FUNCTION cleanup_old_activities()
      RETURNS trigger AS $$
      BEGIN
        DELETE FROM bot_activities 
        WHERE created_at < NOW() - INTERVAL '30 days';
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS cleanup_old_activities_trigger 
      ON bot_activities;
      
      CREATE TRIGGER cleanup_old_activities_trigger
        AFTER INSERT ON bot_activities
        EXECUTE FUNCTION cleanup_old_activities();
    `
  });

  if (error) {
    console.error('Failed to create tables:', error);
    toast.error('Database initialization failed');
    throw error;
  }

  toast.success('Database initialized successfully');
}