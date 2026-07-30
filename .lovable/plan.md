## Goal

Grow the current one-page heritage site into a multi-page cultural archive platform: gallery albums, events with detail pages, articles with search, a historical archive, visitor contributions, an interactive village map, plus performance, accessibility and SEO work.

This is large, so it's split into phases. Each phase ends with a working site.

## Phase 1 — Database & storage foundation

New tables (all bilingual `_ar` / `_en`, all with row-level security, public reads limited to published/approved rows, staff-only writes):

- `albums` — gallery albums with category, cover, sort order; `gallery` gains `album_id`, `sort_order`, `width`/`height` for masonry.
- `categories` — shared taxonomy for articles and archive items.
- `articles` gains `slug`, `excerpt_ar/en`, `category_id`, `reading_minutes`, `published_at`.
- `events` gains `slug`, `status` (upcoming/past), `summary` fields already exist; new `event_media` table (image/video per event).
- `archive_items` — historical documents, maps, old photos, audio, video, PDFs: `kind`, `file_url`, `thumbnail_url`, `year`, `source`, description fields.
- `map_locations` — name, `kind` (mosque, cemetery, school, well, family home, landmark), `lat`/`lng` (or normalized x/y on the historical map), description, historical notes; `map_location_media` for photos.
- `contributions` — unified visitor submissions (story / image / video) with `status` pending → approved/rejected, replacing/absorbing the current guestbook + visitor_videos flows (existing rows migrated, old tables kept read-compatible).

Storage: reuse the private `media` bucket, add public-read policies for approved archive/gallery assets via signed URL helper already in `src/lib/media.ts`.

Seed data: representative rows for every table so each new page renders real content immediately.

## Phase 2 — Routes & navigation

New routes under `src/routes/`:

```text
/gallery                 album grid + category filter
/gallery/$album          masonry, lightbox, zoom, infinite scroll
/events                  upcoming + past archive tabs
/events/$slug            details, photo + video gallery, summary, share
/articles                search, category filter, featured article
/articles/$slug          reading time, related articles, share, JSON-LD
/archive                 filter by kind (docs, maps, photos, audio, video, PDF)
/archive/$id             viewer + download
/map                     interactive village map
/contribute              story / image / video submission
```

Home page keeps its sections but each links into the new pages. Header/footer navigation updated; mobile menu included.

## Phase 3 — Feature components

- **Gallery**: CSS-columns masonry, `IntersectionObserver` infinite scroll paging the backend, accessible full-screen lightbox (focus trap, Esc/arrow keys) with pinch/scroll zoom and pan.
- **Events**: date-partitioned upcoming vs past, media tabs, post-event summary block, Web Share API with clipboard fallback.
- **Articles**: debounced search over title/excerpt, category chips, featured hero card, computed reading time, related-by-category list, share buttons.
- **Archive**: type-filtered grid, inline PDF/audio/video players, download links.
- **Map**: SVG/canvas overlay on the historical village map image with markers per location type, keyboard-navigable marker list, side panel with description, photos and historical notes. (No external map provider needed — it's a historical village map. If you'd prefer a real geographic map, that needs a Mapbox or Google Maps connection.)
- **Contributions**: single form with type switcher, file upload to storage, zod validation, always saved as pending; admin dashboard gains moderation queues for each type.

## Phase 4 — Performance, accessibility, SEO

- Performance: route-level code splitting, `vite-imagetools` for WebP/AVIF variants, width/height on all images, lazy media, LCP preload on hero, query-level pagination.
- Accessibility: single `<main>` per page, skip link, visible focus rings, labelled controls, `aria-live` for async results, 44px tap targets, full keyboard paths through lightbox and map.
- SEO: per-route `head()` with title/description/OG/Twitter, JSON-LD (Organization, Article, Event, ImageGallery, BreadcrumbList), dynamic sitemap covering every article, event, album, archive item and location, robots.txt kept as is.

## Technical notes

- Data access stays in `src/services/*` with TanStack Query `queryOptions`; components never touch the database client directly.
- Public reads use public server functions / anon-safe policies; all writes and moderation go through authenticated paths.
- Bilingual content continues through the `useLocalizedField` hook; all new UI strings added to `src/i18n/translations.ts`.

## Suggested order

I'd implement Phase 1 + 2 first (database, routes, navigation shell), then Phase 3 feature by feature, then Phase 4 across the whole site. Say the word and I'll start with Phase 1.
