import Link from "next/link";
import { SignOutButton } from "@/src/components/auth/sign-out-button";
import { SITE_ROUTES } from "@/src/config/routes";

export default async function ScopedHostLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ gameId: string }> }>) {
  const { gameId } = await params;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-6 md:px-10">
      <header className="app-surface flex items-center justify-between rounded-[1.75rem] border border-white/70 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Hawkshaw</p>
          <h1 className="font-[family-name:var(--font-heading)] text-3xl">Host Control</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link className="text-sm text-muted-foreground transition hover:text-foreground" href={SITE_ROUTES.gamePlayer(gameId)}>
            Player area
          </Link>
          <Link className="text-sm text-muted-foreground transition hover:text-foreground" href={SITE_ROUTES.hostHome}>
            All games
          </Link>
          <SignOutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
