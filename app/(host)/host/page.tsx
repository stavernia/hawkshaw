import { PlaceholderShell } from "@/src/components/layout/placeholder-shell";
import { getCurrentUser } from "@/src/lib/auth/session";

export default async function HostPage() {
  const user = await getCurrentUser();

  return (
    <PlaceholderShell
      eyebrow="Operational shell"
      title="Host area scaffold"
      description="This route is ready for game setup, room QR generation, phase controls, and reveal operations."
      summary={[
        "Create and run a single hosted game for the MVP.",
        "Keep host controls explicit and phase-based.",
        "Defer monitoring dashboards, realtime sync, and advanced admin workflows.",
      ]}
      callout={`Signed in as ${user?.email ?? "host@example.com"}`}
    />
  );
}

