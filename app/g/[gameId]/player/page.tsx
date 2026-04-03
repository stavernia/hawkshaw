import { notFound } from "next/navigation";
import { PlayerDashboardClient, type PlayerTab } from "@/src/components/player/player-dashboard-client";
import { requireCurrentSessionUser } from "@/src/lib/auth/session";
import { SITE_ROUTES } from "@/src/config/routes";
import { getPlayerDashboardForUser } from "@/src/server/services/prototype";

export const dynamic = "force-dynamic";

const PLAYER_TABS = [
  { key: "overview", label: "Overview" },
  { key: "goals", label: "Goals" },
  { key: "characters", label: "Characters" },
  { key: "inventory", label: "Inventory" },
  { key: "actions", label: "Actions" },
  { key: "rooms", label: "Rooms" },
  { key: "finale", label: "Finale" },
] as const;

function getTab(tab?: string): PlayerTab {
  if (tab === "character") {
    return "goals";
  }

  if (tab === "players") {
    return "characters";
  }

  if (tab === "evidence") {
    return "inventory";
  }

  if (PLAYER_TABS.some((entry) => entry.key === tab)) {
    return tab as PlayerTab;
  }

  return "overview";
}

export default async function GamePlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ as?: string; tab?: string }>;
}) {
  const { gameId } = await params;
  const { as, tab } = await searchParams;
  const currentTab = getTab(tab);
  const user = await requireCurrentSessionUser(SITE_ROUTES.gamePlayer(gameId));
  const dashboard = await getPlayerDashboardForUser(user.id, gameId, as);

  if (!dashboard) {
    notFound();
  }

  return <PlayerDashboardClient currentTab={currentTab} dashboard={dashboard} />;
}
