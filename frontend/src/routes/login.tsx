import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";
import { getDashboardRoute } from "@/utils/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Vargani CMS" },
      { name: "description", content: "Sign in to manage Ganpati vargani collections and receipts." },
      { property: "og:title", content: "Sign in — Vargani CMS" },
      { property: "og:description", content: "Secure access to the Ganpati collection dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: getDashboardRoute(user?.role), replace: true });
    }
  }, [isAuthenticated, user?.role, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!identifier.trim() || !password) {
      setError("Enter your username, email or phone number, and password.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const user = await login({ identifier: identifier.trim(), password });
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`);
      
      if (user.mustChangePassword) {
        navigate({ to: "/change-password", replace: true });
      } else {
        navigate({ to: getDashboardRoute(user.role), replace: true });
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Unable to sign in.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-primary/8 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-secondary/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex shrink-0 items-center justify-center size-11 rounded-xl overflow-hidden bg-primary/10">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">Vargani CMS</p>
            <p className="text-xs text-muted-foreground">Ganpati Collection Ledger</p>
          </div>
        </div>
        <div className="relative max-w-md space-y-4">
          <h2 className="font-display text-4xl font-semibold leading-tight text-foreground">
            Every donation, recorded with devotion.
          </h2>
          <p className="text-sm text-muted-foreground">
            Digital receipts, building-wise ledgers and live analytics — built for mandal
            volunteers who collect on the ground.
          </p>
        </div>
        <p className="relative text-xs text-muted-foreground">
          गणपती बाप्पा मोरया · Secure, audited and always in sync.
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex shrink-0 items-center justify-center size-10 rounded-xl overflow-hidden bg-primary/10">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <p className="font-display text-lg font-semibold">Vargani CMS</p>
          </div>

          <Card className="card-elevated">
            <CardContent className="p-6 sm:p-8">
              <h1 className="font-display text-2xl font-semibold text-foreground">Sign in</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Use your registered username, email, or phone number.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="identifier">Username / Email / Phone</Label>
                  <Input
                    id="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="Enter username, email or phone number"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    maxLength={120}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      maxLength={128}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((previous) => !previous)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {error ? (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {error}
                  </p>
                ) : null}

                <Button type="submit" className="w-full active:scale-95" disabled={submitting}>
                  {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
                  {submitting ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}