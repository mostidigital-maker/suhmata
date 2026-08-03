import { useState, type FormEvent } from "react";
import { Quote } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";
import { sections } from "@/i18n/translations";
import { contentQueries } from "@/services/queries";
import { submitGuestbookEntry } from "@/services/content";
import { Reveal } from "./Reveal";
import { SectionShell } from "./SectionShell";

export function StoriesSection() {
  const { lang, t } = useLanguage();
  const s = sections.stories;
  const queryClient = useQueryClient();
  const { data: entries = [] } = useQuery(contentQueries.guestbook(6));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    facebook: "",
    instagram: "",
    message: "",
  });

  const mutation = useMutation({
    mutationFn: submitGuestbookEntry,
    onSuccess: () => {
      toast.success(
        lang === "ar"
          ? "شكراً لك — ستُراجع روايتك قبل نشرها."
          : "Thank you — your story will be reviewed before publication.",
      );
      setForm({ name: "", email: "", facebook: "", instagram: "", message: "" });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["guestbook"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    mutation.mutate({
      name: form.name.trim().slice(0, 120),
      email: form.email.trim().slice(0, 255) || null,
      facebook: form.facebook.trim().slice(0, 500) || null,
      instagram: form.instagram.trim().slice(0, 500) || null,
      social_link: form.facebook.trim().slice(0, 500) || null,
      message: form.message.trim().slice(0, 2000),
    });
  };


  const inputClass =
    "min-h-11 w-full rounded-sm border border-gold-soft/30 bg-ink/30 px-4 py-3 text-sm text-primary-foreground transition-colors duration-300 placeholder:text-primary-foreground/40 focus:border-gold-soft focus:outline-none";

  return (
    <SectionShell
      id="stories"
      tone="deep"
      eyebrow={t(s.eyebrow)}
      title={t(s.title)}
      body={t(s.body)}
    >
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {entries.map((item, i) => (
          <Reveal key={item.id} delay={i * 100}>
            <figure className="h-full rounded-sm border border-gold-soft/25 bg-ink/20 p-7">
              <Quote className="h-6 w-6 text-gold-soft" />
              <blockquote className="mt-4 text-lg leading-loose text-primary-foreground/90">
                {item.message}
              </blockquote>
              <figcaption className="mt-6 border-t border-gold-soft/20 pt-4">
                <span className="block font-display text-lg">{item.name}</span>
                <span className="block text-sm text-primary-foreground/65">
                  {new Date(item.created_at).toLocaleDateString(lang === "ar" ? "ar" : "en-GB")}
                </span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <Reveal delay={200}>
        <div className="mt-10">
          {open ? (
            <form onSubmit={onSubmit} className="grid max-w-xl gap-4">
              <input
                className={inputClass}
                required
                maxLength={120}
                placeholder={lang === "ar" ? "الاسم" : "Name"}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className={inputClass}
                type="email"
                maxLength={255}
                placeholder={lang === "ar" ? "البريد الإلكتروني (اختياري)" : "Email (optional)"}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className={inputClass}
                maxLength={500}
                placeholder={lang === "ar" ? "رابط فيسبوك (اختياري)" : "Facebook (optional)"}
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
              />
              <input
                className={inputClass}
                maxLength={500}
                placeholder={lang === "ar" ? "رابط إنستغرام (اختياري)" : "Instagram (optional)"}
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              />

              <textarea
                className={inputClass}
                required
                rows={5}
                maxLength={2000}
                placeholder={lang === "ar" ? "روايتك" : "Your story"}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="rounded-full bg-accent px-7 py-3 text-sm font-medium text-accent-foreground disabled:opacity-60"
                >
                  {lang === "ar" ? "إرسال" : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-gold-soft/50 px-7 py-3 text-sm font-medium text-gold-soft"
                >
                  {lang === "ar" ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="inline-flex rounded-full border border-gold-soft/50 px-7 py-3 text-sm font-medium text-gold-soft transition-colors duration-300 hover:bg-accent hover:text-accent-foreground"
            >
              {t(s.cta)}
            </button>
          )}
        </div>
      </Reveal>
    </SectionShell>
  );
}
