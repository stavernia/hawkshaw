"use client";

import { useMemo, useState, useTransition } from "react";
import { Chrome, Mail } from "lucide-react";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/browser";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { SITE_ROUTES } from "@/src/config/routes";

export function AuthForm({ nextPath }: { nextPath: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);

  const redirectTo = typeof window === "undefined"
    ? undefined
    : `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;

  const handleGoogleSignIn = () => {
    startTransition(async () => {
      setStatus(null);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        setStatus(error.message);
      }
    });
  };

  const handleMagicLink = () => {
    startTransition(async () => {
      setStatus(null);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        setStatus(error.message);
        return;
      }

      setStatus("Magic link sent. Check your email on this device to continue.");
      window.location.assign(SITE_ROUTES.checkEmail);
    });
  };

  return (
    <Card className="app-surface border-white/70 shadow-[0_28px_80px_-52px_rgba(18,27,33,0.55)]">
      <CardHeader className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Hawkshaw access</p>
          <CardTitle className="font-[family-name:var(--font-heading)] text-4xl leading-none">
            Enter the mystery.
          </CardTitle>
        </div>
        <CardDescription className="leading-6">
          The scaffold uses Supabase Auth with Google OAuth and email magic links. Passwords are
          intentionally deferred to keep sign-in light for game night.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Button type="button" variant="secondary" className="w-full gap-2" disabled={isPending} onClick={handleGoogleSignIn}>
          <Chrome className="h-4 w-4" />
          Continue with Google
        </Button>
        <div className="grid gap-2">
          <Label htmlFor="email">Email magic link</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Button type="button" className="w-full gap-2" disabled={isPending || email.length === 0} onClick={handleMagicLink}>
          <Mail className="h-4 w-4" />
          Send sign-in link
        </Button>
        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Protected routes currently gate the host and player shells. Join and room routes remain open
        placeholders for the MVP systems pass.
      </CardFooter>
    </Card>
  );
}
