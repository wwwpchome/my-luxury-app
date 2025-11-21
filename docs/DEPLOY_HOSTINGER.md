# 部署到 Hostinger 指南

## 准备工作

### 1. 构建生产版本

在本地执行：

```bash
npm run build
```

确保构建成功，没有错误。

### 2. 准备环境变量

在 Hostinger 中需要配置以下环境变量：

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
OPENAI_API_KEY=your-openai-api-key
```

## Hostinger 部署方法

### 方法 1: 使用 Hostinger 的 Node.js 托管（推荐）

1. **登录 Hostinger 控制面板**
   - 访问 https://hpanel.hostinger.com
   - 登录你的账户

2. **创建 Node.js 应用**
   - 进入 **高级** → **Node.js**
   - 点击 **创建应用**
   - 选择 Node.js 版本（推荐 18.x 或 20.x）
   - 应用名称：`my-luxury-app`（或你喜欢的名称）

3. **上传项目文件**
   - 使用 FTP/SFTP 或文件管理器上传项目文件
   - **不要上传**以下文件夹/文件：
     - `node_modules/`
     - `.next/`
     - `.env.local`
     - `.git/`

4. **安装依赖**
   - 在 Hostinger 的 Node.js 控制面板中
   - 运行：`npm install --production`

5. **配置环境变量**
   - 在 Node.js 应用设置中
   - 添加环境变量（见上面的列表）

6. **构建项目**
   - 运行：`npm run build`

7. **启动应用**
   - 启动命令：`npm start`
   - 或使用 PM2：`pm2 start npm --name "my-luxury-app" -- start`

### 方法 2: 使用 Vercel（更简单，推荐）

如果 Hostinger 的 Node.js 托管配置复杂，建议使用 Vercel：

1. **准备项目**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **推送到 GitHub**
   - 创建 GitHub 仓库
   - 推送代码

3. **部署到 Vercel**
   - 访问 https://vercel.com
   - 导入 GitHub 仓库
   - 配置环境变量
   - 自动部署

4. **配置自定义域名**
   - 在 Vercel 中添加域名：`wwwpchome.com`
   - 按照提示配置 DNS

### 方法 3: 使用 Hostinger 的传统托管 + 静态导出

如果 Hostinger 不支持 Node.js，可以导出静态版本：

1. **修改 next.config.mjs**
   ```javascript
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   };
   ```

2. **构建静态版本**
   ```bash
   npm run build
   ```

3. **上传到 Hostinger**
   - 将 `out/` 文件夹内容上传到 `public_html/` 或 `www/`

**注意**：静态导出不支持 API Routes，所以 AI 润色功能将无法使用。

## 推荐方案

### 最佳选择：Vercel
- ✅ 免费
- ✅ 自动部署
- ✅ 支持 Next.js 全功能
- ✅ 可以配置自定义域名
- ✅ 全球 CDN

### 次选：Hostinger Node.js 托管
- 需要手动配置
- 可能需要付费计划

## 部署后检查清单

- [ ] 环境变量已配置
- [ ] 构建成功
- [ ] 应用可以访问
- [ ] Supabase 连接正常
- [ ] 图片上传功能正常
- [ ] AI 润色功能正常（如果使用 API Routes）

## 故障排除

### 如果遇到 500 错误
- 检查环境变量是否正确配置
- 查看服务器日志
- 确认 Node.js 版本兼容

### 如果 API Routes 不工作
- 确认使用的是 Node.js 托管，不是静态托管
- 检查路由配置
- 查看服务器日志

### 如果图片无法加载
- 检查 Supabase Storage 策略
- 确认图片 URL 可访问
- 检查 Next.js Image 配置

