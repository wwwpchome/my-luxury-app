"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/shared/timeline";
import { getAllStoriesForDate, type Story } from "@/lib/stories";
import { createClient } from "@/lib/supabase/client";
import { User, LogOut, Home, Users } from "lucide-react";
import { format } from "date-fns";
import useSWR from "swr";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";

export default function PlazaPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  
  const {
    data: stories,
    error,
    isLoading,
    mutate,
  } = useSWR<Story[]>(
    ["plaza-stories", dateKey, refreshKey],
    () => getAllStoriesForDate(selectedDate),
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    const supabase = createClient();

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
      setIsLoadingUser(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (isLoadingUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-[300px] flex-shrink-0 bg-white border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Chronos
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Plaza Mode</p>
        </div>

        {/* Navigation */}
        <div className="p-4 border-b border-border">
          <Link href="/">
            <Button variant="outline" size="sm" className="w-full mb-2">
              <Home className="h-4 w-4 mr-2" />
              My Stories
            </Button>
          </Link>
          <Button variant="default" size="sm" className="w-full" disabled>
            <Users className="h-4 w-4 mr-2" />
            Plaza
          </Button>
        </div>

        {/* Calendar */}
        <div className="flex-1 overflow-y-auto p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            className="w-full"
            classNames={{
              month_caption: "text-foreground",
              weekday: "text-muted-foreground",
            }}
          />
        </div>

        {/* User Section */}
        <div className="p-6 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Stage */}
      <main className="flex-1 bg-[#F8F9FA] overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8 px-6">
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Plaza - {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading stories..."
                : error
                ? "Error loading stories"
                : stories
                ? `${stories.length} ${stories.length === 1 ? "story" : "stories"} from everyone`
                : "No stories today"}
            </p>
          </div>

          {/* Timeline */}
          {error ? (
            <div className="text-center py-12">
              <p className="text-destructive">
                {error instanceof Error ? error.message : "Failed to load stories"}
              </p>
            </div>
          ) : (
            <Timeline
              stories={stories ?? []}
              showUserInfo={true}
              currentUserId={user?.id}
            />
          )}
        </div>
      </main>
    </div>
  );
}



