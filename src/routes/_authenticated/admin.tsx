import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Toaster, toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fetchMyRoles, signOut } from "@/services/auth";

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

  const { data: roles = [] } = useQuery({ queryKey: ["my-roles"], queryFn: fetchMyRoles });
  const isStaff = roles.includes("admin") || roles.includes("editor");

  const { data: pendingStories = [] } = useQuery({
    queryKey: ["admin", "guestbook", "pending"],
    enabled: isStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guestbook")
        .select("*")
        .eq("approved", false)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: pendingVideos = [] } = useQuery({
    queryKey: ["admin", "videos", "pending"],
    enabled: isStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("visitor_videos")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const moderateStory = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const query = approved
        ? supabase.from("guestbook").update({ approved: true }).eq("id", id)
        : supabase.from("guestbook").delete().eq("id", id);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "guestbook", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["guestbook"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const moderateVideo = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("visitor_videos").update({ status }).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "videos", "pending"] });
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
    "rounded-full px-4 py-1.5 text-xs font-medium transition-colors border border-border hover:border-accent";

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

        {!isStaff ? (
          <p className="mt-10 rounded-sm border border-border bg-card p-6 leading-loose text-muted-foreground">
            حسابك ليس ضمن فريق التحرير بعد. يحتاج مدير الأرشيف إلى منحك دور admin أو editor.
          </p>
        ) : (
          <>
            <section className="mt-12">
              <h2 className="text-sm tracking-[0.25em] text-olive uppercase">
                Guestbook · بانتظار المراجعة ({pendingStories.length})
              </h2>
              <div className="mt-4 grid gap-4">
                {pendingStories.map((entry) => (
                  <article key={entry.id} className="rounded-sm border border-border bg-card p-5">
                    <p className="font-display text-lg">{entry.name}</p>
                    <p className="mt-2 leading-loose text-muted-foreground">{entry.message}</p>
                    <div className="mt-4 flex gap-3">
                      <button
                        className={btn}
                        onClick={() => moderateStory.mutate({ id: entry.id, approved: true })}
                      >
                        نشر
                      </button>
                      <button
                        className={btn}
                        onClick={() => moderateStory.mutate({ id: entry.id, approved: false })}
                      >
                        حذف
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-sm tracking-[0.25em] text-olive uppercase">
                Visitor videos · بانتظار المراجعة ({pendingVideos.length})
              </h2>
              <div className="mt-4 grid gap-4">
                {pendingVideos.map((video) => (
                  <article key={video.id} className="rounded-sm border border-border bg-card p-5">
                    <p className="font-display text-lg">{video.visitor_name}</p>
                    <a
                      href={video.video_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-2 block text-sm break-all text-olive hover:underline"
                    >
                      {video.video_url}
                    </a>
                    <div className="mt-4 flex gap-3">
                      <button
                        className={btn}
                        onClick={() => moderateVideo.mutate({ id: video.id, status: "approved" })}
                      >
                        قبول
                      </button>
                      <button
                        className={btn}
                        onClick={() => moderateVideo.mutate({ id: video.id, status: "rejected" })}
                      >
                        رفض
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
