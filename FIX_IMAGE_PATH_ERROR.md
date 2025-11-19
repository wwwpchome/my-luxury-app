# 修复 image_path 字段错误

## 错误原因

错误信息 `Could not find the 'image_path' column of 'stories' in the schema cache` 表示数据库表中还没有 `image_path` 字段。

## 解决步骤

### 方法 1：在 Supabase Dashboard 中执行 SQL

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New query**
5. 复制并粘贴以下 SQL 语句：

```sql
-- 为 stories 表添加 image_path 字段
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS image_path TEXT;

-- 添加注释说明字段用途
COMMENT ON COLUMN stories.image_path IS 'Path to the image in Supabase Storage (story-images bucket)';
```

6. 点击 **Run** 执行 SQL
7. 等待执行完成（应该显示 "Success. No rows returned"）

### 方法 2：使用项目中的 SQL 文件

1. 打开项目中的 `supabase-add-image-field.sql` 文件
2. 复制文件内容
3. 在 Supabase Dashboard 的 SQL Editor 中执行

## 验证

执行 SQL 后，可以通过以下方式验证：

1. 在 Supabase Dashboard 中：
   - 进入 **Table Editor**
   - 选择 `stories` 表
   - 查看列列表，应该能看到 `image_path` 字段

2. 或者执行以下查询：
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stories' AND column_name = 'image_path';
```

如果返回结果，说明字段已成功添加。

## 注意事项

- 执行 SQL 后，可能需要等待几秒钟让 schema cache 更新
- 如果仍然报错，尝试刷新页面或重启开发服务器
- 确保你执行 SQL 的数据库是正确的项目数据库

## 如果问题仍然存在

1. 检查是否在正确的 Supabase 项目中执行 SQL
2. 确认 `.env.local` 中的 `NEXT_PUBLIC_SUPABASE_URL` 指向正确的项目
3. 重启开发服务器：`npm run dev`
4. 清除浏览器缓存并刷新页面

