# 图片上传功能设置指南

## ✅ 已完成的功能

### 1. 数据库表更新
- ✅ 添加了 `image_path` 字段（TEXT 类型）
- ✅ SQL 脚本：`supabase-add-image-field.sql`

### 2. 上传表单完善
- ✅ 替换占位区域为真实的文件输入框
- ✅ 图片预览功能
- ✅ 删除图片功能
- ✅ 加载状态显示（上传中显示 Spinner）

### 3. 图片上传逻辑
- ✅ 上传到 Supabase Storage 的 `story-images` 桶
- ✅ 文件命名格式：`{storyId}-{timestamp}.{ext}`
- ✅ 获取公共 URL 并保存到数据库
- ✅ 错误处理：上传失败时删除已创建的故事
- ✅ 加载状态管理

### 4. 图片展示
- ✅ 在 Timeline 组件中显示图片
- ✅ 优雅的圆角和适应尺寸
- ✅ 懒加载优化

## 📋 设置步骤

### 步骤 1: 更新数据库表

在 Supabase Dashboard 的 SQL Editor 中执行：

```sql
-- 执行 supabase-add-image-field.sql 文件中的内容
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS image_path TEXT;
```

### 步骤 2: 创建 Storage 桶

1. 进入 Supabase Dashboard
2. 导航到 **Storage** 部分
3. 点击 **Create a new bucket**
4. 配置：
   - **Name**: `story-images`
   - **Public bucket**: ✅ 启用（这样图片才能通过公共 URL 访问）
   - **File size limit**: 根据需求设置（建议 5MB）
   - **Allowed MIME types**: `image/*`

### 步骤 3: 配置 Storage 策略（可选）

如果需要更严格的访问控制，可以在 SQL Editor 中执行：

```sql
-- 允许所有人读取图片
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'story-images');

-- 允许所有人上传图片
CREATE POLICY "Public Upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'story-images');
```

## 🎨 功能特点

### 上传流程
1. 用户选择图片文件
2. 显示图片预览
3. 点击 "Publish Moment"
4. 先创建故事记录（获取 story ID）
5. 上传图片到 Storage
6. 更新故事记录，保存图片 URL
7. 如果上传失败，自动删除故事记录

### 错误处理
- ✅ 文件类型验证（仅允许图片）
- ✅ 上传失败时回滚（删除已创建的故事）
- ✅ 用户友好的错误提示（alert）

### 用户体验
- ✅ 图片预览
- ✅ 上传进度指示（Spinner）
- ✅ 按钮禁用状态（防止重复提交）
- ✅ 删除图片功能

## 📁 修改的文件

1. **`lib/stories.ts`**
   - 更新 `Story` 类型，添加 `image_path` 字段
   - 添加 `uploadImage()` 函数

2. **`components/shared/story-sheet.tsx`**
   - 添加文件选择和预览功能
   - 集成图片上传逻辑
   - 添加加载状态

3. **`components/shared/timeline.tsx`**
   - 在故事卡片中显示图片
   - 优雅的图片展示样式

4. **`supabase-add-image-field.sql`**
   - 数据库迁移脚本

## 🔧 技术实现

### 文件命名
```typescript
const fileName = `${storyId}-${timestamp}.${fileExt}`;
const filePath = `story-images/${fileName}`;
```

### 上传流程
```typescript
// 1. 创建故事（获取 ID）
const newStory = await createStory({...});

// 2. 上传图片
const imagePath = await uploadImage(file, newStory.id);

// 3. 更新故事记录
await supabase
  .from("stories")
  .update({ image_path: imagePath })
  .eq("id", newStory.id);
```

### 错误回滚
如果图片上传失败，会自动删除已创建的故事记录，确保数据一致性。

## 🚀 测试步骤

1. **测试上传**：
   - 选择一张图片
   - 查看预览
   - 发布故事
   - 检查时间轴是否显示图片

2. **测试错误处理**：
   - 尝试上传非图片文件（应该被拒绝）
   - 检查错误提示

3. **测试删除**：
   - 选择图片后点击删除按钮
   - 确认图片被移除

## ⚠️ 注意事项

1. **Storage 桶必须是公开的**，否则图片无法通过公共 URL 访问
2. **文件大小限制**：确保在 Supabase Storage 中设置了合理的文件大小限制
3. **图片格式**：目前支持所有图片格式（`image/*`）
4. **性能优化**：图片使用懒加载（`loading="lazy"`）

## 📊 数据库字段

```sql
image_path TEXT NULL
```

- 存储 Supabase Storage 返回的公共 URL
- 如果故事没有图片，则为 `NULL`

## ✨ 后续优化建议

- [ ] 图片压缩（在上传前压缩大图片）
- [ ] 图片裁剪功能
- [ ] 多图片支持
- [ ] 图片删除功能（从 Storage 中删除）
- [ ] 图片 CDN 集成

