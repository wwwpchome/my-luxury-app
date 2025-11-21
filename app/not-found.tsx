"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8F9FA] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-6xl font-bold mb-4">404</CardTitle>
          <CardDescription className="text-lg">
            This page could not be found
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground text-center">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

