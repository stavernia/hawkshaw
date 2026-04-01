import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { getCurrentSessionUser } from "@/src/lib/auth/session";
import { SITE_ROUTES } from "@/src/config/routes";
import { getLatestPlayerGameIdForUser } from "@/src/server/services/prototype";

export const dynamic = "force-dynamic";

export default async function LegacyRoomRedirectPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const user = await getCurrentSessionUser();

  if (!user) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-12 md:px-10">
        <Card className="app-surface w-full border-white/70">
          <CardHeader>
            <CardTitle className="font-[family-name:var(--font-heading)] text-4xl">Sign In To Use Room Actions</CardTitle>
            <CardDescription className="text-base leading-7">
              Room actions are tied to your authenticated player seat. Sign in, then reopen this room link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="font-medium text-primary" href={`${SITE_ROUTES.login}?next=${encodeURIComponent(SITE_ROUTES.room(code))}`}>
              Go to login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const gameId = await getLatestPlayerGameIdForUser(user.id);

  if (gameId) {
    redirect(SITE_ROUTES.gameRoom(gameId, code));
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-12 md:px-10">
      <Card className="app-surface w-full border-white/70">
        <CardHeader>
          <CardTitle className="font-[family-name:var(--font-heading)] text-4xl">No Active Game Found</CardTitle>
          <CardDescription className="text-base leading-7">
            Join a game first so Hawkshaw knows which game this room route should open.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
