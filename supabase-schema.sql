-- Supabase 数据库表结构
-- 在 Supabase Dashboard 的 SQL Editor 中执行此脚本

-- 创建 stories 表
CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  story_date DATE NOT NULL,
  story_hour INTEGER NOT NULL CHECK (story_hour >= 0 AND story_hour <= 23),
  mood_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_stories_date ON stories(story_date);
CREATE INDEX IF NOT EXISTS idx_stories_date_hour ON stories(story_date, story_hour);

-- 启用 Row Level Security (可选)
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取和写入（根据你的需求调整）
-- 如果需要认证，请修改这些策略
CREATE POLICY "Allow public read access" ON stories
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON stories
  FOR INSERT WITH CHECK (true);

-- 如果需要更新和删除功能，可以添加：
-- CREATE POLICY "Allow public update access" ON stories
--   FOR UPDATE USING (true);
-- 
-- CREATE POLICY "Allow public delete access" ON stories
--   FOR DELETE USING (true);

