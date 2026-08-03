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
        className="btn-base btn-gold sr-only focus:not-sr-only focus:absolute focus:top-3 focus:start-3 focus:z-[100]"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      <Toaster position="top-center" />
    </>
  );
}
