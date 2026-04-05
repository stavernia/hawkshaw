import { notFound } from "next/navigation";
import { AppShellHeader } from "@/src/components/layout/app-shell-header";
import { SITE_ROUTES } from "@/src/config/routes";
import { requireCurrentUser } from "@/src/lib/auth/session";
import { getHostGameDetailForGame } from "@/src/server/services/prototype";

function formatStageLabel(stage: string) {
  return stage.replace("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function ScopedHostLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ gameId: string }> }>) {
  const { gameId } = await params;
  const user = await requireCurrentUser(SITE_ROUTES.gameHost(gameId));
  const hostGame = await getHostGameDetailForGame(user.id, gameId);

  if (!hostGame) {
    notFound();
  }

  const userLabel = user.user_metadata?.name?.toString().trim() || user.email || "Hawkshaw User";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-4 md:gap-8 md:px-10 md:py-6">
      <AppShellHeader
        userLabel={userLabel}
        userSubLabel={user.email}
        lobbyHref={SITE_ROUTES.hostHome}
        scenarioTitle={hostGame.game.scenarioTitle}
        stageLabel={formatStageLabel(hostGame.game.currentStage)}
      />
      {children}
    </div>
  );
}
