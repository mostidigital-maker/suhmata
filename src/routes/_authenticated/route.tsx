import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyRoles } from "@/services/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    // Being logged in only proves identity — staff-only pages under this
    // layout also require an admin/editor role. Check it here so a
    // non-staff account never even loads the admin route tree, instead of
    // relying solely on each page to hide itself after the fact.
    // Redirect to "/" rather than "/auth": a signed-in user who lands on
    // /auth is immediately bounced to /admin, which would loop forever for
    // a non-staff account.
    let roles: Awaited<ReturnType<typeof fetchMyRoles>> = [];
    try {
      roles = await fetchMyRoles();
    } catch {
      throw redirect({ to: "/" });
    }
    const isStaff = roles.includes("admin") || roles.includes("editor");
    if (!isStaff) throw redirect({ to: "/" });

    return { user: data.user, roles };
  },
  component: () => <Outlet />,
});
