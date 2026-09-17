import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Archive,
  Calendar,
  ImageUp,
  Images,
  MapPin,
  Newspaper,
  Pencil,
  Plus,
  Save,
  Settings2,
  Trash2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { useMediaSrc } from "@/hooks/useMediaSrc";
import { resolveMediaUrl } from "@/lib/media";

type Article = Tables<"articles">;
type Hero = Tables<"hero_content">;
type MapLocation = Tables<"map_locations">;

const inputClass =
  "min-h-11 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring";

const emptyArticle: TablesInsert<"articles"> = {
  title_ar: "",
  title_en: "",
  excerpt_ar: "",
  excerpt_en: "",
  content_ar: "",
  content_en: "",
  slug: "",
  cover_image: null,
  category_id: null,
  published: false,
  featured: false,
  reading_minutes: 3,
};

const emptyLocation: TablesInsert<"map_locations"> = {
  slug: "",
  kind: "landmark",
  name_ar: "",
  name_en: "",
  description_ar: "",
  description_en: "",
  notes_ar: "",
  notes_en: "",
  pos_x: 50,
  pos_y: 50,
  sort_order: 0,
};

const emptyEvent: TablesInsert<"events"> = {
  slug: "",
  title_ar: "",
  title_en: "",
  summary_ar: "",
  summary_en: "",
  description_ar: "",
  description_en: "",
  event_date: null,
  location: "",
  cover_image: null,
  archived: false,
};

const emptyAlbum: TablesInsert<"albums"> = {
  slug: "",
  title_ar: "",
  title_en: "",
  description_ar: "",
  description_en: "",
  category_id: null,
  cover_image: null,
  sort_order: 0,
};

const emptyPhoto: TablesInsert<"gallery"> = {
  album_id: null,
  media_url: "",
  media_type: "image",
  caption_ar: "",
  caption_en: "",
  sort_order: 0,
};

const emptyArchiveItem: TablesInsert<"archive_items"> = {
  slug: "",
  kind: "document",
  title_ar: "",
  title_en: "",
  description_ar: "",
  description_en: "",
  notes_ar: "",
  notes_en: "",
  file_url: "",
  thumbnail_url: null,
  year: "",
  source: "",
  category_id: null,
  downloadable: true,
  published: true,
};

const emptyHistoryItem: TablesInsert<"history"> = {
  title_ar: "",
  title_en: "",
  content_ar: "",
  content_en: "",
  sort_order: 0,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uploadImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) throw new Error("Please select an image file.");
  if (file.size > 8 * 1024 * 1024) throw new Error("Image must be smaller than 8 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

type ContentManagerProps = {
  /** Site identity + settings (logo, background, name, rights, contact) — super_admin only. */
  canEditIdentity: boolean;
  /** Articles + map locations — admin and super_admin. */
  canEditContent: boolean;
};

export function ContentManager({ canEditIdentity, canEditContent }: ContentManagerProps) {
  const queryClient = useQueryClient();
  const [heroForm, setHeroForm] = useState({
    title_ar: "",
    title_en: "",
    subtitle_ar: "",
    subtitle_en: "",
    district_ar: "",
    district_en: "",
    background_image: "",
  });
  const [articleForm, setArticleForm] = useState<TablesInsert<"articles">>(emptyArticle);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [associationForm, setAssociationForm] = useState({
    title_ar: "",
    title_en: "",
    content_ar: "",
    content_en: "",
    author_name_ar: "",
    author_name_en: "",
    author_title_ar: "",
    author_title_en: "",
    image: "",
  });
  const [historyIntroForm, setHistoryIntroForm] = useState({
    title_ar: "",
    title_en: "",
    body_ar: "",
    body_en: "",
    image: "",
  });
  const [locationIntroForm, setLocationIntroForm] = useState({
    title_ar: "",
    title_en: "",
    body_ar: "",
    body_en: "",
    image: "",
  });
  const [settingsForm, setSettingsForm] = useState({
    logo: "",
    about_ar: "",
    about_en: "",
    contact_email: "",
    phone: "",
    address_ar: "",
    address_en: "",
    rights_ar: "",
    rights_en: "",
    facebook: "",
    instagram: "",
    whatsapp: "",
    google_maps: "",
    waze: "",
    map_embed_url: "",
    location_district_ar: "",
    location_district_en: "",
    location_altitude_ar: "",
    location_altitude_en: "",
    location_land_area_ar: "",
    location_land_area_en: "",
    location_population_ar: "",
    location_population_en: "",
  });
  const [locationForm, setLocationForm] = useState<TablesInsert<"map_locations">>(emptyLocation);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<TablesInsert<"events">>(emptyEvent);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [albumForm, setAlbumForm] = useState<TablesInsert<"albums">>(emptyAlbum);
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [photoForm, setPhotoForm] = useState<TablesInsert<"gallery">>(emptyPhoto);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [archiveForm, setArchiveForm] = useState<TablesInsert<"archive_items">>(emptyArchiveItem);
  const [editingArchiveId, setEditingArchiveId] = useState<string | null>(null);
  const [historyItemForm, setHistoryItemForm] = useState<TablesInsert<"history">>(emptyHistoryItem);
  const [editingHistoryItemId, setEditingHistoryItemId] = useState<string | null>(null);

  // Uploads store a bare storage path (e.g. "site/uuid.jpg"), not a
  // directly-loadable URL — resolve each preview thumbnail the same way
  // the public site does, or the thumbnail shows broken right after upload.
  const settingsLogoPreview = useMediaSrc(settingsForm.logo);
  const associationImagePreview = useMediaSrc(associationForm.image);
  const historyIntroImagePreview = useMediaSrc(historyIntroForm.image);
  const locationIntroImagePreview = useMediaSrc(locationIntroForm.image);

  const heroQuery = useQuery({
    queryKey: ["admin", "hero"],
    enabled: canEditIdentity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_content")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const articlesQuery = useQuery({
    queryKey: ["admin", "articles"],
    enabled: canEditContent,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin", "categories"],
    enabled: canEditContent,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id,name_ar,name_en")
        .order("sort_order");
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    enabled: canEditIdentity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const associationQuery = useQuery({
    queryKey: ["admin", "association"],
    enabled: canEditIdentity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("association_message")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const sectionIntrosQuery = useQuery({
    queryKey: ["admin", "section_intros"],
    enabled: canEditIdentity,
    queryFn: async () => {
      const { data, error } = await supabase.from("section_intros").select("*");
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const locationsQuery = useQuery({
    queryKey: ["admin", "map_locations"],
    enabled: canEditContent,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("map_locations")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const eventsQuery = useQuery({
    queryKey: ["admin", "events"],
    enabled: canEditContent,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false, nullsFirst: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const albumsQuery = useQuery({
    queryKey: ["admin", "albums"],
    enabled: canEditContent,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const photosQuery = useQuery({
    queryKey: ["admin", "gallery"],
    enabled: canEditContent,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gallery")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const archiveItemsQuery = useQuery({
    queryKey: ["admin", "archive_items"],
    enabled: canEditContent,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("archive_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const historyItemsQuery = useQuery({
    queryKey: ["admin", "history_items"],
    enabled: canEditContent,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("history")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  useEffect(() => {
    const hero = heroQuery.data;
    if (!hero) return;
    setHeroForm({
      title_ar: hero.title_ar,
      title_en: hero.title_en,
      subtitle_ar: hero.subtitle_ar,
      subtitle_en: hero.subtitle_en,
      district_ar: hero.district_ar ?? "",
      district_en: hero.district_en ?? "",
      background_image: hero.background_image ?? "",
    });
  }, [heroQuery.data]);

  useEffect(() => {
    const association = associationQuery.data;
    if (!association) return;
    setAssociationForm({
      title_ar: association.title_ar,
      title_en: association.title_en,
      content_ar: association.content_ar,
      content_en: association.content_en,
      author_name_ar: association.author_name_ar ?? "",
      author_name_en: association.author_name_en ?? "",
      author_title_ar: association.author_title_ar ?? "",
      author_title_en: association.author_title_en ?? "",
      image: association.image ?? "",
    });
  }, [associationQuery.data]);

  useEffect(() => {
    const intros = sectionIntrosQuery.data;
    if (!intros) return;
    const history = intros.find((row) => row.key === "history");
    if (history) {
      setHistoryIntroForm({
        title_ar: history.title_ar,
        title_en: history.title_en,
        body_ar: history.body_ar,
        body_en: history.body_en,
        image: history.image ?? "",
      });
    }
    const location = intros.find((row) => row.key === "location");
    if (location) {
      setLocationIntroForm({
        title_ar: location.title_ar,
        title_en: location.title_en,
        body_ar: location.body_ar,
        body_en: location.body_en,
        image: location.image ?? "",
      });
    }
  }, [sectionIntrosQuery.data]);

  useEffect(() => {
    const settings = settingsQuery.data;
    if (!settings) return;
    setSettingsForm({
      logo: settings.logo ?? "",
      about_ar: settings.about_ar ?? "",
      about_en: settings.about_en ?? "",
      contact_email: settings.contact_email ?? "",
      phone: settings.phone ?? "",
      address_ar: settings.address_ar ?? "",
      address_en: settings.address_en ?? "",
      rights_ar: settings.rights_ar ?? "",
      rights_en: settings.rights_en ?? "",
      facebook: settings.facebook ?? "",
      instagram: settings.instagram ?? "",
      whatsapp: settings.whatsapp ?? "",
      google_maps: settings.google_maps ?? "",
      waze: settings.waze ?? "",
      map_embed_url: settings.map_embed_url ?? "",
      location_district_ar: settings.location_district_ar ?? "",
      location_district_en: settings.location_district_en ?? "",
      location_altitude_ar: settings.location_altitude_ar ?? "",
      location_altitude_en: settings.location_altitude_en ?? "",
      location_land_area_ar: settings.location_land_area_ar ?? "",
      location_land_area_en: settings.location_land_area_en ?? "",
      location_population_ar: settings.location_population_ar ?? "",
      location_population_en: settings.location_population_en ?? "",
    });
  }, [settingsQuery.data]);

  const saveHero = useMutation({
    mutationFn: async () => {
      const payload = {
        ...heroForm,
        district_ar: heroForm.district_ar || null,
        district_en: heroForm.district_en || null,
        background_image: heroForm.background_image || null,
      };
      const existing = heroQuery.data;
      const result = existing
        ? await supabase.from("hero_content").update(payload).eq("id", existing.id)
        : await supabase.from("hero_content").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "hero"] }),
        queryClient.invalidateQueries({ queryKey: ["hero_content"] }),
      ]);
      toast.success("Village identity updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const uploadHero = useMutation({
    mutationFn: (file: File) => uploadImage(file, "site"),
    onSuccess: (url) => {
      setHeroForm((current) => ({ ...current, background_image: url }));
      toast.success("Image uploaded. Save changes to publish it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const uploadLogo = useMutation({
    mutationFn: (file: File) => uploadImage(file, "site"),
    onSuccess: (url) => {
      setSettingsForm((current) => ({ ...current, logo: url }));
      toast.success("Logo uploaded. Save settings to publish it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const uploadAssociationImage = useMutation({
    mutationFn: (file: File) => uploadImage(file, "site"),
    onSuccess: (url) => {
      setAssociationForm((current) => ({ ...current, image: url }));
      toast.success("Image uploaded. Save to publish it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const uploadHistoryIntroImage = useMutation({
    mutationFn: (file: File) => uploadImage(file, "site"),
    onSuccess: (url) => {
      setHistoryIntroForm((current) => ({ ...current, image: url }));
      toast.success("Image uploaded. Save to publish it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const uploadLocationIntroImage = useMutation({
    mutationFn: (file: File) => uploadImage(file, "site"),
    onSuccess: (url) => {
      setLocationIntroForm((current) => ({ ...current, image: url }));
      toast.success("Image uploaded. Save to publish it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveAssociation = useMutation({
    mutationFn: async () => {
      const payload = {
        title_ar: associationForm.title_ar,
        title_en: associationForm.title_en,
        content_ar: associationForm.content_ar,
        content_en: associationForm.content_en,
        author_name_ar: associationForm.author_name_ar || null,
        author_name_en: associationForm.author_name_en || null,
        author_title_ar: associationForm.author_title_ar || null,
        author_title_en: associationForm.author_title_en || null,
        image: associationForm.image || null,
      };
      const existing = associationQuery.data;
      const result = existing
        ? await supabase.from("association_message").update(payload).eq("id", existing.id)
        : await supabase.from("association_message").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "association"] }),
        queryClient.invalidateQueries({ queryKey: ["association_message"] }),
      ]);
      toast.success("Welcome message updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveSectionIntro = useMutation({
    mutationFn: async ({
      key,
      form,
    }: {
      key: "history" | "location";
      form: { title_ar: string; title_en: string; body_ar: string; body_en: string; image: string };
    }) => {
      const existing = sectionIntrosQuery.data?.find((row) => row.key === key);
      const payload = {
        key,
        title_ar: form.title_ar,
        title_en: form.title_en,
        body_ar: form.body_ar,
        body_en: form.body_en,
        image: form.image || null,
      };
      const result = existing
        ? await supabase.from("section_intros").update(payload).eq("id", existing.id)
        : await supabase.from("section_intros").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "section_intros"] }),
        queryClient.invalidateQueries({ queryKey: ["section_intro"] }),
      ]);
      toast.success("Section updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveSettings = useMutation({
    mutationFn: async () => {
      const payload: TablesUpdate<"settings"> = {
        logo: settingsForm.logo || null,
        about_ar: settingsForm.about_ar || null,
        about_en: settingsForm.about_en || null,
        contact_email: settingsForm.contact_email || null,
        phone: settingsForm.phone || null,
        address_ar: settingsForm.address_ar || null,
        address_en: settingsForm.address_en || null,
        rights_ar: settingsForm.rights_ar || null,
        rights_en: settingsForm.rights_en || null,
        facebook: settingsForm.facebook || null,
        instagram: settingsForm.instagram || null,
        whatsapp: settingsForm.whatsapp || null,
        google_maps: settingsForm.google_maps || null,
        waze: settingsForm.waze || null,
        map_embed_url: settingsForm.map_embed_url || null,
        location_district_ar: settingsForm.location_district_ar || null,
        location_district_en: settingsForm.location_district_en || null,
        location_altitude_ar: settingsForm.location_altitude_ar || null,
        location_altitude_en: settingsForm.location_altitude_en || null,
        location_land_area_ar: settingsForm.location_land_area_ar || null,
        location_land_area_en: settingsForm.location_land_area_en || null,
        location_population_ar: settingsForm.location_population_ar || null,
        location_population_en: settingsForm.location_population_en || null,
      };
      const existing = settingsQuery.data;
      const result = existing
        ? await supabase.from("settings").update(payload).eq("id", existing.id)
        : await supabase.from("settings").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "settings"] }),
        queryClient.invalidateQueries({ queryKey: ["settings"] }),
      ]);
      toast.success("Site settings updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveLocation = useMutation({
    mutationFn: async () => {
      const name = String(locationForm.name_en || locationForm.name_ar || "location");
      const payload = {
        ...locationForm,
        slug: slugify(String(locationForm.slug || name)) || `location-${Date.now()}`,
        pos_x: Number(locationForm.pos_x) || 50,
        pos_y: Number(locationForm.pos_y) || 50,
        sort_order: Number(locationForm.sort_order) || 0,
      };
      const result = editingLocationId
        ? await supabase.from("map_locations").update(payload).eq("id", editingLocationId)
        : await supabase.from("map_locations").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      setLocationForm(emptyLocation);
      setEditingLocationId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "map_locations"] });
      await queryClient.invalidateQueries({ queryKey: ["map_locations"] });
      toast.success(editingLocationId ? "Location updated" : "Location added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeLocation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("map_locations").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "map_locations"] });
      await queryClient.invalidateQueries({ queryKey: ["map_locations"] });
      toast.success("Location deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const editLocation = (location: MapLocation) => {
    setEditingLocationId(location.id);
    setLocationForm({
      slug: location.slug,
      kind: location.kind,
      name_ar: location.name_ar,
      name_en: location.name_en,
      description_ar: location.description_ar,
      description_en: location.description_en,
      notes_ar: location.notes_ar,
      notes_en: location.notes_en,
      pos_x: location.pos_x,
      pos_y: location.pos_y,
      sort_order: location.sort_order,
    });
    document.getElementById("location-editor")?.scrollIntoView({ behavior: "smooth" });
  };

  const onLocationSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveLocation.mutate();
  };

  const uploadEventCover = useMutation({
    mutationFn: (file: File) => uploadImage(file, "events"),
    onSuccess: (url) => {
      setEventForm((current) => ({ ...current, cover_image: url }));
      toast.success("Image uploaded. Save the event to publish it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveEvent = useMutation({
    mutationFn: async () => {
      const title = String(eventForm.title_en || eventForm.title_ar || "event");
      const payload = {
        ...eventForm,
        slug: slugify(String(eventForm.slug || title)) || `event-${Date.now()}`,
        event_date: eventForm.event_date || null,
      };
      const result = editingEventId
        ? await supabase.from("events").update(payload).eq("id", editingEventId)
        : await supabase.from("events").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      setEventForm(emptyEvent);
      setEditingEventId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(editingEventId ? "Event updated" : "Event added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "events"] });
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Event deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const editEvent = (item: Tables<"events">) => {
    setEditingEventId(item.id);
    setEventForm({
      slug: item.slug,
      title_ar: item.title_ar,
      title_en: item.title_en,
      summary_ar: item.summary_ar,
      summary_en: item.summary_en,
      description_ar: item.description_ar,
      description_en: item.description_en,
      event_date: item.event_date,
      location: item.location,
      cover_image: item.cover_image,
      archived: item.archived,
    });
    document.getElementById("event-editor")?.scrollIntoView({ behavior: "smooth" });
  };

  const onEventSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveEvent.mutate();
  };

  const uploadAlbumCover = useMutation({
    mutationFn: (file: File) => uploadImage(file, "gallery"),
    onSuccess: (url) => {
      setAlbumForm((current) => ({ ...current, cover_image: url }));
      toast.success("Image uploaded. Save the album to publish it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveAlbum = useMutation({
    mutationFn: async () => {
      const title = String(albumForm.title_en || albumForm.title_ar || "album");
      const payload = {
        ...albumForm,
        slug: slugify(String(albumForm.slug || title)) || `album-${Date.now()}`,
        sort_order: Number(albumForm.sort_order) || 0,
      };
      const result = editingAlbumId
        ? await supabase.from("albums").update(payload).eq("id", editingAlbumId)
        : await supabase.from("albums").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      setAlbumForm(emptyAlbum);
      setEditingAlbumId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "albums"] });
      await queryClient.invalidateQueries({ queryKey: ["albums"] });
      toast.success(editingAlbumId ? "Album updated" : "Album added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeAlbum = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("albums").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "albums"] });
      await queryClient.invalidateQueries({ queryKey: ["albums"] });
      toast.success("Album deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const editAlbum = (item: Tables<"albums">) => {
    setEditingAlbumId(item.id);
    setAlbumForm({
      slug: item.slug,
      title_ar: item.title_ar,
      title_en: item.title_en,
      description_ar: item.description_ar,
      description_en: item.description_en,
      category_id: item.category_id,
      cover_image: item.cover_image,
      sort_order: item.sort_order,
    });
    document.getElementById("album-editor")?.scrollIntoView({ behavior: "smooth" });
  };

  const onAlbumSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveAlbum.mutate();
  };

  const uploadPhoto = useMutation({
    mutationFn: (file: File) => uploadImage(file, "gallery"),
    onSuccess: (url) => {
      setPhotoForm((current) => ({ ...current, media_url: url }));
      toast.success("Image uploaded. Save to publish it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const savePhoto = useMutation({
    mutationFn: async () => {
      if (!photoForm.media_url) throw new Error("Upload an image first.");
      const payload = {
        ...photoForm,
        sort_order: Number(photoForm.sort_order) || 0,
      };
      const result = editingPhotoId
        ? await supabase.from("gallery").update(payload).eq("id", editingPhotoId)
        : await supabase.from("gallery").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      setPhotoForm(emptyPhoto);
      setEditingPhotoId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
      await queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast.success(editingPhotoId ? "Photo updated" : "Photo added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removePhoto = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "gallery"] });
      await queryClient.invalidateQueries({ queryKey: ["gallery"] });
      toast.success("Photo deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const editPhoto = (item: Tables<"gallery">) => {
    setEditingPhotoId(item.id);
    setPhotoForm({
      album_id: item.album_id,
      media_url: item.media_url,
      media_type: item.media_type,
      caption_ar: item.caption_ar,
      caption_en: item.caption_en,
      sort_order: item.sort_order,
    });
    document.getElementById("photo-editor")?.scrollIntoView({ behavior: "smooth" });
  };

  const onPhotoSubmit = (event: FormEvent) => {
    event.preventDefault();
    savePhoto.mutate();
  };

  const uploadArchiveFile = useMutation({
    mutationFn: (file: File) => uploadImage(file, "archive"),
    onSuccess: (url) => {
      setArchiveForm((current) => ({ ...current, file_url: url }));
      toast.success("File uploaded. Save the entry to publish it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const uploadArchiveThumbnail = useMutation({
    mutationFn: (file: File) => uploadImage(file, "archive"),
    onSuccess: (url) => {
      setArchiveForm((current) => ({ ...current, thumbnail_url: url }));
      toast.success("Thumbnail uploaded. Save the entry to publish it.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveArchiveItem = useMutation({
    mutationFn: async () => {
      if (!archiveForm.file_url) throw new Error("Upload a file first.");
      const title = String(archiveForm.title_en || archiveForm.title_ar || "archive-item");
      const payload = {
        ...archiveForm,
        slug: slugify(String(archiveForm.slug || title)) || `archive-${Date.now()}`,
      };
      const result = editingArchiveId
        ? await supabase.from("archive_items").update(payload).eq("id", editingArchiveId)
        : await supabase.from("archive_items").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      setArchiveForm(emptyArchiveItem);
      setEditingArchiveId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "archive_items"] });
      await queryClient.invalidateQueries({ queryKey: ["archive_items"] });
      toast.success(editingArchiveId ? "Archive item updated" : "Archive item added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeArchiveItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("archive_items").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "archive_items"] });
      await queryClient.invalidateQueries({ queryKey: ["archive_items"] });
      toast.success("Archive item deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const editArchiveItem = (item: Tables<"archive_items">) => {
    setEditingArchiveId(item.id);
    setArchiveForm({
      slug: item.slug,
      kind: item.kind,
      title_ar: item.title_ar,
      title_en: item.title_en,
      description_ar: item.description_ar,
      description_en: item.description_en,
      notes_ar: item.notes_ar,
      notes_en: item.notes_en,
      file_url: item.file_url,
      thumbnail_url: item.thumbnail_url,
      year: item.year,
      source: item.source,
      category_id: item.category_id,
      downloadable: item.downloadable,
      published: item.published,
    });
    document.getElementById("archive-editor")?.scrollIntoView({ behavior: "smooth" });
  };

  const onArchiveSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveArchiveItem.mutate();
  };

  const saveHistoryItem = useMutation({
    mutationFn: async () => {
      const payload = {
        ...historyItemForm,
        sort_order: Number(historyItemForm.sort_order) || 0,
      };
      const result = editingHistoryItemId
        ? await supabase.from("history").update(payload).eq("id", editingHistoryItemId)
        : await supabase.from("history").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      setHistoryItemForm(emptyHistoryItem);
      setEditingHistoryItemId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "history_items"] });
      await queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success(editingHistoryItemId ? "History entry updated" : "History entry added");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeHistoryItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("history").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "history_items"] });
      await queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success("History entry deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const editHistoryItem = (item: Tables<"history">) => {
    setEditingHistoryItemId(item.id);
    setHistoryItemForm({
      title_ar: item.title_ar,
      title_en: item.title_en,
      content_ar: item.content_ar,
      content_en: item.content_en,
      sort_order: item.sort_order,
    });
    document.getElementById("history-item-editor")?.scrollIntoView({ behavior: "smooth" });
  };

  const onHistoryItemSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveHistoryItem.mutate();
  };

  const saveArticle = useMutation({
    mutationFn: async () => {
      const title = String(articleForm.title_en || articleForm.title_ar || "article");
      const payload = {
        ...articleForm,
        slug: slugify(String(articleForm.slug || title)) || `article-${Date.now()}`,
        cover_image: articleForm.cover_image || null,
        category_id: articleForm.category_id || null,
        reading_minutes: Number(articleForm.reading_minutes) || 1,
      };
      const result = editingId
        ? await supabase.from("articles").update(payload).eq("id", editingId)
        : await supabase.from("articles").insert(payload);
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: async () => {
      setArticleForm(emptyArticle);
      setEditingId(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      await queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success(editingId ? "Article updated" : "Article created");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removeArticle = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "articles"] });
      await queryClient.invalidateQueries({ queryKey: ["articles"] });
      toast.success("Article deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const uploadCover = useMutation({
    mutationFn: (file: File) => uploadImage(file, "articles"),
    onSuccess: (url) => {
      setArticleForm((current) => ({ ...current, cover_image: url }));
      toast.success("Cover uploaded");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const editArticle = (article: Article) => {
    setEditingId(article.id);
    setArticleForm({
      title_ar: article.title_ar,
      title_en: article.title_en,
      excerpt_ar: article.excerpt_ar,
      excerpt_en: article.excerpt_en,
      content_ar: article.content_ar,
      content_en: article.content_en,
      slug: article.slug ?? "",
      cover_image: article.cover_image,
      category_id: article.category_id,
      published: article.published,
      featured: article.featured,
      reading_minutes: article.reading_minutes,
      published_at: article.published_at,
    });
    document.getElementById("article-editor")?.scrollIntoView({ behavior: "smooth" });
  };

  const onArticleSubmit = (event: FormEvent) => {
    event.preventDefault();
    saveArticle.mutate();
  };

  return (
    <>
      {canEditIdentity ? (
        <>
          <section className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <ImageUp className="h-5 w-5 text-olive" />
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  هوية القرية · Village identity
                </h2>
                <p className="text-sm text-muted-foreground">
                  Change the village name, introduction, and hero image.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                required
                className={inputClass}
                value={heroForm.title_ar}
                onChange={(event) => setHeroForm({ ...heroForm, title_ar: event.target.value })}
                placeholder="اسم القرية بالعربية"
              />
              <input
                required
                className={inputClass}
                dir="ltr"
                value={heroForm.title_en}
                onChange={(event) => setHeroForm({ ...heroForm, title_en: event.target.value })}
                placeholder="Village name in English"
              />
              <textarea
                className={`${inputClass} min-h-28`}
                value={heroForm.subtitle_ar}
                onChange={(event) => setHeroForm({ ...heroForm, subtitle_ar: event.target.value })}
                placeholder="مقدمة القرية بالعربية"
              />
              <textarea
                className={`${inputClass} min-h-28`}
                dir="ltr"
                value={heroForm.subtitle_en}
                onChange={(event) => setHeroForm({ ...heroForm, subtitle_en: event.target.value })}
                placeholder="Village introduction in English"
              />
              <input
                className={inputClass}
                value={heroForm.district_ar}
                onChange={(event) => setHeroForm({ ...heroForm, district_ar: event.target.value })}
                placeholder="السطر الصغير تحت الاسم، مثال: قضاء عكا · فلسطين · قبل ١٩٤٨"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={heroForm.district_en}
                onChange={(event) => setHeroForm({ ...heroForm, district_en: event.target.value })}
                placeholder="Small line under the name, e.g. Acre District · Palestine · pre-1948"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
                <ImageUp className="h-4 w-4" /> Hero image
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadHero.mutate(file);
                  }}
                />
              </label>
              <Button
                onClick={() => saveHero.mutate()}
                disabled={saveHero.isPending || uploadHero.isPending}
              >
                <Save /> Save identity
              </Button>
            </div>
          </section>

          <section className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-olive" />
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  إعدادات التواصل · Contact &amp; footer settings
                </h2>
                <p className="text-sm text-muted-foreground">
                  Email, phone, address, social links and the footer copyright line.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {settingsForm.logo ? (
                <img
                  src={settingsLogoPreview}
                  alt=""
                  className="h-14 w-14 rounded-full border border-border object-cover"
                />
              ) : null}
              <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
                <ImageUp className="h-4 w-4" /> {settingsForm.logo ? "Replace logo" : "Upload logo"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadLogo.mutate(file);
                  }}
                />
              </label>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <textarea
                className={`${inputClass} min-h-20`}
                value={settingsForm.about_ar}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, about_ar: event.target.value })
                }
                placeholder="نبذة قصيرة عن الأرشيف بالعربية (تظهر أسفل الشعار في تذييل الموقع)"
              />
              <textarea
                className={`${inputClass} min-h-20`}
                dir="ltr"
                value={settingsForm.about_en}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, about_en: event.target.value })
                }
                placeholder="Short about blurb in English (shown under the logo in the footer)"
              />
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                className={inputClass}
                dir="ltr"
                type="email"
                value={settingsForm.contact_email}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, contact_email: event.target.value })
                }
                placeholder="Contact email"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={settingsForm.phone}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, phone: event.target.value })
                }
                placeholder="Phone number"
              />
              <input
                className={inputClass}
                value={settingsForm.address_ar}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, address_ar: event.target.value })
                }
                placeholder="العنوان بالعربية"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={settingsForm.address_en}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, address_en: event.target.value })
                }
                placeholder="Address in English"
              />
              <textarea
                className={`${inputClass} min-h-20`}
                value={settingsForm.rights_ar}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, rights_ar: event.target.value })
                }
                placeholder="نص حقوق النشر بالعربية (أسفل الموقع)"
              />
              <textarea
                className={`${inputClass} min-h-20`}
                dir="ltr"
                value={settingsForm.rights_en}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, rights_en: event.target.value })
                }
                placeholder="Footer copyright text in English"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={settingsForm.facebook}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, facebook: event.target.value })
                }
                placeholder="Facebook URL"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={settingsForm.instagram}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, instagram: event.target.value })
                }
                placeholder="Instagram URL"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={settingsForm.whatsapp}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, whatsapp: event.target.value })
                }
                placeholder="WhatsApp group URL"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={settingsForm.google_maps}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, google_maps: event.target.value })
                }
                placeholder="Google Maps URL"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={settingsForm.waze}
                onChange={(event) => setSettingsForm({ ...settingsForm, waze: event.target.value })}
                placeholder="Waze URL"
              />
            </div>
            <div className="mt-4">
              <Button
                onClick={() => saveSettings.mutate()}
                disabled={saveSettings.isPending || uploadLogo.isPending}
              >
                <Save /> Save settings
              </Button>
            </div>
          </section>

          <section className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-olive" />
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  قسم الموقع · Location section
                </h2>
                <p className="text-sm text-muted-foreground">
                  The map embed and fact sheet (district, elevation, land area, population) shown on
                  the homepage &quot;Where the village stood&quot; section.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                className={`${inputClass} sm:col-span-2`}
                dir="ltr"
                value={settingsForm.map_embed_url}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, map_embed_url: event.target.value })
                }
                placeholder='Google Maps embed URL (Google Maps → Share → Embed a map → copy the src="..." part)'
              />
              <input
                className={inputClass}
                value={settingsForm.location_district_ar}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, location_district_ar: event.target.value })
                }
                placeholder="القضاء بالعربية، مثال: قضاء عكا"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={settingsForm.location_district_en}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, location_district_en: event.target.value })
                }
                placeholder="District in English"
              />
              <input
                className={inputClass}
                value={settingsForm.location_altitude_ar}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, location_altitude_ar: event.target.value })
                }
                placeholder="الارتفاع بالعربية، مثال: ٤٥٠ م"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={settingsForm.location_altitude_en}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, location_altitude_en: event.target.value })
                }
                placeholder="Elevation in English"
              />
              <input
                className={inputClass}
                value={settingsForm.location_land_area_ar}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, location_land_area_ar: event.target.value })
                }
                placeholder="مساحة الأرض بالعربية، مثال: ٥٠٠٠ دونم"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={settingsForm.location_land_area_en}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, location_land_area_en: event.target.value })
                }
                placeholder="Land area in English"
              />
              <input
                className={inputClass}
                value={settingsForm.location_population_ar}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, location_population_ar: event.target.value })
                }
                placeholder="عدد السكان بالعربية"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={settingsForm.location_population_en}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, location_population_en: event.target.value })
                }
                placeholder="Population in English"
              />
            </div>
            <div className="mt-4">
              <Button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending}>
                <Save /> Save location section
              </Button>
            </div>
          </section>

          <section className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <Newspaper className="h-5 w-5 text-olive" />
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  كلمة الجمعية · Welcome message
                </h2>
                <p className="text-sm text-muted-foreground">
                  The association's welcome message, its signature, and its illustration.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {associationForm.image ? (
                <img
                  src={associationImagePreview}
                  alt=""
                  className="h-20 w-28 rounded-sm border border-border object-cover"
                />
              ) : null}
              <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
                <ImageUp className="h-4 w-4" />{" "}
                {associationForm.image ? "Replace image" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadAssociationImage.mutate(file);
                  }}
                />
              </label>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                className={inputClass}
                value={associationForm.title_ar}
                onChange={(event) =>
                  setAssociationForm({ ...associationForm, title_ar: event.target.value })
                }
                placeholder="عنوان القسم بالعربية"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={associationForm.title_en}
                onChange={(event) =>
                  setAssociationForm({ ...associationForm, title_en: event.target.value })
                }
                placeholder="Section title in English"
              />
              <textarea
                className={`${inputClass} min-h-28`}
                value={associationForm.content_ar}
                onChange={(event) =>
                  setAssociationForm({ ...associationForm, content_ar: event.target.value })
                }
                placeholder="نص كلمة الجمعية بالعربية"
              />
              <textarea
                className={`${inputClass} min-h-28`}
                dir="ltr"
                value={associationForm.content_en}
                onChange={(event) =>
                  setAssociationForm({ ...associationForm, content_en: event.target.value })
                }
                placeholder="Welcome message in English"
              />
              <input
                className={inputClass}
                value={associationForm.author_name_ar}
                onChange={(event) =>
                  setAssociationForm({ ...associationForm, author_name_ar: event.target.value })
                }
                placeholder="اسم رئيس الجمعية بالعربية"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={associationForm.author_name_en}
                onChange={(event) =>
                  setAssociationForm({ ...associationForm, author_name_en: event.target.value })
                }
                placeholder="Chairperson name in English"
              />
              <input
                className={inputClass}
                value={associationForm.author_title_ar}
                onChange={(event) =>
                  setAssociationForm({ ...associationForm, author_title_ar: event.target.value })
                }
                placeholder="صفة رئيس الجمعية بالعربية، مثال: رئيس الجمعية"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={associationForm.author_title_en}
                onChange={(event) =>
                  setAssociationForm({ ...associationForm, author_title_en: event.target.value })
                }
                placeholder="Chairperson title in English"
              />
            </div>
            <div className="mt-4">
              <Button
                onClick={() => saveAssociation.mutate()}
                disabled={saveAssociation.isPending || uploadAssociationImage.isPending}
              >
                <Save /> Save welcome message
              </Button>
            </div>
          </section>

          <section className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <Newspaper className="h-5 w-5 text-olive" />
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  مقدمة تاريخ القرية · History section intro
                </h2>
                <p className="text-sm text-muted-foreground">
                  The heading, intro paragraph and side image above the history timeline. The
                  timeline entries themselves are managed separately, below.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {historyIntroForm.image ? (
                <img
                  src={historyIntroImagePreview}
                  alt=""
                  className="h-20 w-28 rounded-sm border border-border object-cover"
                />
              ) : null}
              <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
                <ImageUp className="h-4 w-4" />{" "}
                {historyIntroForm.image ? "Replace image" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadHistoryIntroImage.mutate(file);
                  }}
                />
              </label>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                className={inputClass}
                value={historyIntroForm.title_ar}
                onChange={(event) =>
                  setHistoryIntroForm({ ...historyIntroForm, title_ar: event.target.value })
                }
                placeholder="العنوان بالعربية"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={historyIntroForm.title_en}
                onChange={(event) =>
                  setHistoryIntroForm({ ...historyIntroForm, title_en: event.target.value })
                }
                placeholder="Title in English"
              />
              <textarea
                className={`${inputClass} min-h-28`}
                value={historyIntroForm.body_ar}
                onChange={(event) =>
                  setHistoryIntroForm({ ...historyIntroForm, body_ar: event.target.value })
                }
                placeholder="النص التمهيدي بالعربية"
              />
              <textarea
                className={`${inputClass} min-h-28`}
                dir="ltr"
                value={historyIntroForm.body_en}
                onChange={(event) =>
                  setHistoryIntroForm({ ...historyIntroForm, body_en: event.target.value })
                }
                placeholder="Intro paragraph in English"
              />
            </div>
            <div className="mt-4">
              <Button
                onClick={() => saveSectionIntro.mutate({ key: "history", form: historyIntroForm })}
                disabled={saveSectionIntro.isPending || uploadHistoryIntroImage.isPending}
              >
                <Save /> Save history intro
              </Button>
            </div>
          </section>

          <section className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-olive" />
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  مقدمة قسم الموقع · Location section intro
                </h2>
                <p className="text-sm text-muted-foreground">
                  The heading, intro paragraph and side image next to the map and fact sheet.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {locationIntroForm.image ? (
                <img
                  src={locationIntroImagePreview}
                  alt=""
                  className="h-20 w-28 rounded-sm border border-border object-cover"
                />
              ) : null}
              <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
                <ImageUp className="h-4 w-4" />{" "}
                {locationIntroForm.image ? "Replace image" : "Upload image"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadLocationIntroImage.mutate(file);
                  }}
                />
              </label>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                className={inputClass}
                value={locationIntroForm.title_ar}
                onChange={(event) =>
                  setLocationIntroForm({ ...locationIntroForm, title_ar: event.target.value })
                }
                placeholder="العنوان بالعربية"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={locationIntroForm.title_en}
                onChange={(event) =>
                  setLocationIntroForm({ ...locationIntroForm, title_en: event.target.value })
                }
                placeholder="Title in English"
              />
              <textarea
                className={`${inputClass} min-h-28`}
                value={locationIntroForm.body_ar}
                onChange={(event) =>
                  setLocationIntroForm({ ...locationIntroForm, body_ar: event.target.value })
                }
                placeholder="النص التمهيدي بالعربية"
              />
              <textarea
                className={`${inputClass} min-h-28`}
                dir="ltr"
                value={locationIntroForm.body_en}
                onChange={(event) =>
                  setLocationIntroForm({ ...locationIntroForm, body_en: event.target.value })
                }
                placeholder="Intro paragraph in English"
              />
            </div>
            <div className="mt-4">
              <Button
                onClick={() =>
                  saveSectionIntro.mutate({ key: "location", form: locationIntroForm })
                }
                disabled={saveSectionIntro.isPending || uploadLocationIntroImage.isPending}
              >
                <Save /> Save location intro
              </Button>
            </div>
          </section>
        </>
      ) : null}

      {canEditContent ? (
        <>
          <section
            id="article-editor"
            className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7"
          >
            <div className="flex items-center gap-3">
              <Newspaper className="h-5 w-5 text-olive" />
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  {editingId ? "تعديل المقال · Edit article" : "إضافة مقال · Add article"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Admins and editors can create drafts or publish articles.
                </p>
              </div>
            </div>
            <form onSubmit={onArticleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                required
                className={inputClass}
                value={String(articleForm.title_ar ?? "")}
                onChange={(event) =>
                  setArticleForm({ ...articleForm, title_ar: event.target.value })
                }
                placeholder="العنوان بالعربية"
              />
              <input
                required
                className={inputClass}
                dir="ltr"
                value={String(articleForm.title_en ?? "")}
                onChange={(event) =>
                  setArticleForm({ ...articleForm, title_en: event.target.value })
                }
                placeholder="English title"
              />
              <textarea
                required
                className={`${inputClass} min-h-24`}
                value={String(articleForm.excerpt_ar ?? "")}
                onChange={(event) =>
                  setArticleForm({ ...articleForm, excerpt_ar: event.target.value })
                }
                placeholder="ملخص بالعربية"
              />
              <textarea
                required
                className={`${inputClass} min-h-24`}
                dir="ltr"
                value={String(articleForm.excerpt_en ?? "")}
                onChange={(event) =>
                  setArticleForm({ ...articleForm, excerpt_en: event.target.value })
                }
                placeholder="English summary"
              />
              <textarea
                required
                className={`${inputClass} min-h-48`}
                value={String(articleForm.content_ar ?? "")}
                onChange={(event) =>
                  setArticleForm({ ...articleForm, content_ar: event.target.value })
                }
                placeholder="محتوى المقال بالعربية"
              />
              <textarea
                required
                className={`${inputClass} min-h-48`}
                dir="ltr"
                value={String(articleForm.content_en ?? "")}
                onChange={(event) =>
                  setArticleForm({ ...articleForm, content_en: event.target.value })
                }
                placeholder="English article content"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={String(articleForm.slug ?? "")}
                onChange={(event) => setArticleForm({ ...articleForm, slug: event.target.value })}
                placeholder="URL slug (generated if empty)"
              />
              <select
                className={inputClass}
                value={articleForm.category_id ?? ""}
                onChange={(event) =>
                  setArticleForm({ ...articleForm, category_id: event.target.value || null })
                }
              >
                <option value="">بدون تصنيف · No category</option>
                {(categoriesQuery.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_ar} · {category.name_en}
                  </option>
                ))}
              </select>
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(articleForm.published)}
                  onChange={(event) =>
                    setArticleForm({ ...articleForm, published: event.target.checked })
                  }
                />{" "}
                نشر الآن · Publish now
              </label>
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(articleForm.featured)}
                  onChange={(event) =>
                    setArticleForm({ ...articleForm, featured: event.target.checked })
                  }
                />{" "}
                مقال مميز · Featured
              </label>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
                  <ImageUp className="h-4 w-4" /> Cover image
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadCover.mutate(file);
                    }}
                  />
                </label>
                <Button type="submit" disabled={saveArticle.isPending || uploadCover.isPending}>
                  <Save /> {editingId ? "Update" : "Create article"}
                </Button>
                {editingId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setArticleForm(emptyArticle);
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="mt-12">
            <h2 className="flex items-center gap-2 text-sm tracking-[0.2em] text-olive uppercase">
              <Newspaper className="h-4 w-4" /> Articles · {articlesQuery.data?.length ?? 0}
            </h2>
            <div className="mt-4 grid gap-3">
              {(articlesQuery.data ?? []).map((article) => (
                <article
                  key={article.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border bg-card p-5"
                >
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold">
                      {article.title_ar} · {article.title_en}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {article.published ? "Published" : "Draft"}
                      {article.featured ? " · Featured" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => editArticle(article)}
                    >
                      <Pencil /> Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm("Delete this article permanently?"))
                          removeArticle.mutate(article.id);
                      }}
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </article>
              ))}
              {!articlesQuery.isLoading && !articlesQuery.data?.length ? (
                <p className="rounded-sm border border-border bg-card p-5 text-muted-foreground">
                  No articles yet. Use the editor above to add the first one.
                </p>
              ) : null}
            </div>
          </section>

          <section
            id="location-editor"
            className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7"
          >
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-olive" />
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  {editingLocationId
                    ? "تعديل موقع على الخريطة · Edit map point"
                    : "إضافة موقع على الخريطة · Add map point"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Houses, landmarks and wells shown on the interactive village map, with their
                  position (0–100%).
                </p>
              </div>
            </div>
            <form onSubmit={onLocationSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                required
                className={inputClass}
                value={locationForm.name_ar}
                onChange={(event) =>
                  setLocationForm({ ...locationForm, name_ar: event.target.value })
                }
                placeholder="الاسم بالعربية (مثال: دار أبو سالم)"
              />
              <input
                required
                className={inputClass}
                dir="ltr"
                value={locationForm.name_en}
                onChange={(event) =>
                  setLocationForm({ ...locationForm, name_en: event.target.value })
                }
                placeholder="Name in English"
              />
              <textarea
                className={`${inputClass} min-h-20`}
                value={locationForm.description_ar ?? ""}
                onChange={(event) =>
                  setLocationForm({ ...locationForm, description_ar: event.target.value })
                }
                placeholder="وصف مختصر بالعربية"
              />
              <textarea
                className={`${inputClass} min-h-20`}
                dir="ltr"
                value={locationForm.description_en ?? ""}
                onChange={(event) =>
                  setLocationForm({ ...locationForm, description_en: event.target.value })
                }
                placeholder="Short description in English"
              />
              <textarea
                className={`${inputClass} min-h-16`}
                value={locationForm.notes_ar ?? ""}
                onChange={(event) =>
                  setLocationForm({ ...locationForm, notes_ar: event.target.value })
                }
                placeholder="ملاحظات إضافية بالعربية"
              />
              <textarea
                className={`${inputClass} min-h-16`}
                dir="ltr"
                value={locationForm.notes_en ?? ""}
                onChange={(event) =>
                  setLocationForm({ ...locationForm, notes_en: event.target.value })
                }
                placeholder="Additional notes in English"
              />
              <select
                className={inputClass}
                value={String(locationForm.kind ?? "landmark")}
                onChange={(event) => setLocationForm({ ...locationForm, kind: event.target.value })}
              >
                <option value="landmark">معلم · Landmark</option>
                <option value="family_home">بيت عائلة · Family home</option>
                <option value="mosque">مسجد · Mosque</option>
                <option value="school">مدرسة · School</option>
                <option value="cemetery">مقبرة · Cemetery</option>
                <option value="well">بئر · Well</option>
              </select>
              <input
                className={inputClass}
                dir="ltr"
                value={String(locationForm.slug ?? "")}
                onChange={(event) => setLocationForm({ ...locationForm, slug: event.target.value })}
                placeholder="URL slug (generated if empty)"
              />
              <label className="text-sm text-muted-foreground">
                X position on map (0–100%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  className={`${inputClass} mt-1`}
                  dir="ltr"
                  value={locationForm.pos_x as number}
                  onChange={(event) =>
                    setLocationForm({ ...locationForm, pos_x: Number(event.target.value) })
                  }
                />
              </label>
              <label className="text-sm text-muted-foreground">
                Y position on map (0–100%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  className={`${inputClass} mt-1`}
                  dir="ltr"
                  value={locationForm.pos_y as number}
                  onChange={(event) =>
                    setLocationForm({ ...locationForm, pos_y: Number(event.target.value) })
                  }
                />
              </label>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <Button type="submit" disabled={saveLocation.isPending}>
                  <Save /> {editingLocationId ? "Update" : "Add location"}
                </Button>
                {editingLocationId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingLocationId(null);
                      setLocationForm(emptyLocation);
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="mt-12">
            <h2 className="flex items-center gap-2 text-sm tracking-[0.2em] text-olive uppercase">
              <MapPin className="h-4 w-4" /> Map locations · {locationsQuery.data?.length ?? 0}
            </h2>
            <div className="mt-4 grid gap-3">
              {(locationsQuery.data ?? []).map((location) => (
                <article
                  key={location.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border bg-card p-5"
                >
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold">
                      {location.name_ar} · {location.name_en}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {location.kind} · x:{location.pos_x} y:{location.pos_y}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => editLocation(location)}
                    >
                      <Pencil /> Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm("Delete this map location permanently?"))
                          removeLocation.mutate(location.id);
                      }}
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </article>
              ))}
              {!locationsQuery.isLoading && !locationsQuery.data?.length ? (
                <p className="rounded-sm border border-border bg-card p-5 text-muted-foreground">
                  No map locations yet. Use the editor above to add the first one.
                </p>
              ) : null}
            </div>
          </section>

          <section
            id="event-editor"
            className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7"
          >
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-olive" />
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  {editingEventId ? "تعديل فعالية · Edit event" : "إضافة فعالية · Add event"}
                </h2>
              </div>
            </div>
            <form onSubmit={onEventSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                required
                className={inputClass}
                value={eventForm.title_ar}
                onChange={(event) => setEventForm({ ...eventForm, title_ar: event.target.value })}
                placeholder="العنوان بالعربية"
              />
              <input
                required
                className={inputClass}
                dir="ltr"
                value={eventForm.title_en}
                onChange={(event) => setEventForm({ ...eventForm, title_en: event.target.value })}
                placeholder="Title in English"
              />
              <textarea
                className={`${inputClass} min-h-16`}
                value={eventForm.summary_ar ?? ""}
                onChange={(event) => setEventForm({ ...eventForm, summary_ar: event.target.value })}
                placeholder="ملخص قصير بالعربية (يظهر في القائمة)"
              />
              <textarea
                className={`${inputClass} min-h-16`}
                dir="ltr"
                value={eventForm.summary_en ?? ""}
                onChange={(event) => setEventForm({ ...eventForm, summary_en: event.target.value })}
                placeholder="Short summary in English (shown in listings)"
              />
              <textarea
                className={`${inputClass} min-h-28`}
                value={eventForm.description_ar ?? ""}
                onChange={(event) =>
                  setEventForm({ ...eventForm, description_ar: event.target.value })
                }
                placeholder="الوصف الكامل بالعربية"
              />
              <textarea
                className={`${inputClass} min-h-28`}
                dir="ltr"
                value={eventForm.description_en ?? ""}
                onChange={(event) =>
                  setEventForm({ ...eventForm, description_en: event.target.value })
                }
                placeholder="Full description in English"
              />
              <label className="text-sm text-muted-foreground">
                Event date &amp; time
                <input
                  type="datetime-local"
                  className={`${inputClass} mt-1`}
                  dir="ltr"
                  value={eventForm.event_date ? eventForm.event_date.slice(0, 16) : ""}
                  onChange={(event) =>
                    setEventForm({
                      ...eventForm,
                      event_date: event.target.value
                        ? new Date(event.target.value).toISOString()
                        : null,
                    })
                  }
                />
              </label>
              <input
                className={inputClass}
                value={eventForm.location ?? ""}
                onChange={(event) => setEventForm({ ...eventForm, location: event.target.value })}
                placeholder="مكان الفعالية · Location"
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
                <input
                  type="checkbox"
                  checked={eventForm.archived ?? false}
                  onChange={(event) =>
                    setEventForm({ ...eventForm, archived: event.target.checked })
                  }
                />
                مؤرشفة (لا تظهر في القائمة النشطة) · Archived
              </label>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                {eventForm.cover_image ? (
                  <img
                    src={resolveMediaUrl(eventForm.cover_image)}
                    alt=""
                    className="h-16 w-24 rounded-sm border border-border object-cover"
                  />
                ) : null}
                <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
                  <ImageUp className="h-4 w-4" /> Cover image
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadEventCover.mutate(file);
                    }}
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <Button type="submit" disabled={saveEvent.isPending}>
                  <Save /> {editingEventId ? "Update" : "Add event"}
                </Button>
                {editingEventId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingEventId(null);
                      setEventForm(emptyEvent);
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="mt-12">
            <h2 className="flex items-center gap-2 text-sm tracking-[0.2em] text-olive uppercase">
              <Calendar className="h-4 w-4" /> Events · {eventsQuery.data?.length ?? 0}
            </h2>
            <div className="mt-4 grid gap-3">
              {(eventsQuery.data ?? []).map((item) => (
                <article
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border bg-card p-5"
                >
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold">
                      {item.title_ar} · {item.title_en}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.event_date ? new Date(item.event_date).toLocaleString() : "No date"}
                      {item.archived ? " · Archived" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => editEvent(item)}
                    >
                      <Pencil /> Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm("Delete this event permanently?"))
                          removeEvent.mutate(item.id);
                      }}
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </article>
              ))}
              {!eventsQuery.isLoading && !eventsQuery.data?.length ? (
                <p className="rounded-sm border border-border bg-card p-5 text-muted-foreground">
                  No events yet. Use the editor above to add the first one.
                </p>
              ) : null}
            </div>
          </section>

          <section
            id="album-editor"
            className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7"
          >
            <div className="flex items-center gap-3">
              <Images className="h-5 w-5 text-olive" />
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  {editingAlbumId ? "تعديل ألبوم · Edit album" : "إضافة ألبوم · Add album"}
                </h2>
              </div>
            </div>
            <form onSubmit={onAlbumSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                required
                className={inputClass}
                value={albumForm.title_ar}
                onChange={(event) => setAlbumForm({ ...albumForm, title_ar: event.target.value })}
                placeholder="عنوان الألبوم بالعربية"
              />
              <input
                required
                className={inputClass}
                dir="ltr"
                value={albumForm.title_en}
                onChange={(event) => setAlbumForm({ ...albumForm, title_en: event.target.value })}
                placeholder="Album title in English"
              />
              <textarea
                className={`${inputClass} min-h-16`}
                value={albumForm.description_ar ?? ""}
                onChange={(event) =>
                  setAlbumForm({ ...albumForm, description_ar: event.target.value })
                }
                placeholder="وصف مختصر بالعربية"
              />
              <textarea
                className={`${inputClass} min-h-16`}
                dir="ltr"
                value={albumForm.description_en ?? ""}
                onChange={(event) =>
                  setAlbumForm({ ...albumForm, description_en: event.target.value })
                }
                placeholder="Short description in English"
              />
              <select
                className={inputClass}
                value={albumForm.category_id ?? ""}
                onChange={(event) =>
                  setAlbumForm({ ...albumForm, category_id: event.target.value || null })
                }
              >
                <option value="">بدون تصنيف · No category</option>
                {(categoriesQuery.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_ar} · {category.name_en}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap items-center gap-3">
                {albumForm.cover_image ? (
                  <img
                    src={resolveMediaUrl(albumForm.cover_image)}
                    alt=""
                    className="h-16 w-24 rounded-sm border border-border object-cover"
                  />
                ) : null}
                <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
                  <ImageUp className="h-4 w-4" /> Cover image
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadAlbumCover.mutate(file);
                    }}
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <Button type="submit" disabled={saveAlbum.isPending}>
                  <Save /> {editingAlbumId ? "Update" : "Add album"}
                </Button>
                {editingAlbumId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingAlbumId(null);
                      setAlbumForm(emptyAlbum);
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="mt-12">
            <h2 className="flex items-center gap-2 text-sm tracking-[0.2em] text-olive uppercase">
              <Images className="h-4 w-4" /> Albums · {albumsQuery.data?.length ?? 0}
            </h2>
            <div className="mt-4 grid gap-3">
              {(albumsQuery.data ?? []).map((item) => (
                <article
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border bg-card p-5"
                >
                  <h3 className="min-w-0 font-display text-lg font-semibold">
                    {item.title_ar} · {item.title_en}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => editAlbum(item)}
                    >
                      <Pencil /> Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Delete this album permanently? Photos in it will be kept but unassigned.",
                          )
                        )
                          removeAlbum.mutate(item.id);
                      }}
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </article>
              ))}
              {!albumsQuery.isLoading && !albumsQuery.data?.length ? (
                <p className="rounded-sm border border-border bg-card p-5 text-muted-foreground">
                  No albums yet. Use the editor above to add the first one.
                </p>
              ) : null}
            </div>
          </section>

          <section
            id="photo-editor"
            className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7"
          >
            <div className="flex items-center gap-3">
              <Images className="h-5 w-5 text-olive" />
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  {editingPhotoId ? "تعديل صورة · Edit photo" : "إضافة صورة · Add photo"}
                </h2>
              </div>
            </div>
            <form onSubmit={onPhotoSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                {photoForm.media_url ? (
                  <img
                    src={resolveMediaUrl(photoForm.media_url)}
                    alt=""
                    className="h-20 w-28 rounded-sm border border-border object-cover"
                  />
                ) : null}
                <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
                  <ImageUp className="h-4 w-4" />{" "}
                  {photoForm.media_url ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadPhoto.mutate(file);
                    }}
                  />
                </label>
              </div>
              <select
                className={inputClass}
                value={photoForm.album_id ?? ""}
                onChange={(event) =>
                  setPhotoForm({ ...photoForm, album_id: event.target.value || null })
                }
              >
                <option value="">بدون ألبوم · No album</option>
                {(albumsQuery.data ?? []).map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.title_ar} · {album.title_en}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className={inputClass}
                dir="ltr"
                value={photoForm.sort_order ?? 0}
                onChange={(event) =>
                  setPhotoForm({ ...photoForm, sort_order: Number(event.target.value) })
                }
                placeholder="Sort order"
              />
              <input
                className={inputClass}
                value={photoForm.caption_ar ?? ""}
                onChange={(event) => setPhotoForm({ ...photoForm, caption_ar: event.target.value })}
                placeholder="وصف الصورة بالعربية"
              />
              <input
                className={inputClass}
                dir="ltr"
                value={photoForm.caption_en ?? ""}
                onChange={(event) => setPhotoForm({ ...photoForm, caption_en: event.target.value })}
                placeholder="Caption in English"
              />
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <Button type="submit" disabled={savePhoto.isPending || uploadPhoto.isPending}>
                  <Save /> {editingPhotoId ? "Update" : "Add photo"}
                </Button>
                {editingPhotoId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingPhotoId(null);
                      setPhotoForm(emptyPhoto);
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="mt-12">
            <h2 className="flex items-center gap-2 text-sm tracking-[0.2em] text-olive uppercase">
              <Images className="h-4 w-4" /> Photos · {photosQuery.data?.length ?? 0}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {(photosQuery.data ?? []).map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-sm border border-border bg-card"
                >
                  <img
                    src={resolveMediaUrl(item.media_url)}
                    alt=""
                    className="h-32 w-full object-cover"
                  />
                  <div className="flex items-center justify-between gap-2 p-2">
                    <p className="min-w-0 truncate text-xs text-muted-foreground">
                      {item.caption_ar || item.caption_en || "—"}
                    </p>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => editPhoto(item)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (window.confirm("Delete this photo permanently?"))
                            removePhoto.mutate(item.id);
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
              {!photosQuery.isLoading && !photosQuery.data?.length ? (
                <p className="col-span-full rounded-sm border border-border bg-card p-5 text-muted-foreground">
                  No photos yet. Use the editor above to add the first one.
                </p>
              ) : null}
            </div>
          </section>

          <section
            id="archive-editor"
            className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7"
          >
            <div className="flex items-center gap-3">
              <Archive className="h-5 w-5 text-olive" />
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  {editingArchiveId
                    ? "تعديل عنصر أرشيف · Edit archive item"
                    : "إضافة عنصر أرشيف · Add archive item"}
                </h2>
              </div>
            </div>
            <form onSubmit={onArchiveSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                required
                className={inputClass}
                value={archiveForm.title_ar}
                onChange={(event) =>
                  setArchiveForm({ ...archiveForm, title_ar: event.target.value })
                }
                placeholder="العنوان بالعربية"
              />
              <input
                required
                className={inputClass}
                dir="ltr"
                value={archiveForm.title_en}
                onChange={(event) =>
                  setArchiveForm({ ...archiveForm, title_en: event.target.value })
                }
                placeholder="Title in English"
              />
              <textarea
                className={`${inputClass} min-h-16`}
                value={archiveForm.description_ar ?? ""}
                onChange={(event) =>
                  setArchiveForm({ ...archiveForm, description_ar: event.target.value })
                }
                placeholder="وصف مختصر بالعربية"
              />
              <textarea
                className={`${inputClass} min-h-16`}
                dir="ltr"
                value={archiveForm.description_en ?? ""}
                onChange={(event) =>
                  setArchiveForm({ ...archiveForm, description_en: event.target.value })
                }
                placeholder="Short description in English"
              />
              <textarea
                className={`${inputClass} min-h-16`}
                value={archiveForm.notes_ar ?? ""}
                onChange={(event) =>
                  setArchiveForm({ ...archiveForm, notes_ar: event.target.value })
                }
                placeholder="ملاحظات إضافية بالعربية"
              />
              <textarea
                className={`${inputClass} min-h-16`}
                dir="ltr"
                value={archiveForm.notes_en ?? ""}
                onChange={(event) =>
                  setArchiveForm({ ...archiveForm, notes_en: event.target.value })
                }
                placeholder="Additional notes in English"
              />
              <select
                className={inputClass}
                value={String(archiveForm.kind ?? "document")}
                onChange={(event) => setArchiveForm({ ...archiveForm, kind: event.target.value })}
              >
                <option value="document">وثيقة · Document</option>
                <option value="photo">صورة · Photo</option>
                <option value="audio">صوت · Audio</option>
                <option value="video">فيديو · Video</option>
                <option value="map">خريطة · Map</option>
              </select>
              <select
                className={inputClass}
                value={archiveForm.category_id ?? ""}
                onChange={(event) =>
                  setArchiveForm({ ...archiveForm, category_id: event.target.value || null })
                }
              >
                <option value="">بدون تصنيف · No category</option>
                {(categoriesQuery.data ?? []).map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_ar} · {category.name_en}
                  </option>
                ))}
              </select>
              <input
                className={inputClass}
                dir="ltr"
                value={archiveForm.year ?? ""}
                onChange={(event) => setArchiveForm({ ...archiveForm, year: event.target.value })}
                placeholder="السنة · Year"
              />
              <input
                className={inputClass}
                value={archiveForm.source ?? ""}
                onChange={(event) => setArchiveForm({ ...archiveForm, source: event.target.value })}
                placeholder="المصدر · Source"
              />
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={archiveForm.downloadable ?? true}
                  onChange={(event) =>
                    setArchiveForm({ ...archiveForm, downloadable: event.target.checked })
                  }
                />
                قابل للتحميل · Downloadable
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={archiveForm.published ?? true}
                  onChange={(event) =>
                    setArchiveForm({ ...archiveForm, published: event.target.checked })
                  }
                />
                منشور · Published
              </label>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                {archiveForm.file_url ? (
                  <a
                    href={resolveMediaUrl(archiveForm.file_url)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm break-all text-olive hover:underline"
                  >
                    {archiveForm.file_url}
                  </a>
                ) : null}
                <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
                  <ImageUp className="h-4 w-4" />{" "}
                  {archiveForm.file_url ? "Replace file" : "Upload file (required)"}
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadArchiveFile.mutate(file);
                    }}
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                {archiveForm.thumbnail_url ? (
                  <img
                    src={resolveMediaUrl(archiveForm.thumbnail_url)}
                    alt=""
                    className="h-16 w-16 rounded-sm border border-border object-cover"
                  />
                ) : null}
                <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
                  <ImageUp className="h-4 w-4" /> Thumbnail (optional)
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadArchiveThumbnail.mutate(file);
                    }}
                  />
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <Button
                  type="submit"
                  disabled={saveArchiveItem.isPending || uploadArchiveFile.isPending}
                >
                  <Save /> {editingArchiveId ? "Update" : "Add archive item"}
                </Button>
                {editingArchiveId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingArchiveId(null);
                      setArchiveForm(emptyArchiveItem);
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="mt-12">
            <h2 className="flex items-center gap-2 text-sm tracking-[0.2em] text-olive uppercase">
              <Archive className="h-4 w-4" /> Archive items · {archiveItemsQuery.data?.length ?? 0}
            </h2>
            <div className="mt-4 grid gap-3">
              {(archiveItemsQuery.data ?? []).map((item) => (
                <article
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border bg-card p-5"
                >
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold">
                      {item.title_ar} · {item.title_en}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.kind} · {item.published ? "Published" : "Hidden"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => editArchiveItem(item)}
                    >
                      <Pencil /> Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm("Delete this archive item permanently?"))
                          removeArchiveItem.mutate(item.id);
                      }}
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </article>
              ))}
              {!archiveItemsQuery.isLoading && !archiveItemsQuery.data?.length ? (
                <p className="rounded-sm border border-border bg-card p-5 text-muted-foreground">
                  No archive items yet. Use the editor above to add the first one.
                </p>
              ) : null}
            </div>
          </section>

          <section
            id="history-item-editor"
            className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7"
          >
            <div className="flex items-center gap-3">
              <Newspaper className="h-5 w-5 text-olive" />
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  {editingHistoryItemId
                    ? "تعديل محطة تاريخية · Edit history entry"
                    : "إضافة محطة تاريخية · Add history entry"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  One bullet point in the history timeline (e.g. &quot;Origins and setting&quot;,
                  &quot;Stone houses and arches&quot;). The heading/intro/image above the timeline
                  are managed separately in &quot;History section intro&quot;, above.
                </p>
              </div>
            </div>
            <form onSubmit={onHistoryItemSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                required
                className={inputClass}
                value={historyItemForm.title_ar}
                onChange={(event) =>
                  setHistoryItemForm({ ...historyItemForm, title_ar: event.target.value })
                }
                placeholder="العنوان بالعربية"
              />
              <input
                required
                className={inputClass}
                dir="ltr"
                value={historyItemForm.title_en}
                onChange={(event) =>
                  setHistoryItemForm({ ...historyItemForm, title_en: event.target.value })
                }
                placeholder="Title in English"
              />
              <textarea
                className={`${inputClass} min-h-20`}
                value={historyItemForm.content_ar}
                onChange={(event) =>
                  setHistoryItemForm({ ...historyItemForm, content_ar: event.target.value })
                }
                placeholder="النص بالعربية"
              />
              <textarea
                className={`${inputClass} min-h-20`}
                dir="ltr"
                value={historyItemForm.content_en}
                onChange={(event) =>
                  setHistoryItemForm({ ...historyItemForm, content_en: event.target.value })
                }
                placeholder="Text in English"
              />
              <label className="text-sm text-muted-foreground">
                Sort order (lower shows first)
                <input
                  type="number"
                  className={`${inputClass} mt-1`}
                  dir="ltr"
                  value={historyItemForm.sort_order ?? 0}
                  onChange={(event) =>
                    setHistoryItemForm({
                      ...historyItemForm,
                      sort_order: Number(event.target.value),
                    })
                  }
                />
              </label>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <Button type="submit" disabled={saveHistoryItem.isPending}>
                  <Save /> {editingHistoryItemId ? "Update" : "Add entry"}
                </Button>
                {editingHistoryItemId ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingHistoryItemId(null);
                      setHistoryItemForm(emptyHistoryItem);
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </section>

          <section className="mt-12">
            <h2 className="flex items-center gap-2 text-sm tracking-[0.2em] text-olive uppercase">
              <Newspaper className="h-4 w-4" /> History timeline ·{" "}
              {historyItemsQuery.data?.length ?? 0}
            </h2>
            <div className="mt-4 grid gap-3">
              {(historyItemsQuery.data ?? []).map((item) => (
                <article
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border bg-card p-5"
                >
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold">
                      {item.title_ar} · {item.title_en}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {item.content_ar}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => editHistoryItem(item)}
                    >
                      <Pencil /> Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (window.confirm("Delete this history entry permanently?"))
                          removeHistoryItem.mutate(item.id);
                      }}
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </article>
              ))}
              {!historyItemsQuery.isLoading && !historyItemsQuery.data?.length ? (
                <p className="rounded-sm border border-border bg-card p-5 text-muted-foreground">
                  No history entries yet. Use the editor above to add the first one.
                </p>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
