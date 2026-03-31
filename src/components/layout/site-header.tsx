import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { SITE_ROUTES } from "@/src/config/routes";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 md:px-10">
      <Link href={SITE_ROUTES.marketingHome} className="space-y-1">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Hawkshaw</p>
        <p className="font-[family-name:var(--font-heading)] text-3xl leading-none text-foreground">
          Live mystery engine
        </p>
      </Link>
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost">
          <Link href={SITE_ROUTES.hostHome}>Host</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href={SITE_ROUTES.login}>Sign in</Link>
        </Button>
      </div>
    </header>
  );
}

