-- 设置存储桶为 Public
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本

-- 1. 检查存储桶是否存在
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'story-images'
  ) THEN
    RAISE EXCEPTION 'Storage bucket "story-images" does not exist. Please create it in Supabase Dashboard → Storage first.';
  END IF;
END $$;

-- 2. 设置存储桶为 Public
UPDATE storage.buckets 
SET public = true 
WHERE name = 'story-images';

-- 3. 验证设置
SELECT 
  name,
  public,
  CASE 
    WHEN public THEN '✅ 存储桶已设置为 Public'
    ELSE '❌ 存储桶仍然是 Private'
  END AS "状态"
FROM storage.buckets 
WHERE name = 'story-images';


