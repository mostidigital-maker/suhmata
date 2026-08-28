import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Enums } from "@/integrations/supabase/types";

type AppRole = Enums<"app_role">;
type Selection = AppRole | "guest";

const selectClass =
  "min-h-10 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-ring";

/**
 * Admin-only user management: lists every registered account (via the
 * admin_list_users RPC, since auth.users isn't queryable directly from the
 * client) and lets an admin grant/revoke the admin or editor role, or clear
 * it back to a plain "guest" account with no staff access.
 */
export function UserRoles() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_list_users");
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });

  const setRole = useMutation({
    mutationFn: async ({ userId, selection }: { userId: string; selection: Selection }) => {
      const { error } =
        selection === "guest"
          ? await supabase.rpc("admin_clear_user_role", { _target_user_id: userId })
          : await supabase.rpc("admin_set_user_role", {
              _target_user_id: userId,
              _role: selection,
            });
      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Role updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const users = usersQuery.data ?? [];

  return (
    <section className="mt-12 rounded-sm border border-border bg-card p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <Users className="h-5 w-5 text-olive" />
        <div>
          <h2 className="font-display text-2xl font-semibold">
            المستخدمون والصلاحيات · Users &amp; roles
          </h2>
          <p className="text-sm text-muted-foreground">
            Approve new sign-ups and set each account to admin, editor, or guest (no staff access).
          </p>
        </div>
      </div>

      {usersQuery.error ? (
        <p className="mt-6 rounded-sm border border-destructive bg-background p-4 text-sm text-destructive">
          {(usersQuery.error as Error).message}
        </p>
      ) : null}

      <div className="mt-6 grid gap-3">
        {users.map((user) => {
          const current: Selection = user.roles?.includes("admin")
            ? "admin"
            : user.roles?.includes("editor")
              ? "editor"
              : "guest";
          return (
            <article
              key={user.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-border bg-background p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{user.full_name || user.email || user.id}</p>
                <p className="truncate text-xs text-muted-foreground" dir="ltr">
                  {user.email}
                </p>
              </div>
              <select
                className={selectClass}
                value={current}
                disabled={setRole.isPending}
                onChange={(event) =>
                  setRole.mutate({ userId: user.id, selection: event.target.value as Selection })
                }
              >
                <option value="guest">Guest (no access)</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </article>
          );
        })}
        {!usersQuery.isLoading && !users.length ? (
          <p className="rounded-sm border border-border bg-background p-4 text-muted-foreground">
            No registered users yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}
