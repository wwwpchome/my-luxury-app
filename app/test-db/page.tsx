"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function TestDBPage() {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleCheck = async () => {
    setChecking(true);
    setResults(null);

    try {
      const response = await fetch("/api/check-db");
      const data = await response.json();
      setResults(data);
    } catch (error) {
      setResults({
        success: false,
        error: error instanceof Error ? error.message : "检查失败",
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">数据库连接检查</CardTitle>
            <CardDescription>检查 Supabase 数据库连接和配置</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCheck} disabled={checking} className="w-full">
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  检查中...
                </>
              ) : (
                "开始检查"
              )}
            </Button>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {results.success ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    检查完成
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    发现问题
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium mb-2">{results.message}</p>
                {results.recommendations && results.recommendations.length > 0 && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm font-medium mb-2">建议操作：</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {results.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {results.checks && (
                <div className="space-y-4">
                  {/* 环境变量检查 */}
                  <div>
                    <h3 className="font-semibold mb-2">环境变量</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        {results.checks.env?.url === "✅ 已设置" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>NEXT_PUBLIC_SUPABASE_URL: {results.checks.env?.url}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {results.checks.env?.key === "✅ 已设置" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span>NEXT_PUBLIC_SUPABASE_ANON_KEY: {results.checks.env?.key}</span>
                      </div>
                    </div>
                  </div>

                  {/* 数据表检查 */}
                  {results.checks.table && (
                    <div>
                      <h3 className="font-semibold mb-2">数据表 (stories)</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          {results.checks.table.exists ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span>
                            {results.checks.table.exists ? "表存在且可访问" : "表不存在或无法访问"}
                          </span>
                        </div>
                        {results.checks.table.error && (
                          <div className="text-xs text-red-500 ml-6">
                            {results.checks.table.error}
                          </div>
                        )}
                        {results.checks.table.message && (
                          <div className="text-xs text-amber-600 ml-6 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {results.checks.table.message}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 存储检查 */}
                  {results.checks.storage && (
                    <div>
                      <h3 className="font-semibold mb-2">存储桶 (story-images)</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          {results.checks.storage.bucketExists ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span>
                            {results.checks.storage.bucketExists
                              ? "存储桶存在"
                              : "存储桶不存在"}
                          </span>
                        </div>
                        {results.checks.storage.bucketExists && (
                          <div className="flex items-center gap-2 ml-6">
                            {results.checks.storage.bucketPublic ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span>
                              {results.checks.storage.bucketPublic ? "Public: 是" : "Public: 否"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 认证检查 */}
                  {results.checks.auth && (
                    <div>
                      <h3 className="font-semibold mb-2">认证系统</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          {results.checks.auth.accessible ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span>认证系统: {results.checks.auth.accessible ? "可访问" : "不可访问"}</span>
                        </div>
                        {results.checks.auth.loggedIn && (
                          <div className="ml-6 text-xs text-muted-foreground">
                            当前用户: {results.checks.auth.userEmail}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 数据查询检查 */}
                  {results.checks.data && (
                    <div>
                      <h3 className="font-semibold mb-2">数据查询</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          {results.checks.data.queryable ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span>
                            {results.checks.data.queryable
                              ? `可查询 (当前有 ${results.checks.data.storyCount} 条故事)`
                              : "无法查询数据"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {results.error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-sm">
                  {results.error}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

