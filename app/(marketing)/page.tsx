import Link from "next/link";
import { ArrowRight, DoorOpen, Drama, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { SITE_ROUTES } from "@/src/config/routes";

const pillars = [
  {
    title: "Host once, run cleanly",
    description:
      "Keep setup, player assignment, phase changes, and reveal flow in one calm operational surface.",
    icon: ShieldCheck,
  },
  {
    title: "Send players into the room",
    description:
      "QR-linked spaces, private clues, limited actions, and changing motives push the game back into face-to-face play.",
    icon: DoorOpen,
  },
  {
    title: "Support social chaos",
    description:
      "Players can bargain, investigate, accuse, and improvise while the app keeps state coherent underneath them.",
    icon: Users,
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-24 pt-12 md:px-10 md:pt-20">
      <section className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
            <Drama className="h-4 w-4 text-primary" />
            New scaffold foundation for live social mystery games
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl font-[family-name:var(--font-heading)] text-5xl leading-none tracking-tight text-foreground md:text-7xl">
              Hawkshaw runs the secrets while players run the room.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
              This scaffold sets up the host, player, auth, join, and room entry surfaces for a
              modern in-person mystery app without locking in the game logic too early.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2 rounded-full px-7">
              <Link href={SITE_ROUTES.login}>
                Sign in to the scaffold
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="rounded-full px-7">
              <Link href={SITE_ROUTES.hostHome}>View route shells</Link>
            </Button>
          </div>
        </div>
        <Card className="app-surface border-white/60 shadow-[0_30px_80px_-45px_rgba(18,27,33,0.55)]">
          <CardHeader>
            <CardTitle>Scaffold focus</CardTitle>
            <CardDescription>Built for the next MVP pass, not the full game system yet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border bg-white/75 p-4">
              Route groups for marketing, auth, player, host, join, and room entry.
            </div>
            <div className="rounded-2xl border bg-white/75 p-4">
              Supabase Auth with Google + email magic link, plus Prisma and env validation.
            </div>
            <div className="rounded-2xl border bg-white/75 p-4">
              Domain-ready placeholders for games, players, rooms, items, clues, goals, and decisions.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {pillars.map(({ title, description, icon: Icon }) => (
          <Card key={title} className="app-surface border-white/65">
            <CardHeader className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <CardTitle>{title}</CardTitle>
                <CardDescription className="text-sm leading-6">{description}</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 rounded-[2rem] border border-white/70 bg-white/75 p-8 shadow-sm md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Ready surfaces</p>
          <h2 className="font-[family-name:var(--font-heading)] text-4xl leading-none">Move into the app shells.</h2>
          <p className="max-w-xl text-muted-foreground">
            Each area is intentionally thin, but the route and service boundaries are already in place
            for the MVP systems pass.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Button asChild variant="secondary" className="justify-between rounded-2xl px-5 py-6">
            <Link href={SITE_ROUTES.hostHome}>Host area</Link>
          </Button>
          <Button asChild variant="secondary" className="justify-between rounded-2xl px-5 py-6">
            <Link href={SITE_ROUTES.playerHome}>Player area</Link>
          </Button>
          <Button asChild variant="secondary" className="justify-between rounded-2xl px-5 py-6">
            <Link href={SITE_ROUTES.join("demo-room")}>Join flow</Link>
          </Button>
          <Button asChild variant="secondary" className="justify-between rounded-2xl px-5 py-6">
            <Link href={SITE_ROUTES.room("salon")}>Room route</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
