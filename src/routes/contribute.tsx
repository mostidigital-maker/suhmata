import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";
import { contentQueries } from "@/services/queries";
import {
  submitContribution,
  uploadContributionFile,
  type ContributionKind,
} from "@/services/content";
import { contributePage, ui } from "@/i18n/pages";
import { PageShell } from "@/components/site/PageShell";
import { SectionShell } from "@/components/site/SectionShell";
import { cn } from "@/lib/utils";

const title = "شارك ذاكرتك — مساهمات الزوار | Contribute to the village archive";
const description =
  "أضف رواية أو صورة أو فيديو إلى أرشيف القرية. تبقى كل المساهمات قيد المراجعة حتى يوافق عليها فريق الأرشيف.";

const kinds: ContributionKind[] = ["story", "image", "video"];

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/contribute" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/contribute" }],
  }),
  component: ContributePage,
});

const inputCls =
  "w-full rounded-sm border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

function ContributePage() {
  const { t } = useLanguage();
  const [kind, setKind] = useState<ContributionKind>("story");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [social, setSocial] = useState("");
  const [entryTitle, setEntryTitle] = useState("");
  const [body, setBody] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const { data: approved = [] } = useQuery(contentQueries.contributions(null));

  const mutation = useMutation({
    mutationFn: async () => {
      let mediaUrl: string | null = kind === "video" ? videoUrl.trim() || null : null;
      if (kind === "image" && file) mediaUrl = await uploadContributionFile(file);
      await submitContribution({
        kind,
        contributor_name: name.trim(),
        email: email.trim() || null,
        social_link: social.trim() || null,
        title: entryTitle.trim() || null,
        body: body.trim() || null,
        media_url: mediaUrl,
      });
    },
    onSuccess: () => {
      toast.success(t(ui.pending));
      setEntryTitle("");
      setBody("");
      setVideoUrl("");
      setFile(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <PageShell>
      <SectionShell
        id="contribute"
        className="pt-32"
        eyebrow={t(contributePage.eyebrow)}
        title={t(contributePage.title)}
        body={t(contributePage.body)}
      >
        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return;
              mutation.mutate();
            }}
          >
            <div className="flex flex-wrap gap-2">
              {kinds.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  aria-pressed={kind === k}
                  className={cn(
                    "min-h-11 rounded-full border px-4 py-2 text-sm transition-colors",
                    kind === k
                      ? "border-accent bg-accent/15 text-olive"
                      : "border-border text-muted-foreground hover:border-accent",
                  )}
                >
                  {t(contributePage.kinds[k])}
                </button>
              ))}
            </div>

            <label className="block">
              <span className="text-sm text-olive">{t(contributePage.name)}</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(inputCls, "mt-2")}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm text-olive">
                  {t(contributePage.email)} ({t(ui.optional)})
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(inputCls, "mt-2")}
                />
              </label>
              <label className="block">
                <span className="text-sm text-olive">
                  {t(contributePage.social)} ({t(ui.optional)})
                </span>
                <input
                  type="url"
                  value={social}
                  onChange={(e) => setSocial(e.target.value)}
                  className={cn(inputCls, "mt-2")}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-olive">{t(contributePage.entryTitle)}</span>
              <input
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
                className={cn(inputCls, "mt-2")}
              />
            </label>

            {kind === "story" ? (
              <label className="block">
                <span className="text-sm text-olive">{t(contributePage.story)}</span>
                <textarea
                  required
                  rows={6}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className={cn(inputCls, "mt-2")}
                />
              </label>
            ) : null}

            {kind === "image" ? (
              <label className="block">
                <span className="text-sm text-olive">{t(contributePage.file)}</span>
                <input
                  required
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className={cn(inputCls, "mt-2")}
                />
              </label>
            ) : null}

            {kind === "video" ? (
              <label className="block">
                <span className="text-sm text-olive">{t(contributePage.videoUrl)}</span>
                <input
                  required
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className={cn(inputCls, "mt-2")}
                />
              </label>
            ) : null}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="min-h-11 rounded-full border border-accent/50 px-7 py-3 text-sm font-medium text-olive disabled:opacity-60"
            >
              {t(ui.submit)}
            </button>
            <p className="text-sm text-muted-foreground">{t(ui.pending)}</p>
          </form>

          <div>
            <h2 className="text-[0.7rem] tracking-[0.3em] text-olive uppercase">
              {t(contributePage.approved)}
            </h2>
            <ul className="mt-4 space-y-4">
              {approved.map((c) => (
                <li key={c.id} className="rounded-sm border border-border bg-card p-5">
                  <p className="font-semibold">{c.title || c.contributor_name}</p>
                  <p className="mt-2 line-clamp-4 leading-loose text-muted-foreground">{c.body}</p>
                  <p className="mt-3 text-xs text-olive">{c.contributor_name}</p>
                </li>
              ))}
              {approved.length === 0 ? (
                <li className="text-muted-foreground">{t(ui.empty)}</li>
              ) : null}
            </ul>
          </div>
        </div>
      </SectionShell>
    </PageShell>
  );
}
