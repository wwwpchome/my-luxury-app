import { format, startOfDay, addDays } from "date-fns";
import { supabase } from "@/lib/supabase";

export type Story = {
  id: string;
  content: string;
  story_date: string; // YYYY-MM-DD format
  story_hour: number;
  mood_color: string | null;
  image_path: string | null;
  created_at?: string;
};

export async function getStoriesForDate(date: Date): Promise<Story[]> {
  const dateString = format(date, "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("story_date", dateString)
    .order("story_hour", { ascending: true });

  if (error) {
    throw new Error(`Failed to load stories: ${error.message}`);
  }

  return data ?? [];
}

export async function createStory(story: {
  content: string;
  story_date: string;
  story_hour: number;
  mood_color: string | null;
  image_path?: string | null;
}): Promise<Story> {
  const { data, error } = await supabase
    .from("stories")
    .insert([story])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create story: ${error.message}`);
  }

  return data;
}

export async function uploadImage(file: File, storyId: string): Promise<string> {
  const timestamp = Date.now();
  const fileExt = file.name.split(".").pop();
  const fileName = `${storyId}-${timestamp}.${fileExt}`;
  const filePath = `story-images/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("story-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("story-images").getPublicUrl(filePath);

  return publicUrl;
}

