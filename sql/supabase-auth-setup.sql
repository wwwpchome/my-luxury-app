-- Supabase 认证和用户关联设置
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本

-- 1. 为 stories 表添加 user_id 字段（如果还没有）
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_date ON stories(user_id, story_date);

-- 3. 启用 Row Level Security (RLS)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- 4. 创建 RLS 策略：用户只能查看自己的故事
CREATE POLICY "Users can view own stories" ON stories
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. 创建 RLS 策略：用户只能创建自己的故事
CREATE POLICY "Users can insert own stories" ON stories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 6. 创建 RLS 策略：用户只能更新自己的故事
CREATE POLICY "Users can update own stories" ON stories
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. 创建 RLS 策略：用户只能删除自己的故事
CREATE POLICY "Users can delete own stories" ON stories
  FOR DELETE
  USING (auth.uid() = user_id);

-- 8. 设置 user_id 的默认值（如果数据库支持）
-- 注意：如果使用触发器，可以自动设置 user_id
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器（可选，如果希望自动设置 user_id）
-- DROP TRIGGER IF EXISTS set_user_id_trigger ON stories;
-- CREATE TRIGGER set_user_id_trigger
--   BEFORE INSERT ON stories
--   FOR EACH ROW
--   EXECUTE FUNCTION set_user_id();



