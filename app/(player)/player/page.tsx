import { PlaceholderShell } from "@/src/components/layout/placeholder-shell";
import { getCurrentUser } from "@/src/lib/auth/session";

export default async function PlayerPage() {
  const user = await getCurrentUser();

  return (
    <PlaceholderShell
      eyebrow="Player shell"
      title="Player dashboard placeholder"
      description="This route is ready for role info, goals, clues, inventory, actions remaining, and accusation flow."
      summary={[
        "Assume players use low-friction account-based access.",
        "Keep the information architecture phase-aware and mobile-first.",
        "Use separate screens for role, goals, clues, inventory, players, and accusations in the MVP pass.",
      ]}
      callout={`Signed in as ${user?.email ?? "player@example.com"}`}
    />
  );
}

