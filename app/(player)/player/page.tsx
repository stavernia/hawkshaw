import { redirect } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { requireCurrentSessionUser } from "@/src/lib/auth/session";
import { SITE_ROUTES } from "@/src/config/routes";
import { getLatestPlayerGameIdForUser } from "@/src/server/services/prototype";

export const dynamic = "force-dynamic";

export default async function PlayerHomeRedirectPage() {
  const user = await requireCurrentSessionUser("/player");
  const gameId = await getLatestPlayerGameIdForUser(user.id);

  if (gameId) {
    redirect(SITE_ROUTES.gamePlayer(gameId));
  }

  return (
    <section className="grid gap-6">
      <Card className="app-surface border-white/70">
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Player Dashboard</p>
          <CardTitle className="font-[family-name:var(--font-heading)] text-5xl leading-none">
            No Active Game Yet
          </CardTitle>
          <CardDescription className="max-w-2xl text-base leading-7">
            Join a host game code first. Once your seat is claimed, you will be redirected into that game&apos;s player dashboard.
          </CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
}
