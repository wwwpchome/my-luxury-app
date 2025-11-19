-- 为 stories 表添加 image_path 字段
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本

ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS image_path TEXT;

-- 添加注释说明字段用途
COMMENT ON COLUMN stories.image_path IS 'Path to the image in Supabase Storage (story-images bucket)';

