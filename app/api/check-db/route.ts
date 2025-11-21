// API 路由：检查数据库连接
// 访问: http://localhost:3000/api/check-db

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 检查环境变量
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const checks: Record<string, any> = {
      env: {
        url: supabaseUrl ? "✅ 已设置" : "❌ 未设置",
        key: supabaseKey ? "✅ 已设置" : "❌ 未设置",
        urlValue: supabaseUrl ? supabaseUrl.substring(0, 30) + "..." : null,
      },
    };

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        {
          success: false,
          error: "环境变量未设置",
          checks,
          message: "请检查 .env.local 文件是否包含 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY",
        },
        { status: 500 }
      );
    }

    // 测试数据库连接
    const supabase = await createClient();

    // 测试 1: 检查表是否存在
    const { data: tableTest, error: tableError } = await supabase
      .from("stories")
      .select("id")
      .limit(1);

    checks.table = {
      exists: !tableError,
      error: tableError?.message || null,
    };

    if (tableError) {
      if (tableError.message.includes("relation") || tableError.message.includes("does not exist")) {
        checks.table.message = "stories 表不存在 - 请执行数据库迁移脚本";
      } else if (tableError.message.includes("JWT") || tableError.message.includes("auth")) {
        checks.table.message = "API Key 可能不正确 - 请检查 Supabase 配置";
      } else if (tableError.message.includes("row-level security") || tableError.message.includes("RLS")) {
        checks.table.message = "RLS 策略问题 - 请执行 RLS 设置脚本";
      }
    }

    // 测试 2: 检查存储桶
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    const storyImagesBucket = buckets?.find((b) => b.name === "story-images");

    checks.storage = {
      accessible: !bucketError,
      bucketExists: !!storyImagesBucket,
      bucketPublic: storyImagesBucket?.public || false,
      error: bucketError?.message || null,
    };

    // 测试 3: 检查认证
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    checks.auth = {
      accessible: !authError,
      loggedIn: !!user,
      userEmail: user?.email || null,
      error: authError?.message || null,
    };

    // 测试 4: 尝试查询数据
    if (!tableError) {
      const { count, error: countError } = await supabase
        .from("stories")
        .select("*", { count: "exact", head: true });

      checks.data = {
        queryable: !countError,
        storyCount: count ?? 0,
        error: countError?.message || null,
      };
    }

    const allChecksPassed =
      checks.env.url === "✅ 已设置" &&
      checks.env.key === "✅ 已设置" &&
      checks.table.exists &&
      checks.storage.accessible;

    return NextResponse.json({
      success: allChecksPassed,
      checks,
      message: allChecksPassed
        ? "数据库连接正常 ✅"
        : "数据库连接存在问题，请查看 checks 详情",
      recommendations: generateRecommendations(checks),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "未知错误",
        checks: null,
      },
      { status: 500 }
    );
  }
}

function generateRecommendations(checks: Record<string, any>): string[] {
  const recommendations: string[] = [];

  if (checks.env.url === "❌ 未设置" || checks.env.key === "❌ 未设置") {
    recommendations.push("1. 创建 .env.local 文件并添加 Supabase 凭证");
    recommendations.push("2. 重启开发服务器 (npm run dev)");
  }

  if (!checks.table?.exists) {
    if (checks.table?.error?.includes("relation") || checks.table?.error?.includes("does not exist")) {
      recommendations.push("3. 在 Supabase Dashboard 中执行 supabase-schema.sql 创建表");
    } else if (checks.table?.error?.includes("JWT") || checks.table?.error?.includes("auth")) {
      recommendations.push("3. 检查 NEXT_PUBLIC_SUPABASE_ANON_KEY 是否正确");
      recommendations.push("4. 在 Supabase Dashboard → Settings → API 中获取正确的 anon key");
    } else if (checks.table?.error?.includes("row-level security")) {
      recommendations.push("3. 执行 supabase-auth-setup.sql 配置 RLS 策略");
    }
  }

  if (!checks.storage?.bucketExists) {
    recommendations.push("4. 在 Supabase Dashboard 中创建 'story-images' 存储桶");
    recommendations.push("5. 执行 SET_BUCKET_PUBLIC.sql 设置存储桶为 Public");
  } else if (!checks.storage?.bucketPublic) {
    recommendations.push("4. 执行 SET_BUCKET_PUBLIC.sql 设置存储桶为 Public");
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ 所有检查通过，数据库连接正常！");
  }

  return recommendations;
}

