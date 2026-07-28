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
        "scroll-mt-24 px-5 py-20 sm:px-8 md:py-28",
        tone === "paper" && "bg-background",
        tone === "sand" && "paper-grain bg-secondary",
        tone === "deep" && "bg-primary text-primary-foreground",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl">
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
          "font-body text-[0.7rem] tracking-[0.35em] uppercase",
          tone === "deep" ? "text-gold-soft" : "text-olive",
        )}
      >
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl leading-tight font-semibold sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <div className="mt-5 h-px w-24 bg-accent/70" />
      {body ? (
        <p
          className={cn(
            "mt-6 text-base leading-loose",
            tone === "deep" ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {body}
        </p>
      ) : null}
    </header>
  );
}
