import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in | Harun Chaudhari" },
      { name: "description", content: "Sign in to manage the academic portfolio of Harun Chaudhari." },
      { property: "og:title", content: "Sign in | Harun Chaudhari" },
      { property: "og:description", content: "Administrator access for the academic portfolio." },
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/admin", replace: true });
        else setNotice("Check your inbox to confirm your email address, then sign in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result?.error) setError(result.error.message);
    else if (!result?.redirected) navigate({ to: "/admin", replace: true });
  };

  return (
    <div className="grid min-h-screen place-items-center bg-secondary px-5 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="size-4" /> Back to the site
        </Link>
        <div className="border border-border bg-card p-8 shadow-sm sm:p-10">
          <span className="grid size-10 place-items-center border border-border font-serif text-sm font-bold text-primary">HC</span>
          <h1 className="mt-6 font-serif text-3xl">{mode === "signin" ? "Administrator sign in" : "Create an account"}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Manage the biography, research, teaching, resources, and messages of this portfolio.
          </p>

          <form onSubmit={submit} className="mt-8 grid gap-4">
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border border-border bg-background px-4 outline-none transition-colors focus:border-accent"
                placeholder="you@example.com"
              />
            </label>
            <label className="grid gap-2 text-sm">
              <span className="text-muted-foreground">Password</span>
              <input
                required
                minLength={6}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border border-border bg-background px-4 outline-none transition-colors focus:border-accent"
                placeholder="••••••••"
              />
            </label>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-primary">{notice}</p>}
            <Button type="submit" size="lg" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {mode === "signin" ? "Sign in" : "Sign up"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <Button variant="outline" size="lg" className="w-full" onClick={google}>
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "No account yet?" : "Already registered?"}{" "}
            <button
              type="button"
              className="font-semibold text-primary underline-offset-4 hover:underline"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setError(null);
                setNotice(null);
              }}
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
