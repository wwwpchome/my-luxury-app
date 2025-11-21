-- Supabase 广场模式 RLS 策略更新
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本

-- 1. 更新 SELECT 策略，允许所有已登录用户查看所有故事（广场模式）
-- 首先删除旧的策略（如果存在）
DROP POLICY IF EXISTS "Users can view own stories" ON stories;

-- 创建新策略：允许所有已登录用户查看所有故事
CREATE POLICY "Users can view all stories" ON stories
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2. 保持其他策略不变（用户只能创建/更新/删除自己的故事）
-- INSERT 策略保持不变
-- UPDATE 策略保持不变
-- DELETE 策略保持不变

-- 3. 可选：创建一个视图来获取故事及其用户信息（如果 users 表存在）
-- 注意：这需要根据你的实际数据库结构调整
-- CREATE OR REPLACE VIEW stories_with_users AS
-- SELECT 
--   s.*,
--   u.email as user_email,
--   u.avatar_url as user_avatar_url
-- FROM stories s
-- LEFT JOIN auth.users u ON s.user_id = u.id;



