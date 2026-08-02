import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useMediaSrc } from "@/hooks/useMediaSrc";
import { contentQueries } from "@/services/queries";
import { submitVisitorVideo, uploadVisitorVideoFile } from "@/services/content";
import type { VisitorVideo } from "@/services/content";
import { ui, videosPage } from "@/i18n/pages";
import { PageShell } from "@/components/site/PageShell";
import { SectionShell } from "@/components/site/SectionShell";
import { Reveal } from "@/components/site/Reveal";

const title = "فيديوهات الزوار — أرشيف القرية | Visitor videos";
const description =
  "فيديوهات شاركها زوار أرشيف القرية بعد مراجعة فريق الأرشيف، مع إمكانية إرسال فيديو جديد.";

export const Route = createFileRoute("/videos")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/videos" }],
  }),
  component: VideosPage,
});

function VideoCard({ video }: { video: VisitorVideo }) {
  const src = useMediaSrc(video.video_url);
  const isEmbed = /^https?:\/\//i.test(video.video_url);

  return (
    <figure className="rounded-sm border border-border bg-card">
      <div className="sepia-frame aspect-video overflow-hidden rounded-t-sm bg-secondary">
        {isEmbed ? (
          <a
            href={video.video_url}
            target="_blank"
            rel="noreferrer noopener"
            className="grid h-full w-full place-items-center p-4 text-center text-sm break-all text-olive underline"
          >
            {video.video_url}
          </a>
        ) : (
          <video src={src} controls preload="none" className="h-full w-full object-cover" />
        )}
      </div>
      <figcaption className="p-4">
        <span className="block font-display text-lg">{video.visitor_name}</span>
        <span className="block text-xs text-muted-foreground">
          {new Date(video.created_at).toLocaleDateString()}
        </span>
      </figcaption>
    </figure>
  );
}

function VideosPage() {
  const { lang, t } = useLanguage();
  const queryClient = useQueryClient();
  const { data: videos = [], isLoading } = useQuery(contentQueries.approvedVideos());
  const [form, setForm] = useState({ name: "", email: "", social: "", url: "" });
  const [file, setFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      let videoUrl = form.url.trim();
      if (file) videoUrl = await uploadVisitorVideoFile(file);
      if (!videoUrl) throw new Error(lang === "ar" ? "أضف فيديو أو رابطاً." : "Add a video or link.");
      await submitVisitorVideo({
        visitor_name: form.name.trim().slice(0, 120),
        email: form.email.trim().slice(0, 255) || null,
        social_link: form.social.trim().slice(0, 500) || null,
        video_url: videoUrl,
      });
    },
    onSuccess: () => {
      toast.success(t(ui.pending));
      setForm({ name: "", email: "", social: "", url: "" });
      setFile(null);
      void queryClient.invalidateQueries({ queryKey: ["visitor_videos"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    mutation.mutate();
  };

  const inputClass =
    "w-full rounded-sm border border-border bg-card px-4 py-3 text-sm focus:border-accent focus:outline-none";

  return (
    <PageShell>
      <SectionShell
        id="videos"
        className="pt-32"
        eyebrow={t(videosPage.eyebrow)}
        title={t(videosPage.title)}
        body={t(videosPage.body)}
      >
        {isLoading ? <p className="mt-10 text-muted-foreground">{t(ui.loading)}</p> : null}
        {!isLoading && videos.length === 0 ? (
          <p className="mt-10 text-muted-foreground">{t(videosPage.empty)}</p>
        ) : null}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video, i) => (
            <Reveal key={video.id} delay={i * 80}>
              <VideoCard video={video} />
            </Reveal>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-16 grid max-w-xl gap-4">
          <h2 className="font-display text-2xl font-semibold">{t(videosPage.upload)}</h2>
          <label className="grid gap-2 text-sm text-muted-foreground">
            {lang === "ar" ? "الاسم" : "Name"}
            <input
              className={inputClass}
              required
              maxLength={120}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>
          <label className="grid gap-2 text-sm text-muted-foreground">
            {lang === "ar" ? "البريد الإلكتروني" : "Email"}
            <input
              className={inputClass}
              type="email"
              maxLength={255}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="grid gap-2 text-sm text-muted-foreground">
            {t(videosPage.uploadFile)}
            <input
              className={inputClass}
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="grid gap-2 text-sm text-muted-foreground">
            {t(videosPage.orLink)}
            <input
              className={inputClass}
              maxLength={500}
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
            />
          </label>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="min-h-11 justify-self-start rounded-full bg-accent px-7 py-3 text-sm font-medium text-accent-foreground disabled:opacity-60"
          >
            {t(ui.submit)}
          </button>
        </form>
      </SectionShell>
    </PageShell>
  );
}
