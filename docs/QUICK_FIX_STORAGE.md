# 快速修复：创建 story-images 存储桶

## 问题
存储桶 `story-images` 不存在，导致图片无法上传。

## 解决方案

### 方法 1: 使用 SQL 脚本（推荐）

1. **打开 Supabase Dashboard**
   - 访问 [Supabase Dashboard](https://app.supabase.com/)
   - 选择你的项目
   - 点击左侧菜单的 **SQL Editor**

2. **执行 SQL 脚本**
   - 点击 **New Query**
   - 打开项目中的 `CREATE_STORAGE_BUCKET.sql` 文件
   - 复制全部内容
   - 粘贴到 SQL Editor 中
   - 点击 **Run** 或按 `Ctrl+Enter`

3. **验证结果**
   - 脚本会显示存储桶信息和策略信息
   - 检查是否有任何错误

### 方法 2: 手动创建存储桶（如果 SQL 方法失败）

1. **在 Supabase Dashboard 中创建存储桶**
   - 点击左侧菜单的 **Storage**
   - 点击 **New bucket** 按钮
   - 填写以下信息：
     - **Name**: `story-images`（必须完全一致，区分大小写）
     - **Public bucket**: ✅ **勾选**（重要！）
     - **File size limit**: `50 MB`
     - **Allowed MIME types**: 可以留空（允许所有图片类型）或填写：
       ```
       image/jpeg,image/png,image/gif,image/webp,image/jpg
       ```
   - 点击 **Create bucket**

2. **配置 RLS 策略**
   - 创建存储桶后，点击存储桶名称 `story-images`
   - 点击 **Policies** 标签
   - 点击 **New Policy**
   - 或者直接执行 `STORAGE_RLS_SETUP.sql` 脚本

3. **设置存储桶为 Public（如果创建时没有选项）**
   - 执行 `SET_BUCKET_PUBLIC.sql` 脚本
   - 或在 SQL Editor 中运行：
     ```sql
     UPDATE storage.buckets 
     SET public = true 
     WHERE name = 'story-images';
     ```

## 验证设置

### 验证 1: 检查存储桶是否存在
在 SQL Editor 中运行：
```sql
SELECT name, public, file_size_limit 
FROM storage.buckets 
WHERE name = 'story-images';
```

应该看到：
- `name`: `story-images`
- `public`: `true`
- `file_size_limit`: `52428800` (50 MB)

### 验证 2: 检查 RLS 策略
在 SQL Editor 中运行：
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND (policyname LIKE '%story-images%' OR qual::text LIKE '%story-images%');
```

应该看到 4 条策略：
- `Allow public read access` (SELECT)
- `Allow authenticated upload` (INSERT)
- `Allow users to update own files` (UPDATE)
- `Allow users to delete own files` (DELETE)

### 验证 3: 测试上传
1. 回到应用 `http://localhost:3000`
2. 尝试创建新故事并上传图片
3. 如果上传成功，说明存储桶配置正确

## 常见错误

### 错误 1: "relation storage.buckets does not exist"
**原因**: Supabase 版本问题或权限不足

**解决方案**:
- 确保在正确的 Supabase 项目中
- 尝试在 Dashboard 中手动创建存储桶

### 错误 2: "new row violates row-level security policy"
**原因**: RLS 策略配置不正确

**解决方案**:
- 执行完整的 `CREATE_STORAGE_BUCKET.sql` 脚本
- 确保策略包含 `bucket_id = 'story-images'`

### 错误 3: "Storage bucket 'story-images' does not exist"
**原因**: 存储桶未创建或名称不匹配

**解决方案**:
- 检查存储桶名称是否为 `story-images`（完全一致，区分大小写）
- 在 Storage 页面查看是否存在该存储桶

## 下一步

存储桶创建成功后：
1. 重启开发服务器（如果正在运行）
2. 回到应用测试图片上传功能
3. 访问 `http://localhost:3000/test-db` 再次检查连接

## 需要帮助？

如果仍然遇到问题，请检查：
- ✅ 存储桶名称是否为 `story-images`
- ✅ 存储桶是否为 Public
- ✅ RLS 策略是否已创建
- ✅ 文件大小限制是否足够（至少 5 MB）

