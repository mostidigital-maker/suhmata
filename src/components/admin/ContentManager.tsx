import { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ImageUp, Newspaper, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";

type Article = Tables<"articles">;
type Hero = Tables<"hero_content">;

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
            <p className="text-sm text-muted-foreground">Change the village name, introduction, and hero image.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <input required className={inputClass} value={heroForm.title_ar} onChange={(event) => setHeroForm({ ...heroForm, title_ar: event.target.value })} placeholder="اسم القرية بالعربية" />
          <input required className={inputClass} dir="ltr" value={heroForm.title_en} onChange={(event) => setHeroForm({ ...heroForm, title_en: event.target.value })} placeholder="Village name in English" />
          <textarea className={`${inputClass} min-h-28`} value={heroForm.subtitle_ar} onChange={(event) => setHeroForm({ ...heroForm, subtitle_ar: event.target.value })} placeholder="مقدمة القرية بالعربية" />
          <textarea className={`${inputClass} min-h-28`} dir="ltr" value={heroForm.subtitle_en} onChange={(event) => setHeroForm({ ...heroForm, subtitle_en: event.target.value })} placeholder="Village introduction in English" />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
            <ImageUp className="h-4 w-4" /> Hero image
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadHero.mutate(file); }} />
          </label>
          <Button onClick={() => saveHero.mutate()} disabled={saveHero.isPending || uploadHero.isPending}>
            <Save /> Save identity
          </Button>
        </div>
      </section>

      <section id="article-editor" className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <Newspaper className="h-5 w-5 text-olive" />
          <div>
            <h2 className="font-display text-2xl font-semibold">{editingId ? "تعديل المقال · Edit article" : "إضافة مقال · Add article"}</h2>
            <p className="text-sm text-muted-foreground">Admins and editors can create drafts or publish articles.</p>
          </div>
        </div>
        <form onSubmit={onArticleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <input required className={inputClass} value={String(articleForm.title_ar ?? "")} onChange={(event) => setArticleForm({ ...articleForm, title_ar: event.target.value })} placeholder="العنوان بالعربية" />
          <input required className={inputClass} dir="ltr" value={String(articleForm.title_en ?? "")} onChange={(event) => setArticleForm({ ...articleForm, title_en: event.target.value })} placeholder="English title" />
          <textarea required className={`${inputClass} min-h-24`} value={String(articleForm.excerpt_ar ?? "")} onChange={(event) => setArticleForm({ ...articleForm, excerpt_ar: event.target.value })} placeholder="ملخص بالعربية" />
          <textarea required className={`${inputClass} min-h-24`} dir="ltr" value={String(articleForm.excerpt_en ?? "")} onChange={(event) => setArticleForm({ ...articleForm, excerpt_en: event.target.value })} placeholder="English summary" />
          <textarea required className={`${inputClass} min-h-48`} value={String(articleForm.content_ar ?? "")} onChange={(event) => setArticleForm({ ...articleForm, content_ar: event.target.value })} placeholder="محتوى المقال بالعربية" />
          <textarea required className={`${inputClass} min-h-48`} dir="ltr" value={String(articleForm.content_en ?? "")} onChange={(event) => setArticleForm({ ...articleForm, content_en: event.target.value })} placeholder="English article content" />
          <input className={inputClass} dir="ltr" value={String(articleForm.slug ?? "")} onChange={(event) => setArticleForm({ ...articleForm, slug: event.target.value })} placeholder="URL slug (generated if empty)" />
          <select className={inputClass} value={articleForm.category_id ?? ""} onChange={(event) => setArticleForm({ ...articleForm, category_id: event.target.value || null })}>
            <option value="">بدون تصنيف · No category</option>
            {(categoriesQuery.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.name_ar} · {category.name_en}</option>)}
          </select>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(articleForm.published)} onChange={(event) => setArticleForm({ ...articleForm, published: event.target.checked })} /> نشر الآن · Publish now</label>
          <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(articleForm.featured)} onChange={(event) => setArticleForm({ ...articleForm, featured: event.target.checked })} /> مقال مميز · Featured</label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-sm hover:border-accent">
              <ImageUp className="h-4 w-4" /> Cover image
              <input type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadCover.mutate(file); }} />
            </label>
            <Button type="submit" disabled={saveArticle.isPending || uploadCover.isPending}><Save /> {editingId ? "Update" : "Create article"}</Button>
            {editingId ? <Button type="button" variant="outline" onClick={() => { setEditingId(null); setArticleForm(emptyArticle); }}>Cancel</Button> : null}
          </div>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="flex items-center gap-2 text-sm tracking-[0.2em] text-olive uppercase"><Newspaper className="h-4 w-4" /> Articles · {articlesQuery.data?.length ?? 0}</h2>
        <div className="mt-4 grid gap-3">
          {(articlesQuery.data ?? []).map((article) => (
            <article key={article.id} className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border bg-card p-5">
              <div className="min-w-0"><h3 className="font-display text-lg font-semibold">{article.title_ar} · {article.title_en}</h3><p className="mt-1 text-xs text-muted-foreground">{article.published ? "Published" : "Draft"}{article.featured ? " · Featured" : ""}</p></div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => editArticle(article)}><Pencil /> Edit</Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => { if (window.confirm("Delete this article permanently?")) removeArticle.mutate(article.id); }}><Trash2 /> Delete</Button>
              </div>
            </article>
          ))}
          {!articlesQuery.isLoading && !articlesQuery.data?.length ? <p className="rounded-sm border border-border bg-card p-5 text-muted-foreground">No articles yet. Use the editor above to add the first one.</p> : null}
        </div>
      </section>
    </>
  );
}