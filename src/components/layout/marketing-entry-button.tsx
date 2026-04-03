import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { SITE_ROUTES } from "@/src/config/routes";

export function MarketingEntryButton({ isSignedIn }: { isSignedIn: boolean }) {
  return (
    <Button
      asChild
      variant="outline"
      className="rounded-full border-white/15 bg-white/[0.03] px-4 text-stone-100 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm hover:bg-white/[0.08] hover:text-white"
    >
      <Link href={isSignedIn ? SITE_ROUTES.playerHome : SITE_ROUTES.login}>
        {isSignedIn ? "Open App" : "Sign In"}
      </Link>
    </Button>
  );
}
