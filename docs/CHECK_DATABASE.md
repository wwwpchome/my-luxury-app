# 数据库连接检查指南

## 快速检查

### 方法 1: 使用检查脚本

```bash
npx tsx scripts/check-db-connection.ts
```

### 方法 2: 手动检查环境变量

1. 检查 `.env.local` 文件是否存在（在项目根目录）
2. 确保包含以下变量：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 方法 3: 在浏览器控制台检查

打开浏览器控制台（F12），运行：

```javascript
// 检查环境变量是否已加载
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '已设置' : '未设置');
```

## 常见错误和解决方案

### 错误 1: "relation 'stories' does not exist"

**原因**: stories 表不存在

**解决方案**:
1. 在 Supabase Dashboard 中打开 SQL Editor
2. 执行 `supabase-schema.sql` 文件中的 SQL
3. 或者手动创建表

### 错误 2: "JWT expired" 或 "Invalid API key"

**原因**: API Key 不正确或已过期

**解决方案**:
1. 在 Supabase Dashboard 中:
   - 进入 Settings → API
   - 复制正确的 `anon` `public` key
2. 更新 `.env.local` 中的 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 错误 3: "Network error" 或 "Failed to fetch"

**原因**: 
- Supabase URL 不正确
- 网络连接问题
- CORS 配置问题

**解决方案**:
1. 检查 `.env.local` 中的 `NEXT_PUBLIC_SUPABASE_URL`
2. URL 格式应该是: `https://xxxxx.supabase.co`
3. 确保没有多余的斜杠

### 错误 4: "new row violates row-level security policy"

**原因**: RLS (Row Level Security) 策略未正确配置

**解决方案**:
1. 执行 `supabase-auth-setup.sql` 设置用户级访问
2. 执行 `supabase-plaza-rls.sql` 设置 Plaza 模式访问

### 错误 5: 存储桶不存在

**原因**: story-images 存储桶未创建

**解决方案**:
1. 在 Supabase Dashboard 中:
   - 进入 Storage
   - 创建名为 `story-images` 的存储桶
   - 设置为 Public
2. 或执行 `SET_BUCKET_PUBLIC.sql` 脚本

## 验证步骤

1. ✅ 环境变量已设置
2. ✅ Supabase 连接成功
3. ✅ stories 表存在
4. ✅ 可以查询数据
5. ✅ 存储桶存在
6. ✅ RLS 策略已配置

## 获取 Supabase 凭证

1. 访问 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 进入 **Settings** → **API**
4. 复制以下信息:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 创建 .env.local 文件

在项目根目录创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **重要**: 
- `.env.local` 文件不应该提交到 Git
- 修改环境变量后需要重启开发服务器

## 测试连接

重启开发服务器后，访问应用并查看浏览器控制台是否有错误信息。

