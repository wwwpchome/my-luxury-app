-- 快速修复 Supabase Storage RLS 策略
-- 在 Supabase Dashboard 的 SQL Editor 中执行

-- 步骤 1: 确保桶存在且为公开
-- 如果桶不存在，请在 Storage 界面手动创建 'story-images' 桶并设置为 Public

-- 步骤 2: 创建或更新策略
-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- 创建新策略：允许所有人读取
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT 
USING (bucket_id = 'story-images');

-- 创建新策略：允许所有人上传
CREATE POLICY "Public Upload" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'story-images');

-- 创建新策略：允许所有人删除（可选，用于未来功能）
CREATE POLICY "Public Delete" ON storage.objects
FOR DELETE 
USING (bucket_id = 'story-images');

-- 验证策略
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%story-images%';

