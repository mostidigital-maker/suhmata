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
export type EventMedia = Tables<"event_media">;
export type GalleryItem = Tables<"gallery">;
export type Album = Tables<"albums">;
export type Category = Tables<"categories">;
export type ArchiveItem = Tables<"archive_items">;
export type MapLocation = Tables<"map_locations">;
export type MapLocationMedia = Tables<"map_location_media">;
export type Contribution = Tables<"contributions">;
export type GuestbookEntry = Tables<"guestbook">;
export type VisitorVideo = Tables<"visitor_videos">;
export type SiteSettings = Tables<"settings">;

export type ArchiveKind = "document" | "map" | "photo" | "audio" | "video" | "pdf";
export type ContributionKind = "story" | "image" | "video";

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T | null {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

/* -------------------------------------------------- home page content */

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

/* -------------------------------------------------- taxonomy */

export async function fetchCategories(): Promise<Category[]> {
  return (
    unwrap(
      await supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name_en", { ascending: true }),
    ) ?? []
  );
}

/* -------------------------------------------------- articles */

export async function fetchArticles(limit = 3): Promise<Article[]> {
  return (
    unwrap(
      await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("published_at", { ascending: false })
        .limit(limit),
    ) ?? []
  );
}

export async function searchArticles(params: {
  search?: string;
  categoryId?: string | null;
  limit?: number;
}): Promise<Article[]> {
  const term = params.search?.trim();
  let query = supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(params.limit ?? 24);

  if (params.categoryId) query = query.eq("category_id", params.categoryId);
  if (term) {
    const escaped = term.replace(/[%,()]/g, " ");
    query = query.or(
      [
        `title_ar.ilike.%${escaped}%`,
        `title_en.ilike.%${escaped}%`,
        `excerpt_ar.ilike.%${escaped}%`,
        `excerpt_en.ilike.%${escaped}%`,
      ].join(","),
    );
  }

  return unwrap(await query) ?? [];
}

export async function fetchFeaturedArticle(): Promise<Article | null> {
  return unwrap(
    await supabase
      .from("articles")
      .select("*")
      .eq("published", true)
      .eq("featured", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  );
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  return unwrap(
    await supabase.from("articles").select("*").eq("published", true).eq("slug", slug).maybeSingle(),
  );
}

export async function fetchRelatedArticles(article: Article, limit = 3): Promise<Article[]> {
  let query = supabase
    .from("articles")
    .select("*")
    .eq("published", true)
    .neq("id", article.id)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (article.category_id) query = query.eq("category_id", article.category_id);
  return unwrap(await query) ?? [];
}

/* -------------------------------------------------- events */

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

export async function fetchUpcomingEvents(limit = 24): Promise<VillageEvent[]> {
  return (
    unwrap(
      await supabase
        .from("events")
        .select("*")
        .eq("archived", false)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(limit),
    ) ?? []
  );
}

export async function fetchPastEvents(limit = 24): Promise<VillageEvent[]> {
  return (
    unwrap(
      await supabase
        .from("events")
        .select("*")
        .or(`archived.eq.true,event_date.lt.${new Date().toISOString()}`)
        .order("event_date", { ascending: false })
        .limit(limit),
    ) ?? []
  );
}

export async function fetchEventBySlug(slug: string): Promise<VillageEvent | null> {
  return unwrap(await supabase.from("events").select("*").eq("slug", slug).maybeSingle());
}

export async function fetchEventMedia(eventId: string): Promise<EventMedia[]> {
  return (
    unwrap(
      await supabase
        .from("event_media")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: true }),
    ) ?? []
  );
}

/* -------------------------------------------------- gallery & albums */

export async function fetchAlbums(): Promise<Album[]> {
  return (
    unwrap(
      await supabase
        .from("albums")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ) ?? []
  );
}

export async function fetchAlbumBySlug(slug: string): Promise<Album | null> {
  return unwrap(await supabase.from("albums").select("*").eq("slug", slug).maybeSingle());
}

export async function fetchGallery(limit = 12): Promise<GalleryItem[]> {
  return (
    unwrap(
      await supabase
        .from("gallery")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(limit),
    ) ?? []
  );
}

export const GALLERY_PAGE_SIZE = 12;

/** Paged gallery read used by the infinite-scroll masonry grid. */
export async function fetchGalleryPage(params: {
  albumId?: string | null;
  page: number;
  pageSize?: number;
}): Promise<GalleryItem[]> {
  const size = params.pageSize ?? GALLERY_PAGE_SIZE;
  const from = params.page * size;
  let query = supabase
    .from("gallery")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .range(from, from + size - 1);
  if (params.albumId) query = query.eq("album_id", params.albumId);
  return unwrap(await query) ?? [];
}

/* -------------------------------------------------- historical archive */

export async function fetchArchiveItems(kind?: ArchiveKind | null): Promise<ArchiveItem[]> {
  let query = supabase
    .from("archive_items")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (kind) query = query.eq("kind", kind);
  return unwrap(await query) ?? [];
}

export async function fetchArchiveItemBySlug(slug: string): Promise<ArchiveItem | null> {
  return unwrap(
    await supabase
      .from("archive_items")
      .select("*")
      .eq("published", true)
      .eq("slug", slug)
      .maybeSingle(),
  );
}

/* -------------------------------------------------- interactive map */

export async function fetchMapLocations(): Promise<MapLocation[]> {
  return (
    unwrap(
      await supabase
        .from("map_locations")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ) ?? []
  );
}

export async function fetchLocationMedia(locationId: string): Promise<MapLocationMedia[]> {
  return (
    unwrap(
      await supabase
        .from("map_location_media")
        .select("*")
        .eq("location_id", locationId)
        .order("sort_order", { ascending: true }),
    ) ?? []
  );
}

/* -------------------------------------------------- visitor contributions */

export async function fetchApprovedContributions(
  kind?: ContributionKind | null,
  limit = 24,
): Promise<Contribution[]> {
  let query = supabase
    .from("contributions")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (kind) query = query.eq("kind", kind);
  return unwrap(await query) ?? [];
}

/** Public submission — always stored as pending, reviewed by staff. */
export async function submitContribution(
  entry: Pick<
    TablesInsert<"contributions">,
    "kind" | "contributor_name" | "email" | "social_link" | "title" | "body" | "media_url"
  >,
): Promise<void> {
  const { error } = await supabase.from("contributions").insert({ ...entry, status: "pending" });
  if (error) throw new Error(error.message);
}

/** Uploads a visitor file to the media library and returns its stored path. */
export async function uploadContributionFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `contributions/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

/* -------------------------------------------------- legacy guestbook & videos */

export async function fetchGuestbook(limit = 6): Promise<GuestbookEntry[]> {
  return (
    unwrap(
      await supabase
        .from("guestbook")
        .select("*")
        .eq("approved", true)
        .eq("hidden", false)
        .order("created_at", { ascending: false })
        .limit(limit),
    ) ?? []
  );
}

export async function fetchApprovedVideos(limit = 24): Promise<VisitorVideo[]> {
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

/** Public submission — always stored unapproved, moderated by staff. */
export async function submitGuestbookEntry(
  entry: Pick<
    TablesInsert<"guestbook">,
    "name" | "email" | "social_link" | "facebook" | "instagram" | "message"
  >,
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

/** Uploads a visitor video file to the media library and returns its stored path. */
export async function uploadVisitorVideoFile(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
  const path = `visitor-videos/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

