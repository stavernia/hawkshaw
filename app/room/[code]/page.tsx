import { PlaceholderShell } from "@/src/components/layout/placeholder-shell";

export default async function RoomEntryPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-12 md:px-10">
      <PlaceholderShell
        eyebrow="QR room route"
        title={`Room entry placeholder: ${code}`}
        description="This route is reserved for mobile web QR scans that open room-specific actions and context."
        summary={[
          "Assume QR routes resolve to simple web URLs for the MVP.",
          "Prepare for room actions such as Search Room and Eavesdrop.",
          "Defer advanced device or PWA-specific behaviors.",
        ]}
      />
    </div>
  );
}

