import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";

export type Story = {
  id: string;
  content: string;
  story_date: string; // YYYY-MM-DD format
  story_hour: number;
  mood_color: string | null;
  image_path: string | null;
  user_id: string;
  created_at?: string;
};

export async function getStoriesForDate(date: Date, userId?: string | null): Promise<Story[]> {
  const supabase = createClient();
  const dateString = format(date, "yyyy-MM-dd");

  // Get current user if userId not provided
  let currentUserId = userId;
  if (!currentUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }
    currentUserId = user.id;
  }

  const query = supabase
    .from("stories")
    .select("*")
    .eq("story_date", dateString)
    .order("story_hour", { ascending: true });

  // If userId is provided, filter by user; otherwise get all stories (plaza mode)
  if (currentUserId) {
    query.eq("user_id", currentUserId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load stories: ${error.message}`);
  }

  return data ?? [];
}

// Get all public stories for plaza mode
export async function getAllStoriesForDate(date: Date): Promise<Story[]> {
  const supabase = createClient();
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

// Get user info for story display
export async function getUserInfo(userId: string): Promise<{ email: string | null; avatar_url: string | null }> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("users")
    .select("email, avatar_url")
    .eq("id", userId)
    .single();

  if (error) {
    // If users table doesn't exist, try to get from auth.users
    const { data: { user } } = await supabase.auth.getUser();
    if (user && user.id === userId) {
      return {
        email: user.email || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      };
    }
    return { email: null, avatar_url: null };
  }

  return {
    email: data?.email || null,
    avatar_url: data?.avatar_url || null,
  };
}

export async function createStory(story: {
  content: string;
  story_date: string;
  story_hour: number;
  mood_color: string | null;
  image_path?: string | null;
}): Promise<Story> {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("stories")
    .insert([
      {
        ...story,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create story: ${error.message}`);
  }

  return data;
}

export async function uploadImage(file: File, storyId: string): Promise<string> {
  const supabase = createClient();
  const timestamp = Date.now();
  const fileExt = file.name.split(".").pop();
  const fileName = `${storyId}-${timestamp}.${fileExt}`;
  const filePath = fileName; // Don't include bucket name in path

  // First, check if bucket exists by trying to list it
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    throw new Error(`Failed to access storage: ${listError.message}. Please check your Supabase configuration.`);
  }

  const bucketExists = buckets?.some(bucket => bucket.name === "story-images");
  if (!bucketExists) {
    throw new Error(
      'Storage bucket "story-images" does not exist. Please create it in Supabase Dashboard → Storage and set it as Public.'
    );
  }

  const { error: uploadError } = await supabase.storage
    .from("story-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    if (uploadError.message.includes("row-level security")) {
      throw new Error(
        'Storage RLS policy error. Please execute the SQL in QUICK_FIX_STORAGE.sql in Supabase Dashboard → SQL Editor.'
      );
    }
    throw new Error(`Failed to upload image: ${uploadError.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("story-images").getPublicUrl(filePath);

  return publicUrl;
}

