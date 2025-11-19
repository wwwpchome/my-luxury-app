"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Story } from "@/lib/stories";

const formatTime = (hour: number) => {
  return `${String(hour).padStart(2, "0")}:00`;
};

interface TimelineProps {
  stories: Story[];
  onTimeClick?: (hour: number) => void;
}

export function Timeline({ stories, onTimeClick }: TimelineProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getStoriesForHour = (hour: number) => {
    return stories.filter((story) => story.story_hour === hour);
  };

  return (
    <div className="relative">
      {/* Continuous vertical line */}
      <div className="absolute left-[88px] top-0 bottom-0 w-px bg-border" />
      
      <div className="relative flex flex-col">
        {hours.map((hour, index) => {
          const hourStories = getStoriesForHour(hour);
          const timeString = formatTime(hour);

          return (
            <motion.div
              key={hour}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.02,
                ease: "easeOut",
              }}
              className="relative flex min-h-[120px] gap-6 pb-4"
            >
              {/* Time Label */}
              <div className="w-20 flex-shrink-0 flex items-start pt-1">
                <span className="text-sm font-medium text-muted-foreground">
                  {timeString}
                </span>
              </div>

              {/* Time Dot */}
              <div className="relative flex-shrink-0 w-6 flex items-start justify-center pt-1">
                <div className="relative z-10 h-3 w-3 rounded-full border-2 border-foreground bg-background" />
              </div>

              {/* Content Area */}
              <div
                className="flex-1 cursor-pointer"
                onClick={() => onTimeClick?.(hour)}
              >
                {hourStories.length > 0 ? (
                  <div className="space-y-3">
                    {hourStories.map((story) => (
                      <motion.div
                        key={story.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="backdrop-blur-md bg-white/80 border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                          {story.image_path && (
                            <div className="w-full h-48 overflow-hidden relative">
                              <Image
                                src={story.image_path}
                                alt="Story image"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium text-muted-foreground">
                                {formatTime(story.story_hour)}
                              </span>
                              {story.mood_color && (
                                <div
                                  className={cn(
                                    "h-3 w-3 rounded-full",
                                    story.mood_color
                                  )}
                                />
                              )}
                            </div>
                            <p className="text-sm text-foreground line-clamp-3 whitespace-pre-wrap">
                              {story.content}
                            </p>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full min-h-[60px] rounded-md border-2 border-dashed border-transparent hover:border-border/30 transition-colors" />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

