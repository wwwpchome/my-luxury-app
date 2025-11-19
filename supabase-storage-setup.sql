-- Supabase Storage 策略配置
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本
-- 注意：首先需要在 Storage 中创建 'story-images' 桶

-- 允许所有人读取图片
CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects
FOR SELECT 
USING (bucket_id = 'story-images');

-- 允许所有人上传图片
CREATE POLICY IF NOT EXISTS "Public Upload" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'story-images');

-- 如果需要允许删除（可选）
-- CREATE POLICY IF NOT EXISTS "Public Delete" ON storage.objects
-- FOR DELETE 
-- USING (bucket_id = 'story-images');

