-- 快速修复：添加 user_id 字段到 stories 表
-- 请在 Supabase Dashboard → SQL Editor 中执行此脚本

-- 1. 添加 user_id 字段（如果不存在）
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. 为现有数据设置默认 user_id（如果有数据的话，需要手动处理）
-- 注意：如果表中已有数据，你可能需要：
-- UPDATE stories SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
-- 或者删除旧数据：
-- DELETE FROM stories WHERE user_id IS NULL;

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_date ON stories(user_id, story_date);

-- 4. 确保 RLS 已启用
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- 5. 删除旧的策略（如果存在）
DROP POLICY IF EXISTS "Users can view own stories" ON stories;
DROP POLICY IF EXISTS "Users can view all stories" ON stories;

-- 6. 创建 SELECT 策略：允许所有已登录用户查看所有故事（广场模式）
CREATE POLICY "Users can view all stories" ON stories
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 7. 创建 INSERT 策略：用户只能创建自己的故事
DROP POLICY IF EXISTS "Users can insert own stories" ON stories;
CREATE POLICY "Users can insert own stories" ON stories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 8. 创建 UPDATE 策略：用户只能更新自己的故事
DROP POLICY IF EXISTS "Users can update own stories" ON stories;
CREATE POLICY "Users can update own stories" ON stories
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. 创建 DELETE 策略：用户只能删除自己的故事
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories" ON stories
  FOR DELETE
  USING (auth.uid() = user_id);


