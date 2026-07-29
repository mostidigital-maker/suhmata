import { queryOptions } from "@tanstack/react-query";
import {
  fetchArticles,
  fetchAssociationMessage,
  fetchEvents,
  fetchGallery,
  fetchGuestbook,
  fetchHeroContent,
  fetchHistory,
  fetchSettings,
} from "./content";

export const contentQueries = {
  hero: () => queryOptions({ queryKey: ["hero_content"], queryFn: fetchHeroContent }),
  association: () =>
    queryOptions({ queryKey: ["association_message"], queryFn: fetchAssociationMessage }),
  history: () => queryOptions({ queryKey: ["history"], queryFn: fetchHistory }),
  articles: (limit = 3) =>
    queryOptions({ queryKey: ["articles", limit], queryFn: () => fetchArticles(limit) }),
  events: (limit = 6) =>
    queryOptions({ queryKey: ["events", limit], queryFn: () => fetchEvents(limit) }),
  gallery: (limit = 12) =>
    queryOptions({ queryKey: ["gallery", limit], queryFn: () => fetchGallery(limit) }),
  guestbook: (limit = 6) =>
    queryOptions({ queryKey: ["guestbook", limit], queryFn: () => fetchGuestbook(limit) }),
  settings: () => queryOptions({ queryKey: ["settings"], queryFn: fetchSettings }),
};
