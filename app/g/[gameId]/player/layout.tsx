import { notFound } from "next/navigation";
import { AppShellHeader } from "@/src/components/layout/app-shell-header";
import { SITE_ROUTES } from "@/src/config/routes";
import { requireCurrentUser } from "@/src/lib/auth/session";
import { getPlayerDashboardForUser } from "@/src/server/services/prototype";

function formatStageLabel(stage: string) {
  switch (stage) {
    case "setup":
      return "Setup";
    case "act-1":
      return "Act 1";
    case "event-1":
      return "Event 1";
    case "act-2":
      return "Act 2";
    case "finale":
      return "Finale";
    case "resolution":
      return "Resolution";
    default:
      return stage;
  }
}

export default async function ScopedPlayerLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ gameId: string }> }>) {
  const { gameId } = await params;
  const user = await requireCurrentUser(SITE_ROUTES.gamePlayer(gameId));
  const dashboard = await getPlayerDashboardForUser(user.id, gameId);

  if (!dashboard) {
    notFound();
  }

  const userLabel = user.user_metadata?.name?.toString().trim() || user.email || "Hawkshaw User";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-4 py-4 md:gap-8 md:px-10 md:py-6">
      <AppShellHeader
        userLabel={userLabel}
        userSubLabel={user.email}
        lobbyHref={SITE_ROUTES.playerHome}
        scenarioTitle={dashboard.scenarioTitle}
        stageLabel={formatStageLabel(dashboard.stage)}
      />
      {children}
    </div>
  );
}
