# 部署指南 - Chronos

完整的部署指南，适用于 Vercel、Netlify 和其他平台。

## 📋 部署前检查清单

### 1. 数据库设置 ✅

在 Supabase Dashboard 中执行以下 SQL 脚本（按顺序）：

1. **创建表结构**：
   - `sql/supabase-schema.sql` - 创建 stories 表

2. **添加用户关联**：
   - `sql/FIX_USER_ID.sql` - 添加 user_id 字段和 RLS 策略

3. **添加隐私设置**：
   - `sql/ADD_PRIVACY_SETTINGS.sql` - 添加 is_public 字段

4. **创建存储桶**：
   - `sql/CREATE_STORAGE_BUCKET.sql` - 创建 story-images 存储桶
   - `sql/UPDATE_STORAGE_RLS_FOR_USER_FOLDERS.sql` - 配置存储桶 RLS

### 2. 环境变量准备

需要以下环境变量：

```env
# Supabase（必需）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI（可选，用于 AI 润色功能）
OPENAI_API_KEY=your-openai-api-key
```

### 3. 本地构建测试

在部署前，先测试本地构建：

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 测试生产版本
npm start
```

访问 `http://localhost:3000` 验证所有功能正常。

## 🚀 部署选项

### 选项 1: Vercel（推荐）⭐

**优点：**
- ✅ 免费计划
- ✅ 自动部署（连接 GitHub）
- ✅ 完美支持 Next.js
- ✅ 全球 CDN
- ✅ 自动 HTTPS
- ✅ 简单配置自定义域名

#### 部署步骤：

**方法 A: 通过 GitHub（推荐）**

1. **推送代码到 GitHub**：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/chronos.git
   git push -u origin main
   ```

2. **在 Vercel 部署**：
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Add New..." → "Project"
   - 导入你的 GitHub 仓库
   - 配置项目设置：
     - **Framework Preset**: Next.js
     - **Root Directory**: `./`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. **配置环境变量**：
   在 Vercel 项目设置 → Environment Variables 中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`（可选）

4. **添加自定义域名**：
   - 在项目设置 → Domains 中添加域名
   - 按照提示配置 DNS 记录

**方法 B: 通过 Vercel CLI**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 生产环境部署
vercel --prod
```

### 选项 2: Netlify

**优点：**
- ✅ 免费计划
- ✅ 自动部署
- ✅ 支持 Next.js

#### 部署步骤：

1. **推送代码到 GitHub**（同上）

2. **在 Netlify 部署**：
   - 访问 [netlify.com](https://netlify.com)
   - 点击 "Add new site" → "Import an existing project"
   - 连接 GitHub 并选择仓库
   - 配置构建设置：
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`
     - **Framework**: Next.js

3. **配置环境变量**：
   - 在 Site settings → Environment variables 中添加变量

4. **更新配置文件**：
   创建 `netlify.toml`：
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

### 选项 3: 自托管（Node.js 服务器）

适用于 VPS、云服务器等。

#### 部署步骤：

1. **在服务器上克隆项目**：
   ```bash
   git clone https://github.com/yourusername/chronos.git
   cd chronos
   ```

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **配置环境变量**：
   ```bash
   # 创建 .env.local 文件
   nano .env.local
   
   # 添加环境变量
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   OPENAI_API_KEY=...
   ```

4. **构建项目**：
   ```bash
   npm run build
   ```

5. **使用 PM2 运行**（推荐）：
   ```bash
   # 安装 PM2
   npm install -g pm2
   
   # 启动应用
   pm2 start npm --name "chronos" -- start
   
   # 保存 PM2 配置
   pm2 save
   pm2 startup
   ```

6. **配置 Nginx 反向代理**：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
   
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **配置 SSL**：
   ```bash
   # 使用 Let's Encrypt
   sudo certbot --nginx -d your-domain.com
   ```

## 🔧 部署配置

### Vercel 配置

项目已包含 `vercel.json`，无需额外配置。

### Next.js 配置

`next.config.mjs` 已配置 Supabase 图片域名。

### 环境变量

#### 必需的环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 可选的环境变量：

```env
OPENAI_API_KEY=sk-...  # 用于 AI 润色功能
```

## ✅ 部署后验证

### 功能检查清单：

- [ ] **登录功能**：
  - [ ] 可以访问登录页面
  - [ ] 可以注册新账户
  - [ ] 可以登录现有账户
  - [ ] OAuth 登录（Google/GitHub）工作正常

- [ ] **故事功能**：
  - [ ] 可以创建新故事
  - [ ] 可以编辑故事
  - [ ] 可以删除故事
  - [ ] 可以上传图片
  - [ ] 隐私设置工作正常

- [ ] **Plaza 模式**：
  - [ ] 可以访问 Plaza 页面
  - [ ] 只显示公开的故事
  - [ ] 用户信息显示正确

- [ ] **其他功能**：
  - [ ] 日历高亮有故事的日期
  - [ ] AI 润色功能（如果配置了 API Key）
  - [ ] 响应式设计正常

### 测试步骤：

1. **访问部署的网站**
2. **创建账户并登录**
3. **创建几个测试故事**（包括上传图片）
4. **测试编辑和删除功能**
5. **切换到 Plaza 模式查看公开故事**
6. **测试不同日期的故事显示**

## 🐛 常见问题

### 问题 1: 构建失败

**可能原因：**
- TypeScript 错误
- 缺少依赖
- 环境变量未设置

**解决方案：**
1. 检查构建日志中的错误信息
2. 确保所有依赖都已安装：`npm install`
3. 确保环境变量已正确配置

### 问题 2: 运行时错误

**可能原因：**
- 环境变量未设置
- 数据库连接失败
- RLS 策略未配置

**解决方案：**
1. 检查环境变量是否已配置
2. 访问 `/test-db` 页面检查数据库连接
3. 执行 SQL 脚本配置数据库

### 问题 3: 图片上传失败

**可能原因：**
- 存储桶不存在
- RLS 策略未配置
- 存储桶不是 Public

**解决方案：**
1. 在 Supabase Dashboard 中检查存储桶是否存在
2. 执行 `sql/CREATE_STORAGE_BUCKET.sql`
3. 执行 `sql/UPDATE_STORAGE_RLS_FOR_USER_FOLDERS.sql`

### 问题 4: 认证失败

**可能原因：**
- OAuth 回调 URL 未配置
- 环境变量不正确

**解决方案：**
1. 在 Supabase Dashboard → Authentication → URL Configuration 中：
   - 添加 **Site URL**: `https://your-domain.com`
   - 添加 **Redirect URLs**: `https://your-domain.com/auth/callback`
2. 确保环境变量中的 URL 和 Key 正确

## 🔐 安全性检查

- [ ] 环境变量未提交到 Git
- [ ] `.env.local` 在 `.gitignore` 中
- [ ] 使用 HTTPS（生产环境）
- [ ] RLS 策略已正确配置
- [ ] 敏感 API Key 未暴露在前端代码中

## 📊 性能优化

### 已实施的优化：

- ✅ Next.js 图片优化
- ✅ SWR 缓存策略
- ✅ 代码分割（自动）
- ✅ Tailwind CSS 优化

### 可选的优化：

- [ ] 启用 Supabase CDN
- [ ] 配置图片 CDN
- [ ] 添加服务端缓存
- [ ] 启用数据库连接池

## 🎉 部署成功！

部署完成后：
1. ✅ 测试所有功能
2. ✅ 监控错误日志
3. ✅ 设置域名（如需要）
4. ✅ 配置备份策略

如有问题，请参考 `docs/TROUBLESHOOTING.md` 或查看部署平台的日志。

