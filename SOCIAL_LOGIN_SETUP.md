# 社交登录和广场模式设置指南

## ✅ 已完成的功能

### 1. 社交登录功能
- ✅ 添加了 Google 登录按钮
- ✅ 添加了 GitHub 登录按钮
- ✅ 创建了 OAuth 回调路由 (`/auth/callback`)
- ✅ 优雅的 UI 设计，包含分隔线和图标

### 2. 广场模式
- ✅ 创建了 `/plaza` 页面，显示所有用户的故事
- ✅ 更新了 `Timeline` 组件，支持显示用户信息
- ✅ 在首页和广场页面之间添加了导航
- ✅ 更新了 `stories.ts`，添加了 `getAllStoriesForDate` 函数

### 3. 导航功能
- ✅ 在首页添加了 "Plaza" 按钮
- ✅ 在广场页面添加了 "My Stories" 按钮
- ✅ 清晰的视觉区分（当前页面按钮为 disabled 状态）

## 📋 Supabase 配置步骤

### 步骤 1: 配置社交登录提供商

#### Google OAuth 设置

1. **在 Google Cloud Console 中创建项目**：
   - 访问 [Google Cloud Console](https://console.cloud.google.com/)
   - 创建新项目或选择现有项目
   - 启用 Google+ API

2. **创建 OAuth 2.0 凭据**：
   - 进入 "APIs & Services" → "Credentials"
   - 点击 "Create Credentials" → "OAuth client ID"
   - 选择 "Web application"
   - 添加授权重定向 URI：
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
   - 复制 **Client ID** 和 **Client Secret**

3. **在 Supabase 中配置**：
   - 进入 Supabase Dashboard → **Authentication** → **Providers**
   - 找到 **Google** 提供商
   - 启用 Google 提供商
   - 填入：
     - **Client ID (for OAuth)**: 你的 Google Client ID
     - **Client Secret (for OAuth)**: 你的 Google Client Secret
   - 点击 "Save"

#### GitHub OAuth 设置

1. **在 GitHub 中创建 OAuth App**：
   - 访问 [GitHub Developer Settings](https://github.com/settings/developers)
   - 点击 "New OAuth App"
   - 填写：
     - **Application name**: Chronos (或你喜欢的名称)
     - **Homepage URL**: `https://<your-project-ref>.supabase.co`
     - **Authorization callback URL**: 
       ```
       https://<your-project-ref>.supabase.co/auth/v1/callback
       ```
   - 点击 "Register application"
   - 复制 **Client ID** 和 **Client Secret**

2. **在 Supabase 中配置**：
   - 进入 Supabase Dashboard → **Authentication** → **Providers**
   - 找到 **GitHub** 提供商
   - 启用 GitHub 提供商
   - 填入：
     - **Client ID (for OAuth)**: 你的 GitHub Client ID
     - **Client Secret (for OAuth)**: 你的 GitHub Client Secret
   - 点击 "Save"

### 步骤 2: 配置重定向 URL

在 Supabase Dashboard → **Authentication** → **URL Configuration**：

1. 添加 **Site URL**（生产环境）：
   ```
   https://your-domain.com
   ```

2. 添加 **Redirect URLs**（开发和生产）：
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```

### 步骤 3: 更新 RLS 策略（广场模式）

在 Supabase Dashboard 的 SQL Editor 中执行 `supabase-plaza-rls.sql`：

```sql
-- 删除旧的 SELECT 策略
DROP POLICY IF EXISTS "Users can view own stories" ON stories;

-- 创建新策略：允许所有已登录用户查看所有故事（广场模式）
CREATE POLICY "Users can view all stories" ON stories
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

**重要说明**：
- 这个策略允许所有已登录用户查看所有故事
- 用户仍然只能创建/更新/删除自己的故事（其他策略保持不变）
- 如果你希望更细粒度的控制，可以创建更复杂的策略

## 🎨 功能特点

### 社交登录
- **Google 登录**：一键使用 Google 账号登录
- **GitHub 登录**：开发者友好的 GitHub 登录
- **优雅的 UI**：分隔线、图标、统一的按钮样式
- **错误处理**：完整的错误提示和加载状态

### 广场模式
- **查看所有故事**：浏览所有用户在同一日期的故事
- **用户标识**：每个故事显示用户 ID（前 8 位）
- **日期选择**：可以查看不同日期的广场内容
- **无缝导航**：在个人故事和广场之间轻松切换

## 📁 创建/修改的文件

### 新文件
- `app/auth/callback/route.ts` - OAuth 回调处理
- `app/plaza/page.tsx` - 广场页面
- `supabase-plaza-rls.sql` - RLS 策略更新脚本
- `SOCIAL_LOGIN_SETUP.md` - 本设置文档

### 修改的文件
- `app/login/page.tsx` - 添加社交登录按钮
- `app/page.tsx` - 添加广场导航
- `lib/stories.ts` - 添加 `getAllStoriesForDate` 函数
- `components/shared/timeline.tsx` - 支持显示用户信息

## 🚀 使用流程

### 社交登录
1. **访问登录页面** (`/login`)
2. **选择登录方式**：
   - 使用 Email/Password（传统方式）
   - 点击 "Google" 或 "GitHub" 按钮
3. **OAuth 流程**：
   - 跳转到提供商登录页面
   - 授权后自动回调到应用
   - 自动登录并跳转到首页

### 广场模式
1. **从首页进入**：
   - 点击左侧边栏的 "Plaza" 按钮
   - 跳转到 `/plaza` 页面
2. **浏览故事**：
   - 选择日期查看该日期的所有故事
   - 每个故事显示用户 ID（前 8 位）
   - 可以查看图片、内容、心情颜色
3. **返回个人故事**：
   - 点击 "My Stories" 按钮
   - 返回首页查看自己的故事

## ⚠️ 重要提示

### 安全考虑
1. **RLS 策略**：确保执行了 `supabase-plaza-rls.sql` 来更新策略
2. **OAuth 配置**：确保重定向 URL 配置正确
3. **环境变量**：确保 `.env.local` 和 Vercel 环境变量都配置正确

### 开发环境
- 本地开发时，重定向 URL 应该是 `http://localhost:3000/auth/callback`
- 确保 Supabase 项目配置了正确的重定向 URL

### 生产环境
- 更新 Site URL 和 Redirect URLs 为生产域名
- 确保 OAuth 提供商中的回调 URL 也更新为生产域名

## 🔍 故障排除

### 社交登录不工作
- **检查 OAuth 配置**：确保 Client ID 和 Secret 正确
- **检查重定向 URL**：确保在 Supabase 和 OAuth 提供商中都配置正确
- **查看浏览器控制台**：检查是否有错误信息
- **查看 Supabase 日志**：在 Dashboard → Logs 中查看认证日志

### 广场模式看不到故事
- **检查 RLS 策略**：确保执行了 `supabase-plaza-rls.sql`
- **检查用户登录状态**：确保用户已登录
- **检查数据库**：确保有故事数据存在
- **查看网络请求**：在浏览器开发者工具中检查 API 请求

### 用户信息不显示
- 当前实现显示用户 ID 的前 8 位
- 如果需要显示用户名或邮箱，需要：
  1. 创建 `users` 表或使用 `auth.users`
  2. 在查询时 JOIN 用户表
  3. 更新 `Timeline` 组件显示用户信息

## ✨ 后续优化建议

- [ ] 添加更多社交登录提供商（Twitter, Facebook 等）
- [ ] 在广场模式中显示用户名/头像而不是用户 ID
- [ ] 添加故事点赞/评论功能
- [ ] 添加故事筛选（按用户、心情等）
- [ ] 添加故事搜索功能
- [ ] 添加用户资料页面
- [ ] 添加关注/粉丝功能

