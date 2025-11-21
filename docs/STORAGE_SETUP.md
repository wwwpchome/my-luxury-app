# Supabase Storage 设置指南

## 问题
错误信息：`Storage bucket "story-images" does not exist`

## 解决方案：创建存储桶

### 步骤 1: 打开 Supabase Dashboard
1. 访问 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目

### 步骤 2: 创建存储桶
1. 在左侧菜单中，点击 **Storage**
2. 点击 **New bucket** 按钮
3. 填写以下信息：
   - **Name**: `story-images`（必须完全一致）
   - **Public bucket**: ✅ **勾选**（如果看到此选项，必须勾选！）
   - **File size limit**: 可以设置为 `50 MB` 或更大
   - **Allowed MIME types**: 可以留空（允许所有类型）或填写：
     ```
     image/jpeg,image/png,image/gif,image/webp
     ```
4. 点击 **Create bucket**

**注意**：如果创建时没有看到 "Public bucket" 选项，创建后需要执行 `SET_BUCKET_PUBLIC.sql` 来设置存储桶为 Public。

### 步骤 3: 配置 RLS 策略
1. 创建存储桶后，点击存储桶名称 `story-images`
2. 点击 **Policies** 标签
3. 点击 **New Policy**
4. 选择 **For full customization**，然后执行下面的 SQL 脚本

或者直接在 **SQL Editor** 中执行 `STORAGE_RLS_SETUP.sql` 文件中的 SQL。

### 步骤 4: 验证设置
1. 回到 **Storage** → **story-images**
2. 尝试上传一个测试图片
3. 如果成功，说明设置正确

## RLS 策略说明

存储桶需要以下 RLS 策略：
- **SELECT**: 允许所有人读取（因为存储桶是 Public）
- **INSERT**: 允许已登录用户上传
- **UPDATE**: 允许用户更新自己上传的文件
- **DELETE**: 允许用户删除自己上传的文件

## 故障排除

### 如果上传仍然失败
1. **检查存储桶名称**：确保完全一致 `story-images`（区分大小写）
2. **检查 Public 设置**：存储桶必须是 Public
3. **检查 RLS 策略**：确保执行了 `STORAGE_RLS_SETUP.sql`
4. **检查文件大小**：确保图片不超过限制
5. **检查 MIME 类型**：如果设置了限制，确保图片类型匹配

### 查看存储桶设置
在 SQL Editor 中运行：
```sql
SELECT * FROM storage.buckets WHERE name = 'story-images';
```

应该看到 `public = true`。

### 查看 RLS 策略
在 SQL Editor 中运行：
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%story-images%' OR qual::text LIKE '%story-images%';
```

或者更简单的方式：
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects';
```

应该看到 4 条策略（SELECT, INSERT, UPDATE, DELETE）。

