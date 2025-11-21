# 快速修复：user_id 字段缺失

## 问题
错误信息：`Failed to load stories: column stories.user_id does not exist`

## 解决方案

### 步骤 1: 打开 Supabase Dashboard
1. 访问 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目

### 步骤 2: 执行 SQL 脚本
1. 在左侧菜单中，点击 **SQL Editor**
2. 点击 **New Query**
3. 复制 `FIX_USER_ID.sql` 文件中的全部内容
4. 粘贴到 SQL Editor 中
5. 点击 **Run** 或按 `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

### 步骤 3: 验证
执行成功后，你应该看到：
- ✅ 字段已添加
- ✅ 索引已创建
- ✅ RLS 策略已创建

### 步骤 4: 刷新应用
回到你的应用，刷新页面，错误应该消失了。

## 如果还有问题

### 检查表结构
在 SQL Editor 中运行：
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stories';
```

你应该看到 `user_id` 字段。

### 检查现有数据
如果 `stories` 表中已有数据但没有 `user_id`，你需要：
1. 删除旧数据（如果不需要保留）：
   ```sql
   DELETE FROM stories WHERE user_id IS NULL;
   ```

2. 或者为旧数据分配一个用户（不推荐，仅用于测试）：
   ```sql
   UPDATE stories 
   SET user_id = (SELECT id FROM auth.users LIMIT 1) 
   WHERE user_id IS NULL;
   ```

## 注意事项
- 执行 SQL 脚本不会删除现有数据
- `user_id` 字段会设置为 `NULL`（对于现有数据）
- 新创建的故事会自动关联到当前登录用户


