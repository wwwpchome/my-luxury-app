-- 创建 story-images 存储桶并配置 RLS 策略
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本

-- 步骤 1: 创建存储桶（如果不存在）
-- 注意：如果存储桶已存在，这个操作会被忽略
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'story-images',
  'story-images',
  true, -- 设置为 Public
  52428800, -- 50 MB 文件大小限制
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800;

-- 步骤 2: 删除旧的 RLS 策略（如果存在）
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own files" ON storage.objects;

-- 步骤 3: 创建 RLS 策略 - 允许所有人读取（Public 存储桶）
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-images');

-- 步骤 4: 创建 RLS 策略 - 允许已认证用户上传
CREATE POLICY "Allow authenticated upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'story-images' AND
  auth.role() = 'authenticated'
);

-- 步骤 5: 创建 RLS 策略 - 允许用户更新自己上传的文件
CREATE POLICY "Allow users to update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'story-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'story-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 步骤 6: 创建 RLS 策略 - 允许用户删除自己上传的文件
CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'story-images' AND
  (auth.role() = 'authenticated')
);

-- 验证存储桶是否创建成功
SELECT 
  name,
  public,
  file_size_limit,
  created_at
FROM storage.buckets 
WHERE name = 'story-images';

-- 验证 RLS 策略是否创建成功
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%story-images%' OR qual::text LIKE '%story-images%';

