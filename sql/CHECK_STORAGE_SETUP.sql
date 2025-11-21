-- 检查存储桶和策略设置的脚本
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本来验证设置

-- 1. 检查存储桶是否存在
SELECT 
  name,
  id,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE name = 'story-images';

-- 如果上面的查询返回空结果，说明存储桶不存在，需要先创建

-- 2. 检查存储对象的 RLS 策略
SELECT 
  policyname AS "策略名称",
  cmd AS "命令类型",
  qual AS "USING 条件",
  with_check AS "WITH CHECK 条件"
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (
    policyname LIKE '%story-images%' 
    OR qual::text LIKE '%story-images%'
    OR with_check::text LIKE '%story-images%'
  )
ORDER BY cmd;

-- 应该看到 4 条策略：
-- - SELECT (Public Access)
-- - INSERT (Authenticated users can upload)
-- - UPDATE (Users can update own files)
-- - DELETE (Users can delete own files)

-- 3. 检查存储桶是否为 Public（应该返回 true）
SELECT 
  CASE 
    WHEN public THEN '✅ Public (正确)'
    ELSE '❌ Private (需要设置为 Public)'
  END AS "存储桶状态"
FROM storage.buckets 
WHERE name = 'story-images';


