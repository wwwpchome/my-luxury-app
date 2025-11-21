# 代码清理计划

## 需要删除的文件

### 1. 未使用的旧代码
- ❌ `lib/supabase.ts` - 旧版本，现在使用 `lib/supabase/client.ts` 和 `lib/supabase/server.ts`
- ❌ `src/` 目录 - 旧的 Pages Router 结构，现在使用 App Router (`app/`)
- ❌ `postcss.config.js` - 已有 `postcss.config.mjs`

### 2. 重复/过时的 SQL 文件
可以保留主要文件，删除重复的：
- ✅ 保留：`ADD_PRIVACY_SETTINGS.sql`
- ✅ 保留：`CREATE_STORAGE_BUCKET.sql`
- ✅ 保留：`UPDATE_STORAGE_RLS_FOR_USER_FOLDERS.sql`
- ✅ 保留：`FIX_USER_ID.sql`
- ✅ 保留：`SET_BUCKET_PUBLIC.sql`
- ✅ 保留：`STORAGE_RLS_SETUP.sql`
- ✅ 保留：`supabase-schema.sql`
- ✅ 保留：`supabase-auth-setup.sql`

### 3. 文档整理
可以将文档组织到 `docs/` 目录：
- `SETUP_PRIVACY_AND_STORAGE.md`
- `PRIVACY_SETTINGS_GUIDE.md`
- `CHECK_DATABASE.md`
- `STORAGE_SETUP.md`
- 等等...

## 需要修复的代码问题

1. 未使用的导入
2. 重复的代码
3. 代码格式问题

