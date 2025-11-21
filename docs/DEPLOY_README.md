# 🚀 快速部署 - 3 步完成

## 步骤 1: 推送代码到 GitHub

```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/yourusername/chronos.git
git push -u origin main
```

## 步骤 2: 在 Vercel 部署

1. 访问 [vercel.com](https://vercel.com) 并登录
2. 点击 **"Add New..."** → **"Project"**
3. 选择你的 GitHub 仓库
4. 添加环境变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   OPENAI_API_KEY=sk-... (可选)
   ```
5. 点击 **"Deploy"**

## 步骤 3: 配置 Supabase OAuth

在 Supabase Dashboard → Authentication → URL Configuration：

- **Site URL**: `https://your-project.vercel.app`
- **Redirect URLs**: `https://your-project.vercel.app/auth/callback`

---

## ✅ 完成！

你的应用已部署！访问 `https://your-project.vercel.app` 查看。

---

## 📋 部署前必须完成

在 Supabase Dashboard → SQL Editor 中执行（按顺序）：

1. `sql/supabase-schema.sql`
2. `sql/FIX_USER_ID.sql`
3. `sql/ADD_PRIVACY_SETTINGS.sql`
4. `sql/CREATE_STORAGE_BUCKET.sql`

详细说明请查看 `DEPLOY.md`

