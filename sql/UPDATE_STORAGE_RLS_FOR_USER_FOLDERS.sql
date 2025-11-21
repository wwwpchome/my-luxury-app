-- 更新存储桶 RLS 策略以支持按用户ID组织的文件夹结构
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本
-- 此脚本假设存储桶已存在，如果不存在，请先执行 CREATE_STORAGE_BUCKET.sql

-- 1. 删除旧的 RLS 策略（如果存在）
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- 2. 创建新的 RLS 策略 - 支持按用户ID组织的文件夹结构

-- 策略 1: 允许所有人读取（因为存储桶是 Public）
-- 文件路径格式: {user_id}/{filename}
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-images');

-- 策略 2: 允许已认证用户上传到自己的文件夹
-- 文件路径必须包含用户的 ID: {user_id}/{filename}
CREATE POLICY "Allow authenticated upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'story-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 策略 3: 允许用户更新自己文件夹中的文件
CREATE POLICY "Allow users to update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'story-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'story-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 策略 4: 允许用户删除自己文件夹中的文件
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'story-images' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. 验证策略是否创建成功
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN policyname LIKE '%read%' THEN 'Read (Public)'
    WHEN policyname LIKE '%upload%' OR policyname LIKE '%INSERT%' THEN 'Upload (Own folder)'
    WHEN policyname LIKE '%update%' THEN 'Update (Own files)'
    WHEN policyname LIKE '%delete%' THEN 'Delete (Own files)'
    ELSE 'Other'
  END AS policy_type
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (
    policyname LIKE '%story-images%' 
    OR qual::text LIKE '%story-images%'
    OR with_check::text LIKE '%story-images%'
  );

-- 说明：
-- 文件将按以下结构组织：
-- story-images/
--   ├── {user_id_1}/
--   │   ├── {story_id}-{timestamp}.jpg
--   │   └── {story_id}-{timestamp}.png
--   ├── {user_id_2}/
--   │   └── {story_id}-{timestamp}.jpg
--   └── ...

