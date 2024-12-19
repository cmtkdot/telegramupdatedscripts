-- Create bot_activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS bot_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    chat_id BIGINT NOT NULL,
    user_id TEXT,
    message_id BIGINT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_bot_activities_created_at ON bot_activities(created_at DESC);

-- Add trigger for cleanup of old records
CREATE OR REPLACE FUNCTION cleanup_old_bot_activities()
RETURNS trigger AS $$
BEGIN
  DELETE FROM bot_activities
  WHERE created_at < NOW() - INTERVAL '30 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER cleanup_old_bot_activities_trigger
AFTER INSERT ON bot_activities
EXECUTE FUNCTION cleanup_old_bot_activities();