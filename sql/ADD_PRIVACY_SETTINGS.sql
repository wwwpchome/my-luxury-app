-- 添加隐私设置功能到 stories 表
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本

-- 1. 添加 is_public 字段（默认为 true，即公开可见）
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 2. 为现有数据设置默认值（确保所有现有故事都是公开的）
UPDATE stories
SET is_public = true
WHERE is_public IS NULL;

-- 3. 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_stories_is_public ON stories(is_public);
CREATE INDEX IF NOT EXISTS idx_stories_user_public ON stories(user_id, is_public);

-- 4. 更新 RLS 策略以支持隐私设置

-- 删除旧的策略（如果存在）
DROP POLICY IF EXISTS "Users can view own stories" ON stories;
DROP POLICY IF EXISTS "Users can view all stories" ON stories;
DROP POLICY IF EXISTS "Users can view public stories" ON stories;

-- 创建新策略：用户可以查看自己的所有故事
CREATE POLICY "Users can view own stories" ON stories
  FOR SELECT
  USING (auth.uid() = user_id);

-- 创建新策略：用户可以查看所有公开的故事
CREATE POLICY "Users can view public stories" ON stories
  FOR SELECT
  USING (is_public = true AND auth.role() = 'authenticated');

-- 注意：上面两个策略会合并，允许用户：
-- 1. 查看自己的所有故事（无论 is_public 值）
-- 2. 查看所有其他用户的公开故事

-- 5. 更新 INSERT 策略：允许用户创建故事，默认设置 user_id
CREATE POLICY IF NOT EXISTS "Users can insert own stories" ON stories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. 更新 UPDATE 策略：允许用户更新自己的故事
CREATE POLICY IF NOT EXISTS "Users can update own stories" ON stories
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. 更新 DELETE 策略：允许用户删除自己的故事
CREATE POLICY IF NOT EXISTS "Users can delete own stories" ON stories
  FOR DELETE
  USING (auth.uid() = user_id);

-- 8. 验证字段是否添加成功
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'stories' 
  AND column_name = 'is_public';

-- 9. 验证策略是否创建成功
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual LIKE '%auth.uid() = user_id%' THEN 'Own stories'
    WHEN qual LIKE '%is_public = true%' THEN 'Public stories'
    ELSE 'Other'
  END AS policy_type
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'stories';

