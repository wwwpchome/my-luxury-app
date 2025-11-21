# 故障排除指南

## 常见错误和解决方案

### 1. DialogContent 警告

**错误信息**:
```
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
```

**解决方案**:
- ✅ 已修复：为 `AlertDialogContent` 添加了 `aria-describedby` 属性
- 确保所有 `DialogContent` 或 `AlertDialogContent` 都有对应的 `Description` 组件

### 2. 400 错误 - Supabase 查询失败

**错误信息**:
```
Failed to load resource: the server responded with a status of 400
```

**可能的原因**:
1. **数据库字段不存在**: `is_public` 字段尚未添加到 `stories` 表中
2. **查询格式问题**: SQL 查询格式不正确

**解决方案**:

#### 方案 1: 添加缺失的字段（推荐）

在 Supabase Dashboard → SQL Editor 中执行：

```sql
-- 添加 is_public 字段（如果不存在）
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 为现有数据设置默认值
UPDATE stories
SET is_public = true
WHERE is_public IS NULL;
```

或者执行完整的脚本：
- `sql/ADD_PRIVACY_SETTINGS.sql` - 添加隐私设置功能

#### 方案 2: 检查字段是否存在

在 SQL Editor 中运行：

```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'stories'
ORDER BY ordinal_position;
```

应该看到 `is_public` 字段。

#### 方案 3: 临时禁用隐私功能

如果暂时不想使用隐私功能，代码已经添加了容错处理：
- 如果 `is_public` 字段不存在，会自动忽略该字段
- 在 Plaza 模式中，会返回所有故事（因为无法过滤）

### 3. 数据库连接错误

**错误信息**:
```
Failed to load stories: ...
```

**检查步骤**:
1. 检查环境变量是否设置正确
2. 访问 `http://localhost:3000/test-db` 检查数据库连接
3. 查看浏览器控制台的详细错误信息

### 4. RLS (Row Level Security) 错误

**错误信息**:
```
new row violates row-level security policy
```

**解决方案**:
1. 执行 `sql/FIX_USER_ID.sql` - 设置用户级访问
2. 执行 `sql/ADD_PRIVACY_SETTINGS.sql` - 更新 RLS 策略
3. 检查 RLS 策略是否正确配置

### 5. 存储桶错误

**错误信息**:
```
Storage bucket "story-images" does not exist
```

**解决方案**:
1. 执行 `sql/CREATE_STORAGE_BUCKET.sql` - 创建存储桶
2. 或手动在 Supabase Dashboard → Storage 中创建存储桶

## 快速检查清单

在遇到问题时，按以下顺序检查：

1. ✅ **环境变量**: `.env.local` 文件是否存在且包含正确的值？
2. ✅ **数据库表**: `stories` 表是否存在？
3. ✅ **表字段**: `user_id` 和 `is_public` 字段是否存在？
4. ✅ **存储桶**: `story-images` 存储桶是否存在？
5. ✅ **RLS 策略**: RLS 策略是否正确配置？
6. ✅ **网络连接**: 能否访问 Supabase Dashboard？

## 获取帮助

如果仍然遇到问题：
1. 查看浏览器控制台的详细错误信息
2. 检查网络请求（F12 → Network 标签）
3. 查看 Supabase Dashboard 的日志
4. 参考 `docs/` 目录中的相关文档

