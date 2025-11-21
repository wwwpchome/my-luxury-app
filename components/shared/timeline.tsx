"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Story } from "@/lib/stories";
import { getUserInfo, deleteStory } from "@/lib/stories";
import { createClient } from "@/lib/supabase/client";
import { Edit2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const formatTime = (hour: number) => {
  return `${String(hour).padStart(2, "0")}:00`;
};

interface TimelineProps {
  stories: Story[];
  onTimeClick?: (hour: number) => void;
  onStoryEdit?: (story: Story) => void;
  onStoryDelete?: () => void;
  showUserInfo?: boolean;
  currentUserId?: string | null;
}

interface StoryCardProps {
  story: Story;
  showUserInfo?: boolean;
  currentUserId?: string | null;
  onEdit?: (story: Story) => void;
  onDelete?: () => void;
}

function StoryCard({ story, showUserInfo, currentUserId, onEdit, onDelete }: StoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [userInfo, setUserInfo] = useState<{ email: string | null; avatar_url: string | null } | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const isOwnStory = currentUserId && story.user_id === currentUserId;
  const shouldShowActions = isOwnStory && (onEdit || onDelete);

  useEffect(() => {
    if (showUserInfo && story.user_id) {
      setIsLoadingUser(true);
      getUserInfo(story.user_id)
        .then((info) => {
          setUserInfo(info);
        })
        .catch((error) => {
          console.error("Failed to load user info:", error);
        })
        .finally(() => {
          setIsLoadingUser(false);
        });
    }
  }, [showUserInfo, story.user_id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteStory(story.id);
      toast({
        title: "Story deleted",
        description: "Your story has been deleted successfully.",
      });
      if (onDelete) {
        onDelete();
      }
      setDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete story",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const contentLines = story.content.split("\n").length;
  const isLongContent = contentLines > 3 || story.content.length > 200;
  const displayContent = isExpanded ? story.content : story.content.slice(0, 200);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()} // Prevent triggering onTimeClick
      >
        <Card className="backdrop-blur-md bg-white/80 border-border/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
          {story.image_path && (
            <div className="w-full h-48 overflow-hidden relative bg-muted rounded-t-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.image_path}
                alt="Story image"
                className="w-full h-full object-cover"
                loading="lazy"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.error("Image load error:", story.image_path);
                  e.currentTarget.style.display = "none";
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML =
                      '<div class="w-full h-full flex items-center justify-center text-muted-foreground text-sm">Image failed to load</div>';
                  }
                }}
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
                  className={cn("h-3 w-3 rounded-full", story.mood_color)}
                  title={story.mood_color}
                />
              )}
              {showUserInfo && story.user_id && (
                <span className="text-xs text-muted-foreground ml-auto">
                  {userInfo?.email
                    ? userInfo.email.split("@")[0]
                    : isLoadingUser
                    ? "Loading..."
                    : `User ${story.user_id.slice(0, 6)}`}
                </span>
              )}
              {shouldShowActions && (
                <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(story);
                      }}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {displayContent}
                {isLongContent && !isExpanded && "..."}
              </p>
              {isLongContent && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 mt-2 text-xs text-muted-foreground"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? (
                    <>
                      Show less <ChevronUp className="h-3 w-3 ml-1" />
                    </>
                  ) : (
                    <>
                      Show more <ChevronDown className="h-3 w-3 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent aria-describedby="delete-dialog-description">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story?</AlertDialogTitle>
            <AlertDialogDescription id="delete-dialog-description">
              Are you sure you want to delete this story? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function Timeline({
  stories,
  onTimeClick,
  onStoryEdit,
  onStoryDelete,
  showUserInfo = false,
  currentUserId,
}: TimelineProps) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUserId) {
      setUserId(currentUserId);
    } else if (!showUserInfo) {
      // Only fetch current user if we need to show actions
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setUserId(user.id);
        }
      });
    }
  }, [currentUserId, showUserInfo]);

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
                      <StoryCard
                        key={story.id}
                        story={story}
                        showUserInfo={showUserInfo}
                        currentUserId={userId}
                        onEdit={onStoryEdit}
                        onDelete={onStoryDelete}
                      />
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
