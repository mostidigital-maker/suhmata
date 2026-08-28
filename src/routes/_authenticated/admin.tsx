import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { signOut } from "@/services/auth";
import { ContentManager } from "@/components/admin/ContentManager";
import { UserRoles } from "@/components/admin/UserRoles";

const title = "لوحة الإدارة | Archive dashboard";
const description = "لوحة مراجعة مساهمات الزوار وإدارة محتوى أرشيف القرية.";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // The "/_authenticated" layout route already verified this user holds an
  // admin/editor role before rendering anything under it — no need to
  // re-check or gate the page here, just read the roles for display.
  const { roles } = Route.useRouteContext();
  const isAdmin = roles.includes("admin");

  const { data: stories = [] } = useQuery({
    queryKey: ["admin", "guestbook", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guestbook")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: videos = [] } = useQuery({
    queryKey: ["admin", "videos", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitor_videos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: contributions = [] } = useQuery({
    queryKey: ["admin", "contributions", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contributions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin"] });
    queryClient.invalidateQueries({ queryKey: ["guestbook"] });
    queryClient.invalidateQueries({ queryKey: ["visitor_videos"] });
    queryClient.invalidateQueries({ queryKey: ["contributions"] });
  };

  const moderateStory = useMutation({
    mutationFn: async ({
      id,
      action,
    }: {
      id: string;
      action: "approve" | "hide" | "show" | "delete";
    }) => {
      const query =
        action === "delete"
          ? supabase.from("guestbook").delete().eq("id", id)
          : supabase
              .from("guestbook")
              .update(
                action === "approve"
                  ? { approved: true, hidden: false }
                  : { hidden: action === "hide" },
              )
              .eq("id", id);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Updated");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const moderateVideo = useMutation({
    mutationFn: async ({
      id,
      status,
      remove,
    }: {
      id: string;
      status?: "approved" | "rejected" | "pending";
      remove?: boolean;
    }) => {
      const query = remove
        ? supabase.from("visitor_videos").delete().eq("id", id)
        : supabase
            .from("visitor_videos")
            .update({ status: status ?? "pending" })
            .eq("id", id);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Updated");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const moderateContribution = useMutation({
    mutationFn: async ({
      id,
      status,
      remove,
    }: {
      id: string;
      status?: "approved" | "rejected" | "pending";
      remove?: boolean;
    }) => {
      const query = remove
        ? supabase.from("contributions").delete().eq("id", id)
        : supabase
            .from("contributions")
            .update({ status: status ?? "pending" })
            .eq("id", id);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Updated");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await signOut();
    navigate({ to: "/auth", replace: true });
  };

  const btn =
    "min-h-11 rounded-full px-4 py-1.5 text-xs font-medium transition-colors border border-border hover:border-accent";

  const pendingStories = stories.filter((entry) => !entry.approved).length;
  const pendingVideos = videos.filter((video) => video.status === "pending").length;
  const pendingContributions = contributions.filter((entry) => entry.status === "pending").length;

  return (
    <main className="paper-grain min-h-screen bg-secondary px-5 py-14">
      <Toaster position="top-center" />
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold">لوحة الإدارة</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {roles.length ? `Role: ${roles.join(", ")}` : "No staff role assigned yet"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/" className={btn}>
              الموقع
            </Link>
            <button type="button" onClick={handleSignOut} className={btn}>
              خروج · Sign out
            </button>
          </div>
        </header>

        {isAdmin ? (
          <>
            <ContentManager />
            <UserRoles />
          </>
        ) : null}
        <section className="mt-12">
          <h2 className="text-sm tracking-[0.25em] text-olive uppercase">
            Guestbook · {stories.length} ({pendingStories} pending)
          </h2>
          <div className="mt-4 grid gap-4">
            {stories.map((entry) => (
              <article key={entry.id} className="rounded-sm border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-display text-lg">{entry.name}</p>
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                    {!entry.approved ? "pending" : entry.hidden ? "hidden" : "published"}
                  </span>
                </div>
                <p className="mt-2 leading-loose text-muted-foreground">{entry.message}</p>
                <p className="mt-2 text-xs break-all text-muted-foreground">
                  {[entry.email, entry.facebook, entry.instagram].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {!entry.approved ? (
                    <button
                      className={btn}
                      onClick={() => moderateStory.mutate({ id: entry.id, action: "approve" })}
                    >
                      نشر · Approve
                    </button>
                  ) : (
                    <button
                      className={btn}
                      onClick={() =>
                        moderateStory.mutate({
                          id: entry.id,
                          action: entry.hidden ? "show" : "hide",
                        })
                      }
                    >
                      {entry.hidden ? "إظهار · Show" : "إخفاء · Hide"}
                    </button>
                  )}
                  <button
                    className={btn}
                    onClick={() => moderateStory.mutate({ id: entry.id, action: "delete" })}
                  >
                    حذف · Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-sm tracking-[0.25em] text-olive uppercase">
            Visitor videos · {videos.length} ({pendingVideos} pending)
          </h2>
          <div className="mt-4 grid gap-4">
            {videos.map((video) => (
              <article key={video.id} className="rounded-sm border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-display text-lg">{video.visitor_name}</p>
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                    {video.status}
                  </span>
                </div>
                <a
                  href={video.video_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 block text-sm break-all text-olive hover:underline"
                >
                  {video.video_url}
                </a>
                <div className="mt-4 flex flex-wrap gap-3">
                  {video.status !== "approved" ? (
                    <button
                      className={btn}
                      onClick={() => moderateVideo.mutate({ id: video.id, status: "approved" })}
                    >
                      قبول · Approve
                    </button>
                  ) : (
                    <button
                      className={btn}
                      onClick={() => moderateVideo.mutate({ id: video.id, status: "pending" })}
                    >
                      إخفاء · Hide
                    </button>
                  )}
                  <button
                    className={btn}
                    onClick={() => moderateVideo.mutate({ id: video.id, status: "rejected" })}
                  >
                    رفض · Reject
                  </button>
                  <button
                    className={btn}
                    onClick={() => moderateVideo.mutate({ id: video.id, remove: true })}
                  >
                    حذف · Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-sm tracking-[0.25em] text-olive uppercase">
            Contributions · {contributions.length} ({pendingContributions} pending)
          </h2>
          <div className="mt-4 grid gap-4">
            {contributions.map((entry) => (
              <article key={entry.id} className="rounded-sm border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-display text-lg">
                    {entry.contributor_name} · {entry.kind}
                  </p>
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                    {entry.status}
                  </span>
                </div>
                {entry.title ? <p className="mt-2 font-medium">{entry.title}</p> : null}
                {entry.body ? (
                  <p className="mt-2 leading-loose text-muted-foreground">{entry.body}</p>
                ) : null}
                {entry.media_url ? (
                  <a
                    href={entry.media_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 block text-sm break-all text-olive hover:underline"
                  >
                    {entry.media_url}
                  </a>
                ) : null}
                <p className="mt-2 text-xs break-all text-muted-foreground">
                  {[entry.email, entry.social_link].filter(Boolean).join(" · ")}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {entry.status !== "approved" ? (
                    <button
                      className={btn}
                      onClick={() =>
                        moderateContribution.mutate({ id: entry.id, status: "approved" })
                      }
                    >
                      قبول · Approve
                    </button>
                  ) : (
                    <button
                      className={btn}
                      onClick={() =>
                        moderateContribution.mutate({ id: entry.id, status: "pending" })
                      }
                    >
                      إخفاء · Hide
                    </button>
                  )}
                  <button
                    className={btn}
                    onClick={() =>
                      moderateContribution.mutate({ id: entry.id, status: "rejected" })
                    }
                  >
                    رفض · Reject
                  </button>
                  <button
                    className={btn}
                    onClick={() => moderateContribution.mutate({ id: entry.id, remove: true })}
                  >
                    حذف · Delete
                  </button>
                </div>
              </article>
            ))}
            {!contributions.length ? (
              <p className="rounded-sm border border-border bg-card p-5 text-muted-foreground">
                No contributions yet.
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
