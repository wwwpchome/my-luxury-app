# 设置隐私设置和用户数据桶 - 快速指南

## ✅ 已完成的功能

1. **隐私设置功能**：
   - 每个故事可以设置为"所有人可见"或"仅自己可见"
   - 在创建/编辑故事时可以选择隐私级别
   - Plaza 模式只显示公开的故事

2. **用户数据桶**：
   - 每个用户的图片存储在独立的文件夹中：`story-images/{user_id}/{filename}`
   - RLS 策略确保用户只能访问自己的文件夹

## 📋 需要执行的步骤

### 步骤 1: 添加隐私设置字段

在 Supabase Dashboard → SQL Editor 中执行：

**文件**: `ADD_PRIVACY_SETTINGS.sql`

这个脚本会：
- ✅ 在 `stories` 表中添加 `is_public` 字段（布尔类型，默认 true）
- ✅ 更新现有数据为公开状态
- ✅ 创建索引提高查询性能
- ✅ 更新 RLS 策略支持隐私设置

### 步骤 2: 更新存储桶 RLS 策略

在 Supabase Dashboard → SQL Editor 中执行：

**文件**: `UPDATE_STORAGE_RLS_FOR_USER_FOLDERS.sql`

这个脚本会：
- ✅ 更新存储桶 RLS 策略
- ✅ 支持按用户ID组织的文件夹结构
- ✅ 确保用户只能上传/管理自己文件夹中的文件

### 步骤 3: 验证设置

执行以下 SQL 查询验证：

```sql
-- 检查 is_public 字段是否存在
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'stories' AND column_name = 'is_public';

-- 检查 RLS 策略
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'stories'
ORDER BY policyname;

-- 检查存储桶策略
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
AND (policyname LIKE '%story-images%' OR qual::text LIKE '%story-images%');
```

## 🎨 UI 更改

### 创建/编辑故事时的隐私选项

在故事编辑表单中，现在有一个"隐私设置"部分：
- 🌍 **所有人可见** - 故事会在 Plaza 模式中显示
- 🔒 **仅自己可见** - 故事只在自己的主页显示

默认选择是"所有人可见"。

### 查询逻辑

- **我的故事页面** (`/`): 显示用户的所有故事（无论隐私设置）
- **Plaza 模式** (`/plaza`): 只显示所有用户的公开故事（`is_public = true`）

## 📁 文件组织

### 图片存储结构

图片现在按用户ID组织：

```
story-images/
  ├── {user_id_1}/
  │   ├── {story_id}-{timestamp}.jpg
  │   └── {story_id}-{timestamp}.png
  ├── {user_id_2}/
  │   └── {story_id}-{timestamp}.jpg
  └── ...
```

### 数据库结构

`stories` 表现在包含：
- `id` - UUID 主键
- `content` - 故事内容
- `story_date` - 日期
- `story_hour` - 小时 (0-23)
- `mood_color` - 心情颜色
- `image_path` - 图片路径
- `user_id` - 用户ID
- `is_public` - **新增**: 隐私设置（true = 公开，false = 仅自己可见）
- `created_at` - 创建时间

## 🔒 RLS 策略说明

### Stories 表策略

1. **用户可以查看自己的所有故事**
   ```sql
   USING (auth.uid() = user_id)
   ```
   - 用户可以查看自己的所有故事（公开和私密）

2. **用户可以查看所有公开的故事**
   ```sql
   USING (is_public = true AND auth.role() = 'authenticated')
   ```
   - 用户可以查看其他用户的公开故事
   - 无法查看其他用户的私密故事

### Storage 策略

1. **公共读取**: 所有人可以读取存储桶中的文件
2. **用户上传**: 只能上传到自己的文件夹 `{user_id}/`
3. **用户更新/删除**: 只能操作自己文件夹中的文件

## 🧪 测试功能

1. **创建公开故事**：
   - 创建新故事，选择"所有人可见"
   - 在 Plaza 模式中应该可以看到

2. **创建私密故事**：
   - 创建新故事，选择"仅自己可见"
   - 在 Plaza 模式中应该看不到
   - 在自己的主页应该可以看到

3. **切换隐私设置**：
   - 编辑故事，切换隐私设置
   - 验证在 Plaza 中的可见性是否改变

4. **图片上传**：
   - 上传图片，检查是否保存在正确的用户文件夹中
   - 验证其他用户无法访问你的文件夹

## 📝 注意事项

1. **现有数据**：
   - 执行脚本后，所有现有故事默认为公开（`is_public = true`）
   - 如果需要将某些故事设为私密，需要手动更新

2. **文件迁移**：
   - 如果已有上传的图片（使用旧路径），它们仍然可以访问
   - 新上传的图片会使用新的文件夹结构 `{user_id}/{filename}`

3. **性能**：
   - 已添加索引以提高查询性能
   - 特别是在按 `user_id` 和 `is_public` 查询时

## ❓ 常见问题

### Q: 为什么 Plaza 模式还显示私密故事？
A: 检查 `getAllStoriesForDate` 函数是否正确过滤 `is_public = true`，并确保执行了 SQL 脚本。

### Q: 图片上传失败？
A: 确保执行了 `UPDATE_STORAGE_RLS_FOR_USER_FOLDERS.sql`，并检查存储桶是否存在。

### Q: 无法切换隐私设置？
A: 检查数据库中的 `is_public` 字段是否正确添加，并验证 RLS 策略是否包含 UPDATE 权限。

## 🎉 完成！

执行完上述步骤后，你的应用就支持：
- ✅ 每个用户独立的数据桶（文件夹）
- ✅ 故事的隐私设置（公开/私密）
- ✅ Plaza 模式只显示公开故事

如有任何问题，请查看详细的 `PRIVACY_SETTINGS_GUIDE.md` 文档。

