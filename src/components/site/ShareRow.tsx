import { useState } from "react";
import { Facebook, Link2, Share2, Twitter } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ui } from "@/i18n/pages";

/** Social sharing row for articles, events and archive items. */
export function ShareRow({ title }: { title: string }) {
  const { t } = useLanguage();
  const [url] = useState(() => (typeof window === "undefined" ? "" : window.location.href));

  const share = async () => {
    const current = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url: current });
        return;
      } catch {
        /* user dismissed — fall back to copying */
      }
    }
    await navigator.clipboard.writeText(current);
    toast.success(t(ui.linkCopied));
  };

  const encoded = encodeURIComponent(url || "");
  const encodedTitle = encodeURIComponent(title);
  const links = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
      Icon: Facebook,
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      Icon: Twitter,
    },
  ];

  const cls =
    "grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent hover:text-accent-foreground";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[0.7rem] tracking-[0.25em] text-olive uppercase">{t(ui.share)}</span>
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={cls}
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
      <button type="button" onClick={share} aria-label={t(ui.copyLink)} className={cls}>
        <Link2 className="h-4 w-4" />
      </button>
      <button type="button" onClick={share} aria-label={t(ui.share)} className={cls}>
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}
