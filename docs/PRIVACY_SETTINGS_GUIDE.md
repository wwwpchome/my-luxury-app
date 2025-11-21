# 隐私设置功能说明

## 功能概述

应用现在支持故事的隐私设置功能：
- **所有人可见** (is_public = true): 故事会在 Plaza 模式中显示，其他用户可以看到
- **仅自己可见** (is_public = false): 故事只在自己主页显示，其他用户无法看到

## 数据库更改

### 1. 添加 is_public 字段

执行 `ADD_PRIVACY_SETTINGS.sql` 脚本，会：
- 在 `stories` 表中添加 `is_public` 字段（布尔类型，默认 true）
- 更新 RLS 策略以支持隐私设置
- 创建索引以提高查询性能

### 2. 存储桶组织方式

图片现在按用户ID组织：
- 文件路径格式: `story-images/{user_id}/{filename}`
- 每个用户的图片存储在自己的文件夹中
- RLS 策略确保用户只能访问自己的文件夹

执行 `UPDATE_STORAGE_RLS_FOR_USER_FOLDERS.sql` 来更新存储策略。

## UI 更改

### 创建/编辑故事时

在故事编辑表单中添加了隐私设置选项：
- 🌍 **所有人可见** - 故事会在 Plaza 模式中公开
- 🔒 **仅自己可见** - 故事只在自己的主页显示

### 查询逻辑

- **我的故事页面**: 显示所有自己的故事（无论隐私设置）
- **Plaza 模式**: 只显示所有用户的公开故事（is_public = true）

## RLS 策略说明

### Stories 表策略

1. **用户可以查看自己的所有故事**
   ```sql
   USING (auth.uid() = user_id)
   ```

2. **用户可以查看所有公开的故事**
   ```sql
   USING (is_public = true AND auth.role() = 'authenticated')
   ```

结果：用户可以：
- 查看自己的所有故事（公开和私密）
- 查看其他用户公开的故事
- 无法查看其他用户的私密故事

### Storage 策略

1. **公共读取**: 所有人可以读取存储桶中的文件
2. **用户上传**: 只能上传到自己的文件夹 `{user_id}/`
3. **用户更新/删除**: 只能操作自己文件夹中的文件

## 使用步骤

### 步骤 1: 执行数据库迁移

在 Supabase Dashboard → SQL Editor 中执行：
1. `ADD_PRIVACY_SETTINGS.sql` - 添加隐私字段和策略
2. `UPDATE_STORAGE_RLS_FOR_USER_FOLDERS.sql` - 更新存储策略

### 步骤 2: 验证设置

检查字段是否添加：
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'stories' AND column_name = 'is_public';
```

检查策略是否更新：
```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'stories';
```

### 步骤 3: 测试功能

1. 创建新故事时，选择隐私设置
2. 查看"我的故事"页面 - 应该显示所有自己的故事
3. 查看 Plaza 模式 - 应该只显示公开的故事
4. 切换隐私设置 - 故事在 Plaza 中的可见性应该改变

## 注意事项

1. **现有数据**: 执行脚本后，所有现有故事默认为公开（is_public = true）
2. **文件迁移**: 如果已有上传的图片，它们仍然使用旧的路径。新上传的图片会使用新的文件夹结构
3. **性能**: 添加了索引以提高查询性能，特别是按 user_id 和 is_public 查询时

## 故障排除

### 问题 1: 无法创建故事
**解决方案**: 检查是否执行了 `ADD_PRIVACY_SETTINGS.sql`

### 问题 2: 图片上传失败
**解决方案**: 
1. 确保执行了 `UPDATE_STORAGE_RLS_FOR_USER_FOLDERS.sql`
2. 检查存储桶是否存在
3. 验证 RLS 策略是否正确

### 问题 3: Plaza 模式显示所有故事
**解决方案**: 检查 `getAllStoriesForDate` 函数是否正确过滤 `is_public = true`

