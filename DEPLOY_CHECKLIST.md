# 部署检查清单

## 部署前必须完成

### 1. 修复 Supabase Storage RLS ✅
- [ ] 在 Supabase Dashboard 执行 `QUICK_FIX_STORAGE.sql`
- [ ] 确认 `story-images` 桶存在且为 Public
- [ ] 测试图片上传功能

### 2. 数据库字段 ✅
- [ ] 确认 `stories` 表有 `image_path` 字段
- [ ] 如果缺失，执行 `supabase-add-image-field.sql`

### 3. 环境变量准备
- [ ] 准备 Supabase URL 和 Key
- [ ] 准备 OpenAI API Key
- [ ] 在部署平台配置这些变量

### 4. 构建测试
- [ ] 本地运行 `npm run build` 成功
- [ ] 本地运行 `npm start` 测试生产版本
- [ ] 测试所有功能：
  - [ ] 创建故事
  - [ ] 上传图片
  - [ ] AI 润色
  - [ ] 查看时间轴

## 部署选项对比

### 选项 1: Vercel（最推荐）⭐
**优点：**
- 免费计划
- 自动部署
- 完美支持 Next.js
- 全球 CDN
- 简单配置自定义域名

**步骤：**
1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 添加自定义域名 `wwwpchome.com`

### 选项 2: Hostinger Node.js 托管
**优点：**
- 使用现有 Hostinger 账户
- 完全控制

**缺点：**
- 需要手动配置
- 可能需要付费计划
- 配置较复杂

**步骤：**
1. 在 Hostinger 创建 Node.js 应用
2. 上传项目文件（排除 node_modules, .next）
3. 运行 `npm install --production`
4. 配置环境变量
5. 运行 `npm run build`
6. 运行 `npm start` 或使用 PM2

### 选项 3: Hostinger 静态托管（不推荐）
**限制：**
- ❌ API Routes 不工作（AI 润色功能失效）
- ❌ 需要修改配置为静态导出

## 推荐部署流程

### 使用 Vercel（最简单）

```bash
# 1. 初始化 Git（如果还没有）
git init
git add .
git commit -m "Ready for deployment"

# 2. 推送到 GitHub
# 在 GitHub 创建仓库，然后：
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main

# 3. 在 Vercel 部署
# - 访问 vercel.com
# - 导入 GitHub 仓库
# - 配置环境变量
# - 添加域名 wwwpchome.com
```

## 部署后验证

- [ ] 网站可以访问
- [ ] 日历选择器工作
- [ ] 可以创建故事
- [ ] 图片上传功能正常
- [ ] AI 润色功能正常
- [ ] 时间轴显示正常
- [ ] 移动端响应式正常

## 故障排除

### 如果图片上传失败
- 检查 Supabase Storage 策略
- 确认桶是 Public
- 查看浏览器控制台错误

### 如果 AI 润色不工作
- 检查 OPENAI_API_KEY 环境变量
- 查看服务器日志
- 确认 API Route 可访问

### 如果数据库操作失败
- 检查 Supabase 环境变量
- 确认数据库表结构正确
- 查看 Supabase 日志

