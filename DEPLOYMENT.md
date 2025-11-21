# 🚀 部署指南 - Chronos

## ✅ 构建状态

**构建成功！** ✓

```
✓ Compiled successfully
✓ Generating static pages (10/10)
✓ Finalizing page optimization
```

## 📋 部署前检查清单

### 1. 数据库设置（必须在部署前完成）

在 Supabase Dashboard → SQL Editor 中执行以下脚本（按顺序）：

1. ✅ `sql/supabase-schema.sql` - 创建 stories 表
2. ✅ `sql/FIX_USER_ID.sql` - 添加 user_id 字段和 RLS 策略
3. ✅ `sql/ADD_PRIVACY_SETTINGS.sql` - 添加隐私设置功能
4. ✅ `sql/CREATE_STORAGE_BUCKET.sql` - 创建存储桶
5. ✅ `sql/UPDATE_STORAGE_RLS_FOR_USER_FOLDERS.sql` - 配置存储桶 RLS

### 2. 环境变量准备

**必需的环境变量：**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**可选的环境变量：**
```env
OPENAI_API_KEY=sk-...  # 用于 AI 润色功能
```

### 3. 本地测试

```bash
# 构建项目
npm run build

# 测试生产版本
npm start
```

访问 `http://localhost:3000` 并测试所有功能。

---

## 🚀 Vercel 部署（推荐）

### 方法 1: 通过 GitHub（推荐）

1. **推送代码到 GitHub**：
   ```bash
   git init
   git add .
   git commit -m "Ready for deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/chronos.git
   git push -u origin main
   ```

2. **在 Vercel 部署**：
   - 访问 [vercel.com](https://vercel.com)
   - 点击 **"Add New..."** → **"Project"**
   - 选择你的 GitHub 仓库
   - 配置环境变量（见下方）
   - 点击 **"Deploy"**

3. **配置环境变量**：
   在 Vercel 项目设置 → Environment Variables 中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`（可选）

### 方法 2: 通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

### 配置 Supabase OAuth

部署后，在 Supabase Dashboard → Authentication → URL Configuration：

- **Site URL**: `https://your-project.vercel.app`
- **Redirect URLs**: `https://your-project.vercel.app/auth/callback`

---

## 🌐 添加自定义域名

1. 在 Vercel 项目设置 → Domains 中添加域名
2. 按照提示配置 DNS 记录
3. 更新 Supabase OAuth 回调 URL 为你的自定义域名

---

## ✅ 部署后验证

访问部署的网站并测试：

- [ ] 登录/注册功能
- [ ] 创建故事
- [ ] 上传图片
- [ ] 编辑/删除故事
- [ ] Plaza 模式
- [ ] AI 润色功能（如果配置了 API Key）
- [ ] 移动端响应式

---

## 📚 详细文档

查看 `docs/` 目录获取更多信息：
- `docs/DEPLOYMENT_GUIDE.md` - 完整部署指南
- `docs/QUICK_DEPLOY.md` - 5 分钟快速部署
- `docs/DEPLOYMENT_CHECKLIST.md` - 部署检查清单
- `docs/TROUBLESHOOTING.md` - 故障排除

---

## 🎉 部署成功！

你的应用现在已准备好部署到生产环境！

