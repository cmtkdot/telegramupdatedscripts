-- Function to upload file to storage and return URL
CREATE OR REPLACE FUNCTION upload_media(
    p_user_id UUID,
    p_chat_id BIGINT,
    p_file_name TEXT,
    p_media_type TEXT,
    p_caption TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_media_id UUID;
    v_file_url TEXT;
BEGIN
    -- Generate storage URL (this would be handled by your application)
    v_file_url := 'https://your-storage-url/' || p_file_name;
    
    -- Insert media record
    INSERT INTO media (
        user_id,
        chat_id,
        file_name,
        file_url,
        media_type,
        caption
    ) VALUES (
        p_user_id,
        p_chat_id,
        p_file_name,
        v_file_url,
        p_media_type,
        p_caption
    ) RETURNING id INTO v_media_id;
    
    RETURN v_media_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add tags to media
CREATE OR REPLACE FUNCTION add_media_tags(
    p_media_id UUID,
    p_tags TEXT[]
)
RETURNS SETOF media_tags AS $$
DECLARE
    v_tag_id UUID;
    v_tag TEXT;
BEGIN
    -- Insert tags and create associations
    FOREACH v_tag IN ARRAY p_tags
    LOOP
        -- Insert tag if it doesn't exist
        INSERT INTO tags (name)
        VALUES (v_tag)
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO v_tag_id;
        
        -- Create media-tag association
        RETURN QUERY
        INSERT INTO media_tags (media_id, tag_id)
        VALUES (p_media_id, v_tag_id)
        ON CONFLICT DO NOTHING
        RETURNING *;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;