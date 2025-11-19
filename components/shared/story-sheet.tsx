"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createStory, uploadImage } from "@/lib/stories";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";

interface StorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedHour: number | null;
  selectedDate: Date;
  onStoryCreated?: () => void;
}

const moodColors = [
  { name: "Calm", color: "bg-blue-400" },
  { name: "Happy", color: "bg-yellow-400" },
  { name: "Energetic", color: "bg-orange-400" },
  { name: "Peaceful", color: "bg-green-400" },
  { name: "Thoughtful", color: "bg-purple-400" },
  { name: "Warm", color: "bg-pink-400" },
];

export function StorySheet({
  open,
  onOpenChange,
  selectedHour,
  selectedDate,
  onStoryCreated,
}: StorySheetProps) {
  const [story, setStory] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatTime = (hour: number) => {
    return `${String(hour).padStart(2, "0")}:00`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        return;
      }
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePolish = async () => {
    if (!story.trim()) {
      alert("Please write your story first before polishing.");
      return;
    }

    setIsPolishing(true);

    try {
      const response = await fetch("/api/polish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: story }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      if (data.polishedContent) {
        setStory(data.polishedContent);
      } else {
        throw new Error("No polished content received");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to polish story";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsPolishing(false);
    }
  };

  const handlePublish = async () => {
    if (!story.trim()) {
      alert("Please write your story before publishing.");
      return;
    }

    if (selectedHour === null) {
      return;
    }

    setIsSubmitting(true);
    let imagePath: string | null = null;

    try {
      const storyDate = format(selectedDate, "yyyy-MM-dd");
      
      // First, create the story to get an ID
      const newStory = await createStory({
        content: story.trim(),
        story_date: storyDate,
        story_hour: selectedHour,
        mood_color: selectedMood,
        image_path: null, // Will update after upload
      });

      // Upload image if selected
      if (selectedFile) {
        setIsUploading(true);
        try {
          imagePath = await uploadImage(selectedFile, newStory.id);
          
          // Update story with image path
          const supabase = createClient();
          const { error: updateError } = await supabase
            .from("stories")
            .update({ image_path: imagePath })
            .eq("id", newStory.id);

          if (updateError) {
            throw new Error(`Failed to update story with image: ${updateError.message}`);
          }
        } catch (uploadError) {
          // If upload fails, delete the story
          const supabase = createClient();
          await supabase.from("stories").delete().eq("id", newStory.id);
          throw uploadError;
        } finally {
          setIsUploading(false);
        }
      }

      // Reset form
      setStory("");
      setSelectedMood(null);
      setSelectedFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onOpenChange(false);
      
      // Refresh timeline
      if (onStoryCreated) {
        onStoryCreated();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save story";
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  if (selectedHour === null) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-12 pt-16 pb-12 border-b border-border">
            <SheetTitle className="font-display text-4xl font-bold text-left">
              {formatTime(selectedHour)} - What happened?
            </SheetTitle>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-12 py-12 space-y-12">
            {/* Story Textarea */}
            <div className="space-y-3">
              <Textarea
                placeholder="Write your story here..."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="min-h-[400px] text-xl leading-relaxed resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 placeholder:text-muted-foreground/40 font-sans"
                disabled={isSubmitting || isPolishing}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePolish}
                  disabled={isPolishing || isSubmitting || !story.trim()}
                  className="disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPolishing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Polishing...
                    </>
                  ) : (
                    "AI Polish"
                  )}
                </Button>
              </div>
            </div>

            {/* Image Upload Area */}
            <div>
              {imagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    onClick={handleRemoveImage}
                    disabled={isSubmitting}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors disabled:opacity-50"
                    aria-label="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="block">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={isSubmitting}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-border rounded-lg p-16 flex flex-col items-center justify-center hover:border-foreground/20 transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50">
                    {isUploading ? (
                      <Loader2 className="h-10 w-10 text-muted-foreground mb-4 animate-spin" />
                    ) : (
                      <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      {isUploading ? "Uploading..." : "Upload an image"}
                    </p>
                  </div>
                </label>
              )}
            </div>

            {/* Mood Color Selector */}
            <div className="space-y-6">
              <p className="text-base font-medium text-foreground">
                How are you feeling?
              </p>
              <div className="flex gap-5">
                {moodColors.map((mood) => (
                  <button
                    key={mood.name}
                    onClick={() => setSelectedMood(mood.name)}
                    disabled={isSubmitting}
                    className={cn(
                      "h-14 w-14 rounded-full transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed",
                      mood.color,
                      selectedMood === mood.name &&
                        "ring-2 ring-offset-3 ring-offset-background ring-foreground scale-110"
                    )}
                    aria-label={mood.name}
                    title={mood.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-12 py-8 border-t border-border">
            <Button
              onClick={handlePublish}
              disabled={isSubmitting || isUploading || !story.trim()}
              className="w-full h-12 bg-black text-white hover:bg-black/90 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading image...
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Moment"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

