# 用户认证功能设置指南

## ✅ 已完成的功能

### 1. 依赖安装
- ✅ 安装了 `@supabase/ssr` 用于 Next.js App Router 的认证

### 2. Auth Utilities
- ✅ 创建了 `lib/supabase/server.ts` - 服务端客户端
- ✅ 创建了 `lib/supabase/client.ts` - 浏览器客户端
- ✅ 基于 Cookie 管理 Session

### 3. 登录页面
- ✅ 创建了 `app/login/page.tsx`
- ✅ 极简优雅的登录卡片设计
- ✅ Email 和 Password 输入框
- ✅ Sign In 和 Sign Up 功能
- ✅ 错误处理和加载状态

### 4. 首页修改
- ✅ 添加了登录检查，未登录自动重定向到 `/login`
- ✅ 显示当前登录用户的邮箱
- ✅ 添加了 Sign Out 按钮

### 5. 数据关联
- ✅ 修改了 `createStory` 函数，自动关联 `user_id`
- ✅ 修改了 `getStoriesForDate` 函数，只获取当前用户的故事
- ✅ 使用 `auth.uid()` 获取用户 ID

### 6. 中间件
- ✅ 创建了 `middleware.ts` 处理认证和路由保护

## 📋 数据库设置步骤

### 步骤 1: 添加 user_id 字段和 RLS 策略

在 Supabase Dashboard 的 SQL Editor 中执行 `supabase-auth-setup.sql`：

```sql
-- 添加 user_id 字段
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_date ON stories(user_id, story_date);

-- 启用 RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own stories" ON stories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stories" ON stories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories" ON stories
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own stories" ON stories
  FOR DELETE USING (auth.uid() = user_id);
```

### 步骤 2: 配置 Supabase Auth

1. 在 Supabase Dashboard 中，进入 **Authentication** → **Settings**
2. 确保 **Enable Email Signup** 已启用
3. （可选）配置 **Email Templates** 自定义注册邮件
4. （可选）配置 **Redirect URLs** 添加你的域名

## 🔒 安全特性

### Row Level Security (RLS)
- ✅ 用户只能查看自己的故事
- ✅ 用户只能创建自己的故事
- ✅ 用户只能更新自己的故事
- ✅ 用户只能删除自己的故事

### Session 管理
- ✅ 使用 Cookie 管理 Session
- ✅ 中间件自动刷新 Session
- ✅ 客户端和服务端同步

## 🎨 功能特点

### 登录页面
- 极简设计，黑白灰配色
- 响应式布局
- 实时错误提示
- 加载状态显示

### 首页集成
- 自动登录检查
- 用户信息显示
- 一键退出登录
- 无缝用户体验

## 📁 创建的文件

- `lib/supabase/server.ts` - 服务端 Supabase 客户端
- `lib/supabase/client.ts` - 浏览器 Supabase 客户端
- `app/login/page.tsx` - 登录页面
- `middleware.ts` - 认证中间件
- `supabase-auth-setup.sql` - 数据库设置脚本

## 🔧 修改的文件

- `app/page.tsx` - 添加登录检查和用户信息
- `lib/stories.ts` - 关联用户 ID
- `components/shared/story-sheet.tsx` - 使用新的客户端

## 🚀 使用流程

1. **注册新用户**：
   - 访问 `/login`
   - 点击 "Don't have an account? Sign Up"
   - 输入邮箱和密码（至少6位）
   - 点击 "Sign Up"
   - 检查邮箱验证链接（如果启用了邮箱验证）

2. **登录**：
   - 访问 `/login`
   - 输入邮箱和密码
   - 点击 "Sign In"
   - 自动跳转到首页

3. **退出登录**：
   - 在首页左侧边栏底部
   - 点击 "Sign Out" 按钮
   - 自动跳转到登录页

## ⚠️ 重要提示

1. **数据库迁移**：必须执行 `supabase-auth-setup.sql` 才能正常工作
2. **RLS 策略**：确保所有策略都正确创建
3. **邮箱验证**：如果启用了邮箱验证，用户需要验证邮箱才能登录
4. **环境变量**：确保 `.env.local` 和 Vercel 环境变量都配置正确

## 🔍 故障排除

### 如果登录后仍然重定向到登录页
- 检查中间件是否正确配置
- 检查 Cookie 是否被正确设置
- 查看浏览器控制台错误

### 如果无法创建故事
- 检查 `user_id` 字段是否存在
- 检查 RLS 策略是否正确
- 查看 Supabase 日志

### 如果看不到自己的故事
- 检查 `getStoriesForDate` 是否正确过滤用户
- 检查 RLS 策略中的 SELECT 策略

## ✨ 后续优化建议

- [ ] 添加密码重置功能
- [ ] 添加社交登录（Google, GitHub 等）
- [ ] 添加用户资料页面
- [ ] 添加邮箱验证提示
- [ ] 添加记住我功能

