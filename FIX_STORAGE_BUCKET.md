# 修复 Supabase Storage 桶错误

## 错误原因

错误 `Failed to retrieve folder contents from "story-images": Failed to retrieve project` 表示：
1. `story-images` 桶不存在
2. 桶存在但没有正确的权限设置
3. 项目配置有问题

## 解决步骤

### 步骤 1: 创建 Storage 桶

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 点击左侧菜单的 **Storage**
4. 点击 **Create a new bucket** 或 **New bucket**
5. 配置桶设置：
   - **Name**: `story-images`（必须完全匹配）
   - **Public bucket**: ✅ **启用**（非常重要！）
   - **File size limit**: 5MB（或根据需求设置，例如 10MB）
   - **Allowed MIME types**: `image/*`（允许所有图片类型）
6. 点击 **Create bucket**

### 步骤 2: 配置 Storage 策略

在 Supabase Dashboard 的 **SQL Editor** 中执行以下 SQL：

```sql
-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- 创建新策略：允许所有人读取
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT 
USING (bucket_id = 'story-images');

-- 创建新策略：允许所有人上传
CREATE POLICY "Public Upload" ON storage.objects
FOR INSERT 
WITH CHECK (bucket_id = 'story-images');

-- 创建新策略：允许所有人删除（可选）
CREATE POLICY "Public Delete" ON storage.objects
FOR DELETE 
USING (bucket_id = 'story-images');
```

### 步骤 3: 验证桶设置

1. 在 Storage 界面，确认 `story-images` 桶：
   - ✅ 状态显示为 "Public"
   - ✅ 可以点击进入查看内容

2. 测试上传：
   - 在 Storage 界面点击 `story-images` 桶
   - 尝试手动上传一张测试图片
   - 如果成功，说明桶配置正确

### 步骤 4: 检查环境变量

确保 `.env.local` 和 Vercel 环境变量中：

```
NEXT_PUBLIC_SUPABASE_URL=你的正确 Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的正确 Supabase Anon Key
```

**重要**：确保 URL 和 Key 来自同一个 Supabase 项目！

## 常见问题

### 问题 1: 桶名称不匹配
- 确保桶名称完全为 `story-images`（区分大小写）
- 不能有空格或特殊字符

### 问题 2: 桶不是 Public
- 如果桶不是 Public，图片无法通过公共 URL 访问
- 在桶设置中启用 "Public bucket"

### 问题 3: 策略未正确创建
- 执行 SQL 后，在 Storage → Policies 中检查
- 应该能看到三条策略

### 问题 4: 项目不匹配
- 确认 `.env.local` 中的 Supabase URL 指向正确的项目
- 在 Supabase Dashboard 的 Settings → API 中确认 URL

## 验证清单

- [ ] `story-images` 桶已创建
- [ ] 桶设置为 Public
- [ ] Storage 策略已创建（3条策略）
- [ ] 环境变量配置正确
- [ ] 可以手动上传测试图片
- [ ] 测试图片可以通过公共 URL 访问

## 如果问题仍然存在

1. **检查 Supabase 项目状态**
   - 确认项目没有被暂停
   - 检查项目配额是否已满

2. **重新创建桶**
   - 删除现有桶（如果有）
   - 重新创建并确保设置为 Public

3. **检查网络连接**
   - 确认可以访问 Supabase Dashboard
   - 检查防火墙设置

4. **查看 Supabase 日志**
   - 在 Dashboard 的 Logs 中查看错误信息
   - 检查是否有权限相关的错误

