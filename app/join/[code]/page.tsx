import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { getCurrentSessionUser } from "@/src/lib/auth/session";
import { SITE_ROUTES } from "@/src/config/routes";
import { joinGameAction } from "@/src/server/actions/prototype";

export const dynamic = "force-dynamic";

export default async function JoinGamePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { code } = await params;
  const { error } = await searchParams;
  const user = await getCurrentSessionUser();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-12 md:px-10">
      <section className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="app-surface border-white/70">
          <CardHeader className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Join Flow</p>
              <CardTitle className="font-[family-name:var(--font-heading)] text-5xl leading-none">Join Game {code}</CardTitle>
            </div>
            <CardDescription className="max-w-2xl text-base leading-7">
              Joining claims one open seat in the host&apos;s current prototype game. Role assignment happens after you join.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Use this route from a host-shared link or printed QR code. If the host preassigned your email to a character,
              you will be placed into that character automatically. Otherwise you will claim an open seat.
            </p>
            {user ? (
              <p>
                Signed in as <span className="font-medium text-foreground">{user.email ?? user.id}</span>
              </p>
            ) : (
              <p>You need to sign in before the join can attach to your player seat.</p>
            )}
          </CardContent>
        </Card>
        <Card className="app-surface border-white/70">
          <CardHeader>
            <CardTitle>Join This Game</CardTitle>
            <CardDescription>
              One seat per authenticated user. Reserved character seats match by email first; otherwise the join falls back to any open seat.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground">
                {error}
              </div>
            ) : null}
            {user ? (
              <form action={joinGameAction}>
                <input name="code" type="hidden" value={code} />
                <Button size="lg" type="submit">
                  Claim Seat
                </Button>
              </form>
            ) : (
              <Link className="inline-flex" href={`${SITE_ROUTES.login}?next=${encodeURIComponent(SITE_ROUTES.join(code))}`}>
                <Button size="lg">Sign In To Join</Button>
              </Link>
            )}
            <Link className="block text-sm font-medium text-primary" href={SITE_ROUTES.hostHome}>
              View host controls
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
