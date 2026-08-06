import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyRoles, signOut } from "@/services/auth";
import { ContentManager } from "@/components/admin/ContentManager";

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

  const { data: roles = [], isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ["my-roles"],
    queryFn: fetchMyRoles,
  });
  const isStaff = roles.includes("admin") || roles.includes("editor");

  const { data: stories = [] } = useQuery({
    queryKey: ["admin", "guestbook", "all"],
    enabled: isStaff,
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
    enabled: isStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitor_videos")
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

        {rolesLoading ? (
          <p className="mt-10 rounded-sm border border-border bg-card p-6 text-muted-foreground">
            Checking permissions…
          </p>
        ) : rolesError ? (
          <p className="mt-10 rounded-sm border border-destructive bg-card p-6 text-destructive">
            Could not load permissions: {(rolesError as Error).message}
          </p>
        ) : !isStaff ? (
          <p className="mt-10 rounded-sm border border-border bg-card p-6 leading-loose text-muted-foreground">
            حسابك ليس ضمن فريق التحرير بعد. يحتاج مدير الأرشيف إلى منحك دور admin أو editor.
          </p>
        ) : (
          <>
            <ContentManager />
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
          </>
        )}
      </div>
    </main>
  );
}

