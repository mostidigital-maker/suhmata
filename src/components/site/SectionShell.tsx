import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function SectionShell({
  id,
  eyebrow,
  title,
  body,
  children,
  tone = "paper",
  className,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body?: string;
  children?: ReactNode;
  tone?: "paper" | "sand" | "deep";
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "content-auto relative scroll-mt-24 px-gutter py-section",
        tone === "paper" && "bg-background",
        tone === "sand" && "paper-grain bg-secondary",
        tone === "deep" && "bg-primary text-primary-foreground",
        className,
      )}
    >
      {/* Woven seam marking the transition from the previous section. */}
      <div aria-hidden className="section-seam pointer-events-none absolute inset-x-0 top-0" />

      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading eyebrow={eyebrow} title={title} body={body} tone={tone} />
        </Reveal>
        {children}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  body,
  tone = "paper",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  tone?: "paper" | "sand" | "deep";
}) {
  return (
    <header className="max-w-2xl">
      <p
        className={cn(
          "font-body text-[0.7rem] tracking-[0.38em] uppercase",
          tone === "deep" ? "text-gold-soft" : "text-olive",
        )}
      >
        {eyebrow}
      </p>
      <h2 className="mt-5 text-h2 font-semibold">{title}</h2>
      <div className="mt-6 flex items-center gap-3" aria-hidden>
        <span className="h-px w-20 bg-accent/70" />
        <span className="h-1.5 w-1.5 rotate-45 bg-accent/80" />
        <span className="h-px w-10 bg-accent/40" />
      </div>
      {body ? (
        <p
          className={cn(
            "mt-7 text-lede",
            tone === "deep" ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {body}
        </p>
      ) : null}
    </header>
  );
}
