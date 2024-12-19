-- Create updated schema with proper relations and constraints

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    chat_id BIGINT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    username TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Media table
CREATE TABLE IF NOT EXISTS media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    chat_id BIGINT REFERENCES channels(chat_id),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    media_type TEXT CHECK (media_type IN ('image', 'video', 'document')),
    caption TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    chat_id BIGINT REFERENCES channels(chat_id),
    message_id BIGINT NOT NULL,
    sender_name TEXT NOT NULL,
    text TEXT,
    media_type TEXT CHECK (media_type IN ('image', 'video', 'document')),
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(chat_id, message_id)
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Media tags junction table
CREATE TABLE IF NOT EXISTS media_tags (
    media_id UUID REFERENCES media(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (media_id, tag_id)
);

-- Bot activities table
CREATE TABLE IF NOT EXISTS bot_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    chat_id BIGINT NOT NULL,
    user_id TEXT,
    message_id BIGINT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for bot activities
CREATE INDEX IF NOT EXISTS idx_bot_activities_created_at ON bot_activities(created_at DESC);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_channels_user_id ON channels(user_id);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_chat_id ON media(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_media_tags_media_id ON media_tags(media_id);
CREATE INDEX IF NOT EXISTS idx_media_tags_tag_id ON media_tags(tag_id);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_channels_updated_at
    BEFORE UPDATE ON channels
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON media
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();