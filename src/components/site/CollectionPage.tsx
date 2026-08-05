import type { ReactNode } from "react";
import { PageShell } from "./PageShell";
import { SectionShell } from "./SectionShell";

export function CollectionPage({
  id,
  eyebrow,
  title,
  body,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <PageShell>
      <SectionShell id={id} className="min-h-[60vh] pt-32" eyebrow={eyebrow} title={title} body={body}>
        <div className="mt-12">{children}</div>
      </SectionShell>
    </PageShell>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="border-y border-border py-8 text-muted-foreground">{children}</p>;
}