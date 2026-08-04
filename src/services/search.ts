/**
 * Site-wide search module (future search engine).
 *
 * Backed by the denormalised `search_index` table: one row per searchable
 * entity (article, event, album, archive item, map location, memorial, ...),
 * with bilingual title/body columns and trigram indexes for fast `ilike`.
 *
 * Indexing is a staff/server responsibility — `upsertSearchDocument` exists so
 * an admin tool or server function can keep the index in sync after writes.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type SearchDocument = Tables<"search_index">;

/** Entity kinds represented in the index. */
export type SearchEntityType =
  | "article"
  | "event"
  | "album"
  | "gallery"
  | "archive_item"
  | "map_location"
  | "family_member"
  | "timeline_entry"
  | "memorial";

/** Full-site search across both languages. */
export async function searchSite(params: {
  term: string;
  types?: SearchEntityType[];
  limit?: number;
}): Promise<SearchDocument[]> {
  const term = params.term.trim();
  if (!term) return [];
  const escaped = term.replace(/[%,()]/g, " ");

  let query = supabase
    .from("search_index")
    .select("*")
    .eq("published", true)
    .or(
      [
        `title_ar.ilike.%${escaped}%`,
        `title_en.ilike.%${escaped}%`,
        `body_ar.ilike.%${escaped}%`,
        `body_en.ilike.%${escaped}%`,
      ].join(","),
    )
    .limit(params.limit ?? 30);

  if (params.types?.length) query = query.in("entity_type", params.types);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Staff-only: insert or refresh one index row (unique per entity). */
export async function upsertSearchDocument(doc: TablesInsert<"search_index">): Promise<void> {
  const { error } = await supabase
    .from("search_index")
    .upsert(doc, { onConflict: "entity_type,entity_id" });
  if (error) throw new Error(error.message);
}
