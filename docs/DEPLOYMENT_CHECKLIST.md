# 部署前检查清单

## ✅ 构建测试

- [x] 本地构建成功 (`npm run build`)
- [ ] 生产版本测试 (`npm start`)

## 📋 必需的环境变量

确保在部署平台配置以下环境变量：

### 必需变量：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 可选变量（AI 润色功能）：
```env
OPENAI_API_KEY=sk-...
```

## 🗄️ 数据库设置

在 Supabase Dashboard → SQL Editor 中执行以下脚本（按顺序）：

1. **创建表结构**：
   - [ ] `sql/supabase-schema.sql`

2. **添加用户关联**：
   - [ ] `sql/FIX_USER_ID.sql`

3. **添加隐私设置**：
   - [ ] `sql/ADD_PRIVACY_SETTINGS.sql`

4. **创建存储桶**：
   - [ ] `sql/CREATE_STORAGE_BUCKET.sql`
   - [ ] `sql/UPDATE_STORAGE_RLS_FOR_USER_FOLDERS.sql`

5. **验证设置**：
   - [ ] 访问 `/test-db` 页面检查所有设置

## 🔐 OAuth 配置

在 Supabase Dashboard → Authentication → URL Configuration：

- [ ] **Site URL**: 设置为部署后的域名（如：`https://your-app.vercel.app`）
- [ ] **Redirect URLs**: 添加 `https://your-app.vercel.app/auth/callback`

## ✅ 部署后测试

- [ ] 访问部署的网站
- [ ] 登录/注册功能
- [ ] 创建故事
- [ ] 上传图片
- [ ] 编辑/删除故事
- [ ] Plaza 模式
- [ ] AI 润色功能（如果配置了 API Key）
- [ ] 移动端响应式

## 📝 部署步骤

### Vercel（推荐）

1. [ ] 推送代码到 GitHub
2. [ ] 在 Vercel 导入项目
3. [ ] 配置环境变量
4. [ ] 更新 Supabase OAuth 回调 URL
5. [ ] 部署并测试

详细步骤请参考：`DEPLOYMENT.md`

