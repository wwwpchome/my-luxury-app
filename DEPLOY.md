# 🚀 快速部署指南

## Vercel 部署（5 分钟）

### 步骤 1: 推送代码到 GitHub

```bash
# 如果还没有初始化 Git
git init
git add .
git commit -m "Ready for deployment"

# 在 GitHub 创建仓库后：
git remote add origin https://github.com/yourusername/chronos.git
git branch -M main
git push -u origin main
```

### 步骤 2: 在 Vercel 部署

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 **"Add New..."** → **"Project"**
3. 选择你的 GitHub 仓库
4. 配置项目：
   - **Framework**: Next.js（自动检测）
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: `.next`（默认）

5. **添加环境变量**（重要！）：
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
   OPENAI_API_KEY = sk-... (可选)
   ```

6. 点击 **"Deploy"**

### 步骤 3: 配置 Supabase OAuth

在 Supabase Dashboard → Authentication → URL Configuration：

- **Site URL**: `https://your-project.vercel.app`
- **Redirect URLs**: `https://your-project.vercel.app/auth/callback`

### 步骤 4: 添加自定义域名（可选）

在 Vercel 项目设置 → Domains 中添加你的域名。

---

## ✅ 部署前必须完成

### 1. 数据库设置

在 Supabase Dashboard → SQL Editor 中执行（按顺序）：

1. `sql/supabase-schema.sql` - 创建 stories 表
2. `sql/FIX_USER_ID.sql` - 添加 user_id 和 RLS
3. `sql/ADD_PRIVACY_SETTINGS.sql` - 添加隐私设置
4. `sql/CREATE_STORAGE_BUCKET.sql` - 创建存储桶

### 2. 本地测试

```bash
npm run build
npm start
```

访问 `http://localhost:3000` 测试所有功能。

---

## 📋 部署后测试

- [ ] 登录/注册
- [ ] 创建故事
- [ ] 上传图片
- [ ] 编辑/删除故事
- [ ] Plaza 模式
- [ ] AI 润色功能

---

## 📚 更多信息

查看 `docs/DEPLOYMENT_GUIDE.md` 获取：
- 其他部署平台（Netlify、自托管）
- 详细的故障排除
- 性能优化建议

