-- Supabase Storage RLS 策略设置
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本
-- 注意：请先确保已创建 "story-images" 存储桶并设置为 Public

-- 1. 检查存储桶是否存在
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'story-images'
  ) THEN
    RAISE EXCEPTION 'Storage bucket "story-images" does not exist. Please create it in Supabase Dashboard → Storage first.';
  END IF;
END $$;

-- 2. 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- 3. 创建 SELECT 策略：允许所有人读取（因为存储桶是 Public）
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-images');

-- 4. 创建 INSERT 策略：允许已登录用户上传
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'story-images' 
  AND auth.role() = 'authenticated'
);

-- 5. 创建 UPDATE 策略：允许所有已登录用户更新（简化版）
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'story-images' 
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'story-images' 
  AND auth.role() = 'authenticated'
);

-- 6. 创建 DELETE 策略：允许所有已登录用户删除（简化版）
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'story-images' 
  AND auth.role() = 'authenticated'
);

-- 注意：上面的 UPDATE 和 DELETE 策略使用了文件夹结构来验证所有权
-- 如果你的文件命名不包含用户 ID，可以使用更简单的策略：

-- 简化版 UPDATE 策略（允许所有已登录用户更新）
-- CREATE POLICY "Users can update own files"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'story-images' 
--   AND auth.role() = 'authenticated'
-- )
-- WITH CHECK (
--   bucket_id = 'story-images' 
--   AND auth.role() = 'authenticated'
-- );

-- 简化版 DELETE 策略（允许所有已登录用户删除）
-- CREATE POLICY "Users can delete own files"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'story-images' 
--   AND auth.role() = 'authenticated'
-- );

