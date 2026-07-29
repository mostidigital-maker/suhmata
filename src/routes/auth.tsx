import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { ensureProfile, signInWithPassword, signUpWithPassword } from "@/services/auth";

const title = "دخول الإدارة | Association access";
const description =
  "صفحة دخول فريق جمعية أهالي القرية لإدارة محتوى الأرشيف. Sign-in page for the village heritage association team.";

export const Route = createFileRoute("/auth")({
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
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        await signInWithPassword(email, password);
        await ensureProfile();
        navigate({ to: "/admin", replace: true });
      } else {
        await signUpWithPassword(email, password, fullName);
        toast.success("Check your inbox to confirm your email.");
      }
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    await ensureProfile();
    navigate({ to: "/admin", replace: true });
  };

  const inputClass =
    "w-full rounded-sm border border-border bg-card px-4 py-3 text-sm focus:border-accent focus:outline-none";

  return (
    <main className="paper-grain grid min-h-screen place-items-center bg-secondary px-5 py-16">
      <Toaster position="top-center" />
      <div className="w-full max-w-md rounded-sm border border-border bg-card p-8">
        <h1 className="font-display text-2xl font-semibold">
          {mode === "signin" ? "دخول الإدارة · Sign in" : "حساب جديد · Create account"}
        </h1>
        <p className="mt-2 text-sm leading-loose text-muted-foreground">
          مساحة خاصة بفريق الجمعية لإدارة محتوى الأرشيف.
        </p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          {mode === "signup" ? (
            <input
              className={inputClass}
              placeholder="الاسم الكامل · Full name"
              maxLength={120}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          ) : null}
          <input
            className={inputClass}
            type="email"
            required
            maxLength={255}
            placeholder="البريد الإلكتروني · Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={inputClass}
            type="password"
            required
            minLength={8}
            maxLength={72}
            placeholder="كلمة المرور · Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-accent px-7 py-3 text-sm font-medium text-accent-foreground disabled:opacity-60"
          >
            {mode === "signin" ? "دخول · Sign in" : "إنشاء حساب · Sign up"}
          </button>
        </form>

        <button
          type="button"
          onClick={onGoogle}
          className="mt-3 w-full rounded-full border border-border px-7 py-3 text-sm font-medium transition-colors hover:border-accent"
        >
          المتابعة عبر Google · Continue with Google
        </button>

        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            type="button"
            className="text-olive hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "إنشاء حساب جديد" : "لدي حساب بالفعل"}
          </button>
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            العودة للموقع
          </Link>
        </div>
      </div>
    </main>
  );
}
