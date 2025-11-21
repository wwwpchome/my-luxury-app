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
  is_public: boolean; // 隐私设置：true = 公开可见，false = 仅自己可见
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

// Get all public stories for plaza mode (只获取公开的故事)
export async function getAllStoriesForDate(date: Date): Promise<Story[]> {
  const supabase = createClient();
  const dateString = format(date, "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("story_date", dateString)
    .order("story_hour", { ascending: true });

  if (error) {
    // 如果 is_public 字段不存在，尝试不带该字段的查询
    if (error.message.includes("is_public") || error.message.includes("column")) {
      // 返回所有故事（如果字段不存在，说明隐私功能未启用）
      const { data: allData, error: allError } = await supabase
        .from("stories")
        .select("*")
        .eq("story_date", dateString)
        .order("story_hour", { ascending: true });

      if (allError) {
        throw new Error(`Failed to load stories: ${allError.message}`);
      }

      // 如果字段存在，过滤出公开的故事；如果不存在，返回所有故事
      return (allData ?? []).filter((story: any) => story.is_public !== false);
    }
    throw new Error(`Failed to load stories: ${error.message}`);
  }

  // 过滤出公开的故事（如果 is_public 字段存在）
  return (data ?? []).filter((story: any) => story.is_public !== false);
}

// Get user info for story display
export async function getUserInfo(userId: string): Promise<{ email: string | null; avatar_url: string | null }> {
  const supabase = createClient();
  
  // Try to get from auth.users (via RPC or by checking current user)
  // First, try to get current user to see if it matches
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  
  if (currentUser && currentUser.id === userId) {
    return {
      email: currentUser.email || null,
      avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || null,
    };
  }

  // For other users, we can't directly query auth.users, so we'll use a workaround
  // Check if there's a profiles table
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("email, avatar_url")
    .eq("id", userId)
    .single();

  if (!profileError && profileData) {
    return {
      email: profileData.email || null,
      avatar_url: profileData.avatar_url || null,
    };
  }

  // Fallback: return a display name based on user ID
  // This is a limitation - we can't query other users' emails from auth.users
  // In a production app, you'd create a profiles table that stores user info
  return {
    email: null,
    avatar_url: null,
  };
}

export async function createStory(story: {
  content: string;
  story_date: string;
  story_hour: number;
  mood_color: string | null;
  image_path?: string | null;
  is_public?: boolean; // 默认为 true
}): Promise<Story> {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // 准备插入数据，如果 is_public 字段不存在，则不包含它
  const insertData: any = {
    ...story,
    user_id: user.id,
  };

  // 只在 is_public 字段存在时添加它
  // 如果数据库中没有该字段，尝试插入时会失败，但我们先尝试添加
  insertData.is_public = story.is_public ?? true;

  const { data, error } = await supabase
    .from("stories")
    .insert([insertData])
    .select("*")
    .single();

  if (error) {
    // 如果错误是因为 is_public 字段不存在，尝试不包含该字段
    if (error.message.includes("is_public") || error.message.includes("column")) {
      const { is_public, ...storyWithoutPrivacy } = insertData;
      const { data: retryData, error: retryError } = await supabase
        .from("stories")
        .insert([storyWithoutPrivacy])
        .select("*")
        .single();

      if (retryError) {
        throw new Error(`Failed to create story: ${retryError.message}`);
      }

      return retryData;
    }
    throw new Error(`Failed to create story: ${error.message}`);
  }

  return data;
}

export async function updateStory(
  storyId: string,
  updates: {
    content?: string;
    mood_color?: string | null;
    image_path?: string | null;
    is_public?: boolean;
  }
): Promise<Story> {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // First verify the story belongs to the user
  const { data: existingStory, error: fetchError } = await supabase
    .from("stories")
    .select("user_id")
    .eq("id", storyId)
    .single();

  if (fetchError || !existingStory) {
    throw new Error("Story not found");
  }

  if (existingStory.user_id !== user.id) {
    throw new Error("You don't have permission to update this story");
  }

  const { data, error } = await supabase
    .from("stories")
    .update(updates)
    .eq("id", storyId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update story: ${error.message}`);
  }

  return data;
}

export async function deleteStory(storyId: string): Promise<void> {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // First verify the story belongs to the user
  const { data: existingStory, error: fetchError } = await supabase
    .from("stories")
    .select("user_id, image_path")
    .eq("id", storyId)
    .single();

  if (fetchError || !existingStory) {
    throw new Error("Story not found");
  }

  if (existingStory.user_id !== user.id) {
    throw new Error("You don't have permission to delete this story");
  }

  // Delete image from storage if exists
  if (existingStory.image_path) {
    try {
      // Extract file path from URL
      const url = new URL(existingStory.image_path);
      const pathParts = url.pathname.split("/");
      const fileName = pathParts[pathParts.length - 1];
      
      await supabase.storage.from("story-images").remove([fileName]);
    } catch (error) {
      // Log but don't fail if image deletion fails
      console.error("Failed to delete image:", error);
    }
  }

  // Delete story
  const { error: deleteError } = await supabase
    .from("stories")
    .delete()
    .eq("id", storyId);

  if (deleteError) {
    throw new Error(`Failed to delete story: ${deleteError.message}`);
  }
}

export async function getStoryById(storyId: string): Promise<Story | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("id", storyId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Story not found
    }
    throw new Error(`Failed to load story: ${error.message}`);
  }

  return data;
}

// Get dates that have stories (for calendar highlighting)
export async function getStoryDates(userId?: string): Promise<Date[]> {
  const supabase = createClient();

  let query = supabase.from("stories").select("story_date");

  // If userId is provided, filter by user; otherwise get all dates (plaza mode)
  if (userId) {
    query = query.eq("user_id", userId);
  } else {
    // Get current user for filtering
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      query = query.eq("user_id", user.id);
    }
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to load story dates: ${error.message}`);
  }

  // Get unique dates and convert to Date objects
  const uniqueDates = Array.from(
    new Set(data?.map((story) => story.story_date) || [])
  );
  
  return uniqueDates.map((dateString) => {
    // Parse YYYY-MM-DD format to Date
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  });
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

