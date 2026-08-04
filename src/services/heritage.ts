/**
 * Heritage modules (future features).
 *
 * Grouped here because they share the same shape: bilingual, published-gated,
 * public read / staff write. Split into separate files only if one of them
 * grows its own mutations and workflows.
 *
 * - `family_members`   — village family tree (parent / spouse self-references).
 * - `timeline_entries` — historical timeline of the village.
 * - `memorials`        — memorial pages for villagers.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type FamilyMember = Tables<"family_members">;
export type TimelineEntry = Tables<"timeline_entries">;
export type Memorial = Tables<"memorials">;

function unwrap<T>(result: { data: T | null; error: { message: string } | null }): T | null {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

/* -------------------------------------------------- family tree */

/** All published people, optionally narrowed to one family surname. */
export async function fetchFamilyMembers(familyName?: string | null): Promise<FamilyMember[]> {
  let query = supabase
    .from("family_members")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("full_name_ar", { ascending: true });
  if (familyName) query = query.eq("family_name_ar", familyName);
  return unwrap(await query) ?? [];
}

export async function fetchFamilyMemberBySlug(slug: string): Promise<FamilyMember | null> {
  return unwrap(
    await supabase
      .from("family_members")
      .select("*")
      .eq("published", true)
      .eq("slug", slug)
      .maybeSingle(),
  );
}

/** Direct children of a person — the building block for tree rendering. */
export async function fetchChildren(parentId: string): Promise<FamilyMember[]> {
  return (
    unwrap(
      await supabase
        .from("family_members")
        .select("*")
        .eq("published", true)
        .or(`father_id.eq.${parentId},mother_id.eq.${parentId}`)
        .order("sort_order", { ascending: true }),
    ) ?? []
  );
}

/* -------------------------------------------------- timeline */

export async function fetchTimeline(): Promise<TimelineEntry[]> {
  return (
    unwrap(
      await supabase
        .from("timeline_entries")
        .select("*")
        .eq("published", true)
        .order("year", { ascending: true, nullsFirst: false })
        .order("sort_order", { ascending: true }),
    ) ?? []
  );
}

export async function fetchTimelineEntryBySlug(slug: string): Promise<TimelineEntry | null> {
  return unwrap(
    await supabase
      .from("timeline_entries")
      .select("*")
      .eq("published", true)
      .eq("slug", slug)
      .maybeSingle(),
  );
}

/* -------------------------------------------------- memorials */

export async function fetchMemorials(limit = 48): Promise<Memorial[]> {
  return (
    unwrap(
      await supabase
        .from("memorials")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(limit),
    ) ?? []
  );
}

export async function fetchMemorialBySlug(slug: string): Promise<Memorial | null> {
  return unwrap(
    await supabase
      .from("memorials")
      .select("*")
      .eq("published", true)
      .eq("slug", slug)
      .maybeSingle(),
  );
}
