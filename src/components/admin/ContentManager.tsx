import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageUp, MapPin, Newspaper, Pencil, Plus, Save, Settings2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";

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

export function ContentManager() {
  const queryClient = useQueryClient();
  const [heroForm, setHeroForm] = useState({
    title_ar: "",
    title_en: "",
    subtitle_ar: "",
    subtitle_en: "",
    background_image: "",
  });
  const [articleForm, setArticleForm] = useState<TablesInsert<"articles">>(emptyArticle);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [settingsForm, setSettingsForm] = useState({
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
  });
  const [locationForm, setLocationForm] = useState<TablesInsert<"map_locations">>(emptyLocation);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);

  const heroQuery = useQuery({
    queryKey: ["admin", "hero"],
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

  const locationsQuery = useQuery({
    queryKey: ["admin", "map_locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("map_locations")
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
      background_image: hero.background_image ?? "",
    });
  }, [heroQuery.data]);

  useEffect(() => {
    const settings = settingsQuery.data;
    if (!settings) return;
    setSettingsForm({
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
    });
  }, [settingsQuery.data]);

  const saveHero = useMutation({
    mutationFn: async () => {
      const payload = { ...heroForm, background_image: heroForm.background_image || null };
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

  const saveSettings = useMutation({
    mutationFn: async () => {
      const payload: TablesUpdate<"settings"> = {
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
      <section className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <ImageUp className="h-5 w-5 text-olive" />
          <div>
            <h2 className="font-display text-2xl font-semibold">هوية القرية · Village identity</h2>
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
            onChange={(event) => setSettingsForm({ ...settingsForm, phone: event.target.value })}
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
            onChange={(event) => setSettingsForm({ ...settingsForm, facebook: event.target.value })}
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
            onChange={(event) => setSettingsForm({ ...settingsForm, whatsapp: event.target.value })}
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
          <Button onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending}>
            <Save /> Save settings
          </Button>
        </div>
      </section>

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
            onChange={(event) => setArticleForm({ ...articleForm, title_ar: event.target.value })}
            placeholder="العنوان بالعربية"
          />
          <input
            required
            className={inputClass}
            dir="ltr"
            value={String(articleForm.title_en ?? "")}
            onChange={(event) => setArticleForm({ ...articleForm, title_en: event.target.value })}
            placeholder="English title"
          />
          <textarea
            required
            className={`${inputClass} min-h-24`}
            value={String(articleForm.excerpt_ar ?? "")}
            onChange={(event) => setArticleForm({ ...articleForm, excerpt_ar: event.target.value })}
            placeholder="ملخص بالعربية"
          />
          <textarea
            required
            className={`${inputClass} min-h-24`}
            dir="ltr"
            value={String(articleForm.excerpt_en ?? "")}
            onChange={(event) => setArticleForm({ ...articleForm, excerpt_en: event.target.value })}
            placeholder="English summary"
          />
          <textarea
            required
            className={`${inputClass} min-h-48`}
            value={String(articleForm.content_ar ?? "")}
            onChange={(event) => setArticleForm({ ...articleForm, content_ar: event.target.value })}
            placeholder="محتوى المقال بالعربية"
          />
          <textarea
            required
            className={`${inputClass} min-h-48`}
            dir="ltr"
            value={String(articleForm.content_en ?? "")}
            onChange={(event) => setArticleForm({ ...articleForm, content_en: event.target.value })}
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
              Houses, landmarks and wells shown on the interactive village map, with their position
              (0–100%).
            </p>
          </div>
        </div>
        <form onSubmit={onLocationSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <input
            required
            className={inputClass}
            value={locationForm.name_ar}
            onChange={(event) => setLocationForm({ ...locationForm, name_ar: event.target.value })}
            placeholder="الاسم بالعربية (مثال: دار أبو سالم)"
          />
          <input
            required
            className={inputClass}
            dir="ltr"
            value={locationForm.name_en}
            onChange={(event) => setLocationForm({ ...locationForm, name_en: event.target.value })}
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
            onChange={(event) => setLocationForm({ ...locationForm, notes_ar: event.target.value })}
            placeholder="ملاحظات إضافية بالعربية"
          />
          <textarea
            className={`${inputClass} min-h-16`}
            dir="ltr"
            value={locationForm.notes_en ?? ""}
            onChange={(event) => setLocationForm({ ...locationForm, notes_en: event.target.value })}
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
    </>
  );
}
