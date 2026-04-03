import { getCurrentSessionUser } from "@/src/lib/auth/session";
import { TeaserLandingScene } from "@/src/components/marketing/teaser-landing-scene";

export default async function HomePage() {
  const user = await getCurrentSessionUser();

  return <TeaserLandingScene isSignedIn={!!user} />;
}
