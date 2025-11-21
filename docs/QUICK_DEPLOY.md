# 🚀 快速部署指南 - 5 分钟部署到 Vercel

## 前提条件

1. ✅ 项目已构建成功（`npm run build` 通过）
2. ✅ GitHub 账户
3. ✅ Supabase 项目已设置
4. ✅ Vercel 账户（可用 GitHub 登录）

## 快速部署步骤

### 1️⃣ 推送代码到 GitHub（2 分钟）

```bash
# 初始化 Git（如果还没有）
git init
git add .
git commit -m "Initial commit - Ready for deployment"

# 在 GitHub 创建新仓库后：
git remote add origin https://github.com/yourusername/chronos.git
git branch -M main
git push -u origin main
```

### 2️⃣ 在 Vercel 部署（3 分钟）

1. **访问 Vercel**：
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账户登录

2. **导入项目**：
   - 点击 **"Add New..."** → **"Project"**
   - 选择你的 GitHub 仓库（chronos）
   - 点击 **"Import"**

3. **配置项目**（通常自动检测，检查即可）：
   - **Framework Preset**: Next.js ✅
   - **Root Directory**: `./` ✅
   - **Build Command**: `npm run build` ✅
   - **Output Directory**: `.next` ✅

4. **添加环境变量**（重要！）：
   - 点击 **"Environment Variables"**
   - 添加以下变量：

   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://your-project.supabase.co
   
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: your-anon-key-here
   
   Name: OPENAI_API_KEY (可选)
   Value: sk-...
   ```

5. **部署**：
   - 点击 **"Deploy"**
   - 等待部署完成（通常 1-2 分钟）

### 3️⃣ 配置 Supabase OAuth（1 分钟）

在 Supabase Dashboard → Authentication → URL Configuration：

1. **Site URL**：
   ```
   https://your-project.vercel.app
   ```

2. **Redirect URLs**（添加）：
   ```
   https://your-project.vercel.app/auth/callback
   ```

### 4️⃣ 测试部署（1 分钟）

访问你的部署网站（`https://your-project.vercel.app`）并测试：

- [ ] 访问登录页面
- [ ] 创建账户并登录
- [ ] 创建新故事
- [ ] 上传图片
- [ ] 切换到 Plaza 模式

---

## ✅ 完成！

你的应用现在已部署到生产环境！

### 下一步

- [ ] 添加自定义域名（在 Vercel 项目设置中）
- [ ] 配置自定义域名（更新 Supabase OAuth 回调 URL）
- [ ] 监控错误日志
- [ ] 设置备份策略

---

## 🐛 遇到问题？

### 问题 1: 构建失败
- 检查环境变量是否配置正确
- 查看 Vercel 构建日志中的错误信息

### 问题 2: 登录失败
- 检查 Supabase OAuth 回调 URL 是否配置
- 确保 Site URL 指向正确的域名

### 问题 3: 图片上传失败
- 确保已执行 SQL 脚本创建存储桶
- 检查存储桶 RLS 策略

更多故障排除信息，请查看 `docs/TROUBLESHOOTING.md`

