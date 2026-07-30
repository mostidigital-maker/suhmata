import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

/** Shared chrome for every public page: header, single main landmark, footer. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only rounded-sm bg-accent px-4 py-2 text-accent-foreground focus:not-sr-only focus:absolute focus:top-3 focus:start-3 focus:z-[100]"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <Toaster position="top-center" />
    </>
  );
}
