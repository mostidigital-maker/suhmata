import type { ReactNode } from "react";
import { Toaster } from "sonner";

/** Shared public-page content landmark; global chrome lives in the root route. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Toaster position="top-center" />
    </>
  );
}
