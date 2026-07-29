/**
 * Content service layer.
 *
 * All site content lives in the backend. Components never talk to the
 * database client directly — they consume these typed, reusable services.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type HeroContent = Tables<"hero_content">;
export type AssociationMessage = Tables<"association_message">;
export type HistoryEntry = Tables<"history">;
export type Article = Tables<"articles">;
export type VillageEvent = Tables<"events">;
export type GalleryItem = Tables<"gallery">;
export type GuestbookEntry = Tables<"guestbook">;
export type VisitorVideo = Tables<"visitor_videos">;
export type SiteSettings = Tables<"settings">;

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T | null {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function fetchHeroContent(): Promise<HeroContent | null> {
  return unwrap(
    await supabase
      .from("hero_content")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  );
}

export async function fetchAssociationMessage(): Promise<AssociationMessage | null> {
  return unwrap(
    await supabase
      .from("association_message")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  );
}

export async function fetchHistory(): Promise<HistoryEntry[]> {
  return (
    unwrap(
      await supabase
        .from("history")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ) ?? []
  );
}

export async function fetchArticles(limit = 3): Promise<Article[]> {
  return (
    unwrap(
      await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit),
    ) ?? []
  );
}

export async function fetchEvents(limit = 6): Promise<VillageEvent[]> {
  return (
    unwrap(
      await supabase
        .from("events")
        .select("*")
        .eq("archived", false)
        .order("event_date", { ascending: true })
        .limit(limit),
    ) ?? []
  );
}

export async function fetchGallery(limit = 12): Promise<GalleryItem[]> {
  return (
    unwrap(
      await supabase
        .from("gallery")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(limit),
    ) ?? []
  );
}

export async function fetchGuestbook(limit = 6): Promise<GuestbookEntry[]> {
  return (
    unwrap(
      await supabase
        .from("guestbook")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false })
        .limit(limit),
    ) ?? []
  );
}

export async function fetchApprovedVideos(limit = 6): Promise<VisitorVideo[]> {
  return (
    unwrap(
      await supabase
        .from("visitor_videos")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(limit),
    ) ?? []
  );
}

export async function fetchSettings(): Promise<SiteSettings | null> {
  return unwrap(
    await supabase
      .from("settings")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
  );
}

/** Public submission — always stored unapproved, moderated by staff. */
export async function submitGuestbookEntry(
  entry: Pick<TablesInsert<"guestbook">, "name" | "email" | "social_link" | "message">,
): Promise<void> {
  const { error } = await supabase.from("guestbook").insert({ ...entry, approved: false });
  if (error) throw new Error(error.message);
}

/** Public submission — always stored as pending, reviewed by staff. */
export async function submitVisitorVideo(
  entry: Pick<
    TablesInsert<"visitor_videos">,
    "visitor_name" | "email" | "social_link" | "video_url"
  >,
): Promise<void> {
  const { error } = await supabase.from("visitor_videos").insert({ ...entry, status: "pending" });
  if (error) throw new Error(error.message);
}
