// 数据库连接检查脚本
// 运行: npx tsx scripts/check-db-connection.ts

import { createClient } from "@/lib/supabase/client";

async function checkDatabaseConnection() {
  console.log("🔍 检查数据库连接...\n");

  // 检查环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("环境变量检查:");
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✅ 已设置" : "❌ 未设置"}`);
  console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? "✅ 已设置" : "❌ 未设置"}\n`);

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ 错误: 环境变量未设置！");
    console.log("\n请创建 .env.local 文件并添加以下内容:");
    console.log("NEXT_PUBLIC_SUPABASE_URL=your-supabase-url");
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key");
    process.exit(1);
  }

  try {
    const supabase = createClient();

    // 测试 1: 检查 Supabase 连接
    console.log("测试 1: 检查 Supabase 连接...");
    const { data: healthCheck, error: healthError } = await supabase
      .from("stories")
      .select("count")
      .limit(0);

    if (healthError) {
      console.error(`❌ 连接失败: ${healthError.message}`);
      
      if (healthError.message.includes("relation") || healthError.message.includes("does not exist")) {
        console.error("\n⚠️  可能的问题:");
        console.error("  1. stories 表不存在 - 请检查数据库表是否已创建");
        console.error("  2. 表名不正确 - 请确认表名是否为 'stories'");
      } else if (healthError.message.includes("JWT") || healthError.message.includes("auth")) {
        console.error("\n⚠️  可能的问题:");
        console.error("  1. API Key 不正确 - 请检查 NEXT_PUBLIC_SUPABASE_ANON_KEY");
        console.error("  2. 认证配置错误 - 请检查 Supabase 项目设置");
      } else if (healthError.message.includes("Network") || healthError.message.includes("fetch")) {
        console.error("\n⚠️  可能的问题:");
        console.error("  1. URL 不正确 - 请检查 NEXT_PUBLIC_SUPABASE_URL");
        console.error("  2. 网络连接问题 - 请检查网络连接");
      }
      
      process.exit(1);
    }

    console.log("✅ Supabase 连接成功\n");

    // 测试 2: 检查表结构
    console.log("测试 2: 检查 stories 表结构...");
    const { data: tableData, error: tableError } = await supabase
      .from("stories")
      .select("id, content, story_date, story_hour, mood_color, image_path, user_id, created_at")
      .limit(1);

    if (tableError) {
      console.error(`❌ 表结构检查失败: ${tableError.message}`);
      process.exit(1);
    }

    console.log("✅ stories 表存在且可访问\n");

    // 测试 3: 检查用户认证
    console.log("测试 3: 检查用户认证状态...");
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.log(`⚠️  未登录: ${authError.message}`);
      console.log("  这很正常 - 你需要在浏览器中登录");
    } else if (user) {
      console.log(`✅ 当前用户: ${user.email}`);
    } else {
      console.log("ℹ️  未登录（这是正常的）");
    }

    // 测试 4: 检查存储桶
    console.log("\n测试 4: 检查存储桶...");
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
      console.error(`❌ 存储桶检查失败: ${bucketError.message}`);
    } else {
      const storyImagesBucket = buckets?.find(b => b.name === "story-images");
      if (storyImagesBucket) {
        console.log(`✅ story-images 存储桶存在 (Public: ${storyImagesBucket.public})`);
      } else {
        console.log("⚠️  story-images 存储桶不存在");
        console.log("  请创建存储桶或执行 SET_BUCKET_PUBLIC.sql");
      }
    }

    console.log("\n✅ 数据库连接检查完成！");
    
    // 显示数据库信息摘要
    const { count } = await supabase
      .from("stories")
      .select("*", { count: "exact", head: true });
    
    console.log(`\n数据库摘要:`);
    console.log(`  - Stories 表记录数: ${count ?? 0}`);

  } catch (error) {
    console.error("\n❌ 发生未知错误:");
    console.error(error);
    process.exit(1);
  }
}

checkDatabaseConnection();

