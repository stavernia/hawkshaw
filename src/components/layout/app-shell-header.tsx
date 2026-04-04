import Image from "next/image";
import Link from "next/link";
import { SITE_ROUTES } from "@/src/config/routes";
import { SignOutButton } from "@/src/components/auth/sign-out-button";

function getInitial(label: string) {
  return label.trim().charAt(0).toUpperCase() || "H";
}

type AppShellHeaderProps = {
  userLabel: string;
  userSubLabel?: string;
  lobbyHref: string;
  actionHref?: string;
  actionLabel?: string;
  scenarioTitle?: string;
  stageLabel?: string;
};

export function AppShellHeader({
  userLabel,
  userSubLabel,
  lobbyHref,
  actionHref,
  actionLabel,
  scenarioTitle,
  stageLabel,
}: AppShellHeaderProps) {
  return (
    <header className="app-surface relative z-50 rounded-[1.5rem] border border-white/70 px-3 py-3 sm:px-5 sm:py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link className="shrink-0" href={SITE_ROUTES.marketingHome}>
            <Image
              src="/hawkshaw_logo_black.png"
              alt="Hawkshaw logo"
              width={678}
              height={435}
              className="h-10 w-auto opacity-80 sm:h-11"
            />
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Hawkshaw</p>
            {scenarioTitle ? <p className="mt-1 text-lg font-medium leading-tight text-foreground sm:text-xl">{scenarioTitle}</p> : null}
            {stageLabel ? <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stageLabel}</p> : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {actionHref && actionLabel ? (
          <Link href={actionHref}>
            <span className="inline-flex h-9 items-center justify-center rounded-full border border-input bg-background/70 px-3 text-[13px] font-medium text-foreground">
              {actionLabel}
            </span>
          </Link>
        ) : null}

        <details className="group relative z-50">
          <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-input bg-background/80 text-sm font-semibold text-foreground shadow-sm transition hover:bg-accent hover:text-accent-foreground sm:h-10 sm:w-10">
            {getInitial(userLabel)}
          </summary>
          <div className="absolute right-0 z-[60] mt-2 w-52 rounded-2xl border border-white/70 bg-background/95 p-2 shadow-[0_18px_48px_-24px_rgba(18,27,33,0.45)] backdrop-blur sm:w-56">
            <div className="border-b border-border px-3 py-2">
              <p className="truncate text-sm font-medium text-foreground">{userLabel}</p>
              {userSubLabel ? <p className="truncate text-xs text-muted-foreground">{userSubLabel}</p> : null}
            </div>
            <div className="grid gap-1 px-1 py-2">
              <Link
                className="rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-accent hover:text-accent-foreground"
                href={lobbyHref}
              >
                Lobby
              </Link>
              <SignOutButton className="w-full justify-start rounded-xl border-0 bg-transparent px-3 py-2 shadow-none hover:bg-accent" />
            </div>
          </div>
        </details>
      </div>
      </div>
    </header>
  );
}
