import { PlaceholderShell } from "@/src/components/layout/placeholder-shell";

export default async function JoinGamePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-12 md:px-10">
      <PlaceholderShell
        eyebrow="Join flow"
        title={`Join game code: ${code}`}
        description="This placeholder route will later connect invite links, pre-game identity confirmation, and role-aware entry."
        summary={[
          "Accept simple shareable join codes.",
          "Keep the entry flow mobile-friendly and resilient to accidental logouts.",
          "Defer final invite, assignment, and roster reconciliation logic.",
        ]}
      />
    </div>
  );
}

