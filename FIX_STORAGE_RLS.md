# 修复 Supabase Storage RLS 策略错误

## 错误原因

错误 `new row violates row-level security policy` 表示 Supabase Storage 的 Row Level Security (RLS) 策略阻止了文件上传。

## 解决步骤

### 步骤 1: 在 Supabase Dashboard 中执行 SQL

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New query**
5. 复制并粘贴以下 SQL 语句：

```sql
-- 允许所有人读取图片
CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects
FOR SELECT 
USING (bucket_id = 'story-images');

-- 允许所有人上传图片
CREATE POLICY IF NOT EXISTS "Public Upload" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'story-images');

-- 如果需要允许删除（可选）
CREATE POLICY IF NOT EXISTS "Public Delete" ON storage.objects
FOR DELETE 
USING (bucket_id = 'story-images');
```

6. 点击 **Run** 执行 SQL

### 步骤 2: 检查 Storage 桶设置

1. 在 Supabase Dashboard 中，进入 **Storage** 部分
2. 找到 `story-images` 桶
3. 确保桶是 **Public**（公开的）
4. 如果桶不存在，创建它：
   - 点击 **Create a new bucket**
   - Name: `story-images`
   - Public bucket: ✅ **启用**
   - File size limit: 5MB（或根据需求设置）
   - Allowed MIME types: `image/*`

### 步骤 3: 验证

执行 SQL 后，尝试再次上传图片。如果仍然报错，检查：

1. 桶名称是否正确（必须是 `story-images`）
2. 桶是否设置为 Public
3. 策略是否正确创建

## 如果问题仍然存在

如果上述步骤后仍然报错，可以尝试禁用 RLS（不推荐用于生产环境）：

```sql
-- 仅在开发环境使用，生产环境应使用策略
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

**注意**：禁用 RLS 会降低安全性，建议使用策略而不是完全禁用。

