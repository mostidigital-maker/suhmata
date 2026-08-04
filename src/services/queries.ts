import { queryOptions, infiniteQueryOptions } from "@tanstack/react-query";
import {
  fetchAlbumBySlug,
  fetchAlbums,
  fetchArchiveItemBySlug,
  fetchArchiveItems,
  fetchArticleBySlug,
  fetchArticles,
  fetchApprovedContributions,
  fetchApprovedVideos,
  fetchAssociationMessage,
  fetchCategories,
  fetchEventBySlug,
  fetchEventMedia,
  fetchEvents,
  fetchFeaturedArticle,
  fetchGallery,
  fetchGalleryPage,
  fetchGuestbook,
  fetchHeroContent,
  fetchHistory,
  fetchLocationMedia,
  fetchMapLocations,
  fetchPastEvents,
  fetchRelatedArticles,
  fetchSettings,
  fetchUpcomingEvents,
  searchArticles,
  GALLERY_PAGE_SIZE,
  type Article,
  type ArchiveKind,
  type ContributionKind,
} from "./content";
import {
  fetchCampaignBySlug,
  fetchDonationCampaigns,
  fetchPaymentMethods,
  fetchPublicDonations,
} from "./donations";
import {
  fetchChildren,
  fetchFamilyMemberBySlug,
  fetchFamilyMembers,
  fetchMemorialBySlug,
  fetchMemorials,
  fetchTimeline,
  fetchTimelineEntryBySlug,
} from "./heritage";
import { fetchNotificationLog } from "./notifications";
import { searchSite, type SearchEntityType } from "./search";

export const contentQueries = {
  hero: () => queryOptions({ queryKey: ["hero_content"], queryFn: fetchHeroContent }),
  association: () =>
    queryOptions({ queryKey: ["association_message"], queryFn: fetchAssociationMessage }),
  history: () => queryOptions({ queryKey: ["history"], queryFn: fetchHistory }),
  settings: () => queryOptions({ queryKey: ["settings"], queryFn: fetchSettings }),
  categories: () => queryOptions({ queryKey: ["categories"], queryFn: fetchCategories }),

  articles: (limit = 3) =>
    queryOptions({ queryKey: ["articles", limit], queryFn: () => fetchArticles(limit) }),
  articleSearch: (search: string, categoryId: string | null) =>
    queryOptions({
      queryKey: ["articles", "search", search, categoryId],
      queryFn: () => searchArticles({ search, categoryId }),
    }),
  featuredArticle: () =>
    queryOptions({ queryKey: ["articles", "featured"], queryFn: fetchFeaturedArticle }),
  article: (slug: string) =>
    queryOptions({ queryKey: ["articles", "slug", slug], queryFn: () => fetchArticleBySlug(slug) }),
  relatedArticles: (article: Article | null | undefined) =>
    queryOptions({
      queryKey: ["articles", "related", article?.id],
      enabled: Boolean(article),
      queryFn: () => (article ? fetchRelatedArticles(article) : Promise.resolve([])),
    }),

  events: (limit = 6) =>
    queryOptions({ queryKey: ["events", limit], queryFn: () => fetchEvents(limit) }),
  upcomingEvents: () =>
    queryOptions({ queryKey: ["events", "upcoming"], queryFn: () => fetchUpcomingEvents() }),
  pastEvents: () =>
    queryOptions({ queryKey: ["events", "past"], queryFn: () => fetchPastEvents() }),
  event: (slug: string) =>
    queryOptions({ queryKey: ["events", "slug", slug], queryFn: () => fetchEventBySlug(slug) }),
  eventMedia: (eventId: string | undefined) =>
    queryOptions({
      queryKey: ["event_media", eventId],
      enabled: Boolean(eventId),
      queryFn: () => (eventId ? fetchEventMedia(eventId) : Promise.resolve([])),
    }),

  albums: () => queryOptions({ queryKey: ["albums"], queryFn: fetchAlbums }),
  album: (slug: string) =>
    queryOptions({ queryKey: ["albums", "slug", slug], queryFn: () => fetchAlbumBySlug(slug) }),
  gallery: (limit = 12) =>
    queryOptions({ queryKey: ["gallery", limit], queryFn: () => fetchGallery(limit) }),
  galleryPages: (albumId: string | null | undefined) =>
    infiniteQueryOptions({
      queryKey: ["gallery", "pages", albumId ?? "all"],
      initialPageParam: 0,
      enabled: albumId !== undefined,
      queryFn: ({ pageParam }) => fetchGalleryPage({ albumId, page: pageParam }),
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length < GALLERY_PAGE_SIZE ? undefined : allPages.length,
    }),

  archiveItems: (kind: ArchiveKind | null) =>
    queryOptions({ queryKey: ["archive_items", kind], queryFn: () => fetchArchiveItems(kind) }),
  archiveItem: (slug: string) =>
    queryOptions({
      queryKey: ["archive_items", "slug", slug],
      queryFn: () => fetchArchiveItemBySlug(slug),
    }),

  mapLocations: () => queryOptions({ queryKey: ["map_locations"], queryFn: fetchMapLocations }),
  locationMedia: (locationId: string | undefined) =>
    queryOptions({
      queryKey: ["map_location_media", locationId],
      enabled: Boolean(locationId),
      queryFn: () => (locationId ? fetchLocationMedia(locationId) : Promise.resolve([])),
    }),

  contributions: (kind: ContributionKind | null = null) =>
    queryOptions({
      queryKey: ["contributions", kind],
      queryFn: () => fetchApprovedContributions(kind),
    }),
  guestbook: (limit = 6) =>
    queryOptions({ queryKey: ["guestbook", limit], queryFn: () => fetchGuestbook(limit) }),
  approvedVideos: (limit = 24) =>
    queryOptions({
      queryKey: ["visitor_videos", "approved", limit],
      queryFn: () => fetchApprovedVideos(limit),
    }),
};

/**
 * Query factories for the future-facing modules. Kept in their own namespaces
 * so a feature can be shipped (or removed) without touching `contentQueries`.
 */
export const donationQueries = {
  paymentMethods: () =>
    queryOptions({ queryKey: ["payment_methods"], queryFn: fetchPaymentMethods }),
  campaigns: () =>
    queryOptions({ queryKey: ["donation_campaigns"], queryFn: fetchDonationCampaigns }),
  campaign: (slug: string) =>
    queryOptions({
      queryKey: ["donation_campaigns", "slug", slug],
      queryFn: () => fetchCampaignBySlug(slug),
    }),
  publicDonations: (campaignId: string | null = null) =>
    queryOptions({
      queryKey: ["donations", "public", campaignId],
      queryFn: () => fetchPublicDonations(campaignId),
    }),
};

export const heritageQueries = {
  familyMembers: (familyName: string | null = null) =>
    queryOptions({
      queryKey: ["family_members", familyName],
      queryFn: () => fetchFamilyMembers(familyName),
    }),
  familyMember: (slug: string) =>
    queryOptions({
      queryKey: ["family_members", "slug", slug],
      queryFn: () => fetchFamilyMemberBySlug(slug),
    }),
  children: (parentId: string | undefined) =>
    queryOptions({
      queryKey: ["family_members", "children", parentId],
      enabled: Boolean(parentId),
      queryFn: () => (parentId ? fetchChildren(parentId) : Promise.resolve([])),
    }),

  timeline: () => queryOptions({ queryKey: ["timeline_entries"], queryFn: fetchTimeline }),
  timelineEntry: (slug: string) =>
    queryOptions({
      queryKey: ["timeline_entries", "slug", slug],
      queryFn: () => fetchTimelineEntryBySlug(slug),
    }),

  memorials: (limit = 48) =>
    queryOptions({ queryKey: ["memorials", limit], queryFn: () => fetchMemorials(limit) }),
  memorial: (slug: string) =>
    queryOptions({ queryKey: ["memorials", "slug", slug], queryFn: () => fetchMemorialBySlug(slug) }),
};

export const searchQueries = {
  site: (term: string, types: SearchEntityType[] = []) =>
    queryOptions({
      queryKey: ["search_index", term, types],
      enabled: term.trim().length > 1,
      queryFn: () => searchSite({ term, types }),
    }),
};

export const notificationQueries = {
  log: (limit = 50) =>
    queryOptions({
      queryKey: ["notification_log", limit],
      queryFn: () => fetchNotificationLog(limit),
    }),
};
