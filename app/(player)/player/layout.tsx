import { AppShellHeader } from "@/src/components/layout/app-shell-header";
import { SITE_ROUTES } from "@/src/config/routes";
import { getCurrentSessionUser } from "@/src/lib/auth/session";

export default async function PlayerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentSessionUser();
  const userLabel = user?.user_metadata?.name?.toString().trim() || user?.email || "Hawkshaw User";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-4 py-4 md:gap-8 md:px-10 md:py-6">
      <AppShellHeader
        userLabel={userLabel}
        userSubLabel={user?.email}
        lobbyHref={SITE_ROUTES.playerHome}
        scenarioTitle="Player Lobby"
      />
      {children}
    </div>
  );
}
