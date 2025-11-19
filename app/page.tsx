"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/shared/timeline";
import { StorySheet } from "@/components/shared/story-sheet";
import { getStoriesForDate, type Story } from "@/lib/stories";
import { Settings, User } from "lucide-react";
import { format } from "date-fns";
import useSWR from "swr";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const dateKey = format(selectedDate, "yyyy-MM-dd");
  
  const {
    data: stories,
    error,
    isLoading,
    mutate,
  } = useSWR<Story[]>(
    ["stories", dateKey, refreshKey],
    () => getStoriesForDate(selectedDate),
    {
      revalidateOnFocus: false,
    }
  );

  const handleTimeClick = (hour: number) => {
    setSelectedHour(hour);
    setSheetOpen(true);
  };

  const handleStoryCreated = () => {
    // Trigger refresh by updating the refresh key
    setRefreshKey((prev) => prev + 1);
    mutate();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-[300px] flex-shrink-0 bg-white border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Chronos
          </h1>
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
                User Name
              </p>
              <p className="text-xs text-muted-foreground truncate">
                user@example.com
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </aside>

      {/* Main Stage */}
      <main className="flex-1 bg-[#F8F9FA] overflow-y-auto">
        <div className="max-w-4xl mx-auto py-8 px-6">
          {/* Header */}
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLoading
                ? "Loading stories..."
                : error
                ? "Error loading stories"
                : stories
                ? `${stories.length} ${stories.length === 1 ? "story" : "stories"} today`
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
              onTimeClick={handleTimeClick}
            />
          )}
        </div>
      </main>

      {/* Story Sheet */}
      <StorySheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        selectedHour={selectedHour}
        selectedDate={selectedDate}
        onStoryCreated={handleStoryCreated}
      />
    </div>
  );
}

